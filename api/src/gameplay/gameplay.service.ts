import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Question, QuestionDocument } from './schemas/question.schema';
import { AskQuestionDto } from './dto/ask-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { SubmitDecisionDto } from './dto/submit-decision.dto';
import {
  advanceTurn,
  shouldEnterDecision,
  resolveDecision,
  resolveVotes,
  decideWinner,
} from './rules';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { Game, GameDocument } from '../games/schemas/game.schema';

@Injectable()
export class GameplayService {
  private readonly logger = new Logger(GameplayService.name);

  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async askQuestion(roomCode: string, dto: AskQuestionDto) {
    const game = await this.gameModel.findOne({ roomCode });

    if (!game) {
      throw new NotFoundException(`Game with roomCode ${roomCode} not found.`);
    }

    if (game.status !== 'questioning') {
      throw new ConflictException('Game is not in questioning phase.');
    }

    if (game.players[game.currentTurnIndex] !== dto.playerId) {
      throw new ConflictException('It is not your turn to ask.');
    }

    if (dto.playerId === dto.targetRef) {
      throw new ConflictException('You cannot ask yourself.');
    }

    if (!game.players.includes(dto.targetRef)) {
      throw new ConflictException('Target player is not in this game.');
    }

    if (game.pendingQuestionId) {
      throw new ConflictException('There is already a pending question.');
    }

    const question = new this.questionModel({
      gameId: game._id,
      round: game.roundNumber,
      askerRef: dto.playerId,
      targetRef: dto.targetRef,
      text: dto.text,
    });

    const savedQuestion = await question.save();

    game.pendingQuestionId = savedQuestion._id as Types.ObjectId;
    await game.save();

    this.logger.log(
      `Game ${roomCode}: Player ${dto.playerId} asked ${dto.targetRef}`,
    );

    return { ok: true };
  }

  async answerQuestion(
    roomCode: string,
    questionId: string,
    dto: AnswerQuestionDto,
  ) {
    const game = await this.gameModel.findOne({ roomCode });
    if (!game) {
      throw new NotFoundException(`Game with roomCode ${roomCode} not found.`);
    }

    const question = await this.questionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    if (String(game.pendingQuestionId) !== String(question._id)) {
      throw new ConflictException('This question is not pending.');
    }

    if (question.targetRef !== dto.playerId) {
      throw new ConflictException(
        'Only the target player can answer this question.',
      );
    }

    question.answer = dto.text;
    await question.save();

    game.pendingQuestionId = null;

    const { currentTurnIndex, turnsCompletedInRound, roundCompleted } =
      advanceTurn(
        game.currentTurnIndex,
        game.turnsCompletedInRound,
        game.players.length,
      );

    game.currentTurnIndex = currentTurnIndex;
    game.turnsCompletedInRound = turnsCompletedInRound;

    if (roundCompleted) {
      this.logger.log(`Game ${roomCode}: Round ${game.roundNumber} completed.`);
      if (shouldEnterDecision(game.roundNumber)) {
        game.status = 'round_decision';
        game.currentDecisions = [];
      } else {
        game.roundNumber += 1;
      }
    }

    await game.save();

    return { ok: true };
  }
  async submitDecision(roomCode: string, dto: SubmitDecisionDto) {
    const game = await this.gameModel.findOne({ roomCode });
    if (!game) {
      throw new NotFoundException(`Game with roomCode ${roomCode} not found.`);
    }
    if (game.status !== 'round_decision') {
      throw new ConflictException('Game is not in decision phase.');
    }
    if (!game.players.includes(dto.playerId)) {
      throw new ConflictException('Player is not in this game.');
    }
    const alreadyDecided = game.currentDecisions.some(
      (d) => d.playerId === dto.playerId,
    );
    if (alreadyDecided) {
      throw new ConflictException('You have already submitted your decision.');
    }

    game.currentDecisions.push({ playerId: dto.playerId, choice: dto.choice });
    this.logger.log(
      `Game ${roomCode}: Player ${dto.playerId} decided to ${dto.choice}`,
    );

    if (game.currentDecisions.length === game.players.length) {
      const choices = game.currentDecisions.map((d) => d.choice);

      const outcome = resolveDecision(choices);
      game.lastDecisionOutcome = outcome;

      this.logger.log(`Game ${roomCode}: Decision outcome is ${outcome}`);

      if (outcome === 'vote') {
        game.status = 'voting';
      } else {
        game.status = 'questioning';
        game.roundNumber += 1;
        game.decisionNumber += 1;
      }

      game.currentDecisions = [];
    }

    await game.save();

    return { ok: true };
  }
  async submitVote(roomCode: string, dto: SubmitVoteDto) {
    const game = await this.gameModel.findOne({ roomCode });
    if (!game) {
      throw new NotFoundException(`Game with roomCode ${roomCode} not found.`);
    }

    if (game.status !== 'voting') {
      throw new ConflictException('Game is not in voting phase.');
    }

    if (!game.players.includes(dto.playerId)) {
      throw new ConflictException('You are not in this game.');
    }
    if (!game.players.includes(dto.suspectRef)) {
      throw new ConflictException('Suspect is not in this game.');
    }

    const alreadyVoted = game.currentVotes.some(
      (v) => v.voterRef === dto.playerId,
    );
    if (alreadyVoted) {
      throw new ConflictException('You have already voted.');
    }

    if (game.lastVoteTie && game.lastVoteTie.length > 0) {
      if (!game.lastVoteTie.includes(dto.suspectRef)) {
        throw new ConflictException('You can only vote for the tied players.');
      }
    }

    game.currentVotes.push({
      voterRef: dto.playerId,
      suspectRef: dto.suspectRef,
    });
    this.logger.log(
      `Game ${roomCode}: Player ${dto.playerId} voted for ${dto.suspectRef}`,
    );

    if (game.currentVotes.length === game.players.length) {
      const outcome = resolveVotes(game.currentVotes);

      if ('accusedRef' in outcome) {
        const winner = decideWinner(outcome.accusedRef, game.hiddenPlayerRef);

        game.status = 'finished';
        game.accusedRef = outcome.accusedRef;
        game.winner = winner;

        this.logger.log(
          `Game ${roomCode} finished! Accused: ${outcome.accusedRef}, Winner: ${winner}`,
        );
      } else if ('tiedRefs' in outcome) {
        game.lastVoteTie = outcome.tiedRefs;
        game.currentVotes = [];
        game.votingNumber += 1;
        this.logger.log(
          `Game ${roomCode} vote tied between: ${outcome.tiedRefs.join(', ')}`,
        );
      }
    }

    await game.save();

    return { ok: true };
  }
}
