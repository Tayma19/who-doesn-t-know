import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { AskQuestionDto } from './dto/ask-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { advanceTurn, shouldEnterDecision, resolveDecision } from './rules';
import { SubmitDecisionDto } from './dto/submit-decision.dto';

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
}
