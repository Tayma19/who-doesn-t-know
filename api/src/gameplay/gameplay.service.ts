import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CounterService } from '../counters/counters.service';
import { Game, GameDocument } from '../games/schemas/game.schema';
import { Player, PlayerDocument } from '../games/schemas/player.schema';

import { AskQuestionDto } from './dto/ask-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { SubmitDecisionDto } from './dto/submit-decision.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';

import { Question, QuestionDocument } from './schemas/question.schema';
import {
  RoundDecision,
  RoundDecisionDocument,
} from './schemas/round-decision.schema';
import { SuspectVote, SuspectVoteDocument } from './schemas/suspect-vote.schema';

import {
  advanceTurn,
  decideWinner,
  resolveDecision,
  resolveVotes,
  shouldEnterDecision,
} from './rules';
import { GameplayReadService } from './gameplay-read.service';

@Injectable()
export class GameplayService {
  private readonly logger = new Logger(GameplayService.name);

  constructor(
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,

    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,

    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,

    @InjectModel(RoundDecision.name)
    private readonly decisionModel: Model<RoundDecisionDocument>,

    @InjectModel(SuspectVote.name)
    private readonly voteModel: Model<SuspectVoteDocument>,

    private readonly counter: CounterService,
    private readonly reads: GameplayReadService,
  ) {}


  private async loadGame(roomCode: string) {
    const game = await this.gameModel.findOne({
      roomCode: roomCode.trim().toUpperCase(),
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }
    if (game.status === 'finished') {
      throw new ConflictException('This game is finished.');
    }

    return game;
  }

  private async player(gameId: number, playerId: string) {
    const player = await this.playerModel.findOne({
      gameId,
      tempId: playerId,
    });

    if (!player) {
      throw new ConflictException('Player is not in this game.');
    }

    return player;
  }

  private async duplicateConflict(
    error: any,
    message: string,
  ): Promise<never> {
    if (error?.code === 11000) {
      throw new ConflictException(message);
    }
    throw error;
  }



  async askQuestion(roomCode: string, dto: AskQuestionDto) {
    const game = await this.loadGame(roomCode);

    if (game.status !== 'questioning') {
      throw new ConflictException('Game is not in questioning phase.');
    }
    if (game.pendingQuestionId !== null) {
      throw new ConflictException('There is already a pending question.');
    }

    const asker = await this.player(game.id, dto.playerId);

    if (game.turnOrder[game.currentTurnIndex] !== asker.id) {
      throw new ConflictException('It is not your turn to ask.');
    }
    if (asker.id === dto.targetRef) {
      throw new ConflictException('You cannot ask yourself.');
    }
    if (
      !(await this.playerModel.exists({
        gameId: game.id,
        id: dto.targetRef,
      }))
    ) {
      throw new ConflictException('Target player is not in this game.');
    }

    const id = await this.counter.next('questions');

    const question = await this.questionModel.create({
      id,
      gameId: game.id,
      round: game.roundNumber,
      askerRef: asker.id,
      targetRef: dto.targetRef,
      text: dto.text.trim(),
      answer: null,
      askedAt: new Date(),
    });

    const updated = await this.gameModel.updateOne(
      {
        id: game.id,
        status: 'questioning',
        pendingQuestionId: null,
        currentTurnIndex: game.currentTurnIndex,
        turnsCompletedInRound: game.turnsCompletedInRound,
      },
      { $set: { pendingQuestionId: id } },
    );

    if (!updated.modifiedCount) {
      await this.questionModel.deleteOne({ id });
      throw new ConflictException(
        'The game state changed. Refresh and try again.',
      );
    }

    this.logger.log(
      `Game ${game.roomCode}: question ${id} asked in round ${game.roundNumber}.`,
    );

    return { ok: true as const };
  }

  async answerQuestion(
    roomCode: string,
    questionId: number,
    dto: AnswerQuestionDto,
  ) {
    const game = await this.loadGame(roomCode);

    if (game.status !== 'questioning') {
      throw new ConflictException('Game is not in questioning phase.');
    }
    if (game.pendingQuestionId !== questionId) {
      throw new ConflictException('This question is not pending.');
    }

    const player = await this.player(game.id, dto.playerId);

    const question = await this.questionModel.findOne({
      gameId: game.id,
      id: questionId,
    });

    if (!question) {
      throw new NotFoundException('Question not found.');
    }
    if (question.targetRef !== player.id) {
      throw new ConflictException(
        'Only the target player can answer this question.',
      );
    }

    const saved = await this.questionModel.updateOne(
      { gameId: game.id, id: questionId, answer: null },
      { $set: { answer: dto.text.trim(), answeredAt: new Date() } },
    );

    if (!saved.modifiedCount) {
      throw new ConflictException('This question has already been answered.');
    }

    const next = advanceTurn(
      game.currentTurnIndex,
      game.turnsCompletedInRound,
      game.turnOrder.length,
    );

    const update: Record<string, unknown> = {
      pendingQuestionId: null,
      currentTurnIndex: next.currentTurnIndex,
      turnsCompletedInRound: next.turnsCompletedInRound,
    };

    if (next.roundCompleted) {
      this.logger.log(
        `Game ${game.roomCode}: round ${game.roundNumber} completed.`,
      );
      if (shouldEnterDecision(game.roundNumber)) {
        update.status = 'round_decision';
      } else {
        update.roundNumber = game.roundNumber + 1;
      }
    }

    const changed = await this.gameModel.updateOne(
      { id: game.id, status: 'questioning', pendingQuestionId: questionId },
      { $set: update },
    );

    if (!changed.modifiedCount) {
      throw new ConflictException(
        'The game state changed. Refresh and try again.',
      );
    }

    return { ok: true as const };
  }



  async submitDecision(roomCode: string, dto: SubmitDecisionDto) {
    const game = await this.loadGame(roomCode);

    if (game.status !== 'round_decision') {
      throw new ConflictException('Game is not in decision phase.');
    }

    const player = await this.player(game.id, dto.playerId);
    const id = await this.counter.next('round_decisions');

    try {
      await this.decisionModel.create({
        id,
        gameId: game.id,
        decisionNumber: game.decisionNumber,
        playerRef: player.id,
        choice: dto.choice,
      });
    } catch (error) {
      return this.duplicateConflict(
        error,
        'You have already submitted your decision.',
      );
    }

    const all = await this.decisionModel
      .find({ gameId: game.id, decisionNumber: game.decisionNumber })
      .lean()
      .exec();

    if (all.length >= game.turnOrder.length) {
      const outcome = resolveDecision(all.map((row) => row.choice));
      const continueCount = all.filter((r) => r.choice === 'continue').length;
      const voteCount = all.filter((r) => r.choice === 'vote').length;

      const update =
        outcome === 'vote'
          ? {
              status: 'voting',
              decisionNumber: game.decisionNumber + 1,
              lastDecisionOutcome: {
                round: game.roundNumber,
                continueCount,
                voteCount,
                result: outcome,
              },
            }
          : {
              status: 'questioning',
              roundNumber: game.roundNumber + 1,
              decisionNumber: game.decisionNumber + 1,
              lastDecisionOutcome: {
                round: game.roundNumber,
                continueCount,
                voteCount,
                result: outcome,
              },
            };

      const changed = await this.gameModel.updateOne(
        {
          id: game.id,
          status: 'round_decision',
          decisionNumber: game.decisionNumber,
        },
        { $set: update },
      );

      if (changed.modifiedCount) {
        this.logger.log(
          `Game ${game.roomCode}: round ${game.roundNumber} decision resolved as ${outcome}.`,
        );
      }
    }

    return { ok: true as const };
  }



  async submitVote(roomCode: string, dto: SubmitVoteDto) {
    const game = await this.loadGame(roomCode);

    if (game.status !== 'voting') {
      throw new ConflictException('Game is not in voting phase.');
    }

    const voter = await this.player(game.id, dto.playerId);

    if (voter.id === dto.suspectRef) {
      throw new ConflictException('You cannot vote for yourself.');
    }
    if (
      !(await this.playerModel.exists({
        gameId: game.id,
        id: dto.suspectRef,
      }))
    ) {
      throw new ConflictException('Suspect is not in this game.');
    }
    if (
      game.lastVoteTie?.tiedRefs?.length &&
      !game.lastVoteTie.tiedRefs.includes(dto.suspectRef)
    ) {
      throw new ConflictException('You can only vote for the tied players.');
    }

    const id = await this.counter.next('suspect_votes');

    try {
      await this.voteModel.create({
        id,
        gameId: game.id,
        votingNumber: game.votingNumber,
        voterRef: voter.id,
        suspectRef: dto.suspectRef,
      });
    } catch (error) {
      return this.duplicateConflict(error, 'You have already voted.');
    }

    const votes = await this.voteModel
      .find({ gameId: game.id, votingNumber: game.votingNumber })
      .lean()
      .exec();

    if (votes.length >= game.turnOrder.length) {
      const outcome = resolveVotes(
        votes.map((vote) => ({
          voterRef: vote.voterRef,
          suspectRef: vote.suspectRef,
        })),
      );

      if ('accusedRef' in outcome) {
        const winner = decideWinner(outcome.accusedRef, game.hiddenPlayerRef!);

        const changed = await this.gameModel.updateOne(
          { id: game.id, status: 'voting', votingNumber: game.votingNumber },
          {
            $set: {
              status: 'finished',
              accusedRef: outcome.accusedRef,
              winner,
            },
          },
        );

        if (changed.modifiedCount) {
          this.logger.log(
            `Game ${game.roomCode} finished: accused player ${outcome.accusedRef}; ${winner} players win.`,
          );
        }
      } else {
        const countsMap = new Map<number, number>();
        for (const vote of votes) {
          countsMap.set(
            vote.suspectRef,
            (countsMap.get(vote.suspectRef) ?? 0) + 1,
          );
        }

        const counts = [...countsMap.entries()]
          .map(([ref, count]) => ({ ref, votes: count }))
          .sort((a, b) => a.ref - b.ref);

        const changed = await this.gameModel.updateOne(
          { id: game.id, status: 'voting', votingNumber: game.votingNumber },
          {
            $set: {
              status: 'questioning',
              roundNumber: game.roundNumber + 1,
              lastVoteTie: { tiedRefs: outcome.tiedRefs, counts },
              votingNumber: game.votingNumber + 1,
              currentTurnIndex: 0,
              turnsCompletedInRound: 0,
            },
          },
        );

        if (changed.modifiedCount) {
          this.logger.log(
            `Game ${game.roomCode}: vote tied among ${outcome.tiedRefs.length} players; questioning resumes.`,
          );
        }
      }
    }

    return { ok: true as const };
  }
}