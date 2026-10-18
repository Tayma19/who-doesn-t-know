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
}
