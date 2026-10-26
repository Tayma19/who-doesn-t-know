import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../games/schemas/game.schema';
import { Player, PlayerDocument } from '../games/schemas/player.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { RoundDecision, RoundDecisionDocument } from './schemas/round-decision.schema';
import { SuspectVote, SuspectVoteDocument } from './schemas/suspect-vote.schema';

export interface GameDoc { id: number; decisionNumber: number; votingNumber: number; turnOrder: number[]; }
@Injectable()
export class GameplayReadService {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(RoundDecision.name) private readonly decisionModel: Model<RoundDecisionDocument>,
    @InjectModel(SuspectVote.name) private readonly voteModel: Model<SuspectVoteDocument>,
  ) {}
  async getLog(gameId: number) {
    const rows = await this.questionModel.find({ gameId }).sort({ id: 1 }).lean().exec();
    return rows.map((q) => ({ id: q.id, round: q.round, askerRef: q.askerRef, targetRef: q.targetRef, question: q.text, answer: q.answer ?? null }));
  }
  async getPendingQuestion(gameId: number): Promise<{ id: number; askerRef: number; targetRef: number; text: string } | null> {
    const game = await this.getGame(gameId);
    if (!game?.pendingQuestionId) return null;
    const q = await this.questionModel.findOne({ gameId, id: game.pendingQuestionId }).lean().exec();
    return q ? { id: q.id, askerRef: q.askerRef, targetRef: q.targetRef, text: q.text } : null;
  }
  async getDecisionProgress(game: Game & { id: number; decisionNumber: number }) {
    const [submittedCount, totalPlayers] = await Promise.all([
      this.decisionModel.countDocuments({ gameId: game.id, decisionNumber: game.decisionNumber }),
      this.getPlayerCount(game.id),
    ]);
    return { submittedCount, totalPlayers };
  }
  async getVotingProgress(game: Game & { id: number; votingNumber: number }) {
    const [submittedCount, totalPlayers] = await Promise.all([
      this.voteModel.countDocuments({ gameId: game.id, votingNumber: game.votingNumber }),
      this.getPlayerCount(game.id),
    ]);
    return { submittedCount, totalPlayers };
  }
  async getVoteCounts(gameId: number, votingNumber: number): Promise<{ ref: number; votes: number }[]> {
    const rows = await this.voteModel.aggregate<{ _id: number; votes: number }>([
      { $match: { gameId, votingNumber } }, { $group: { _id: '$suspectRef', votes: { $sum: 1 } } }, { $sort: { _id: 1 } },
    ]).exec();
    return rows.map((row) => ({ ref: row._id, votes: row.votes }));
  }
  async hasDecision(gameId: number, decisionNumber: number, playerRef: number): Promise<boolean> {
    return !!(await this.decisionModel.exists({ gameId, decisionNumber, playerRef }));
  }
  async hasVote(gameId: number, votingNumber: number, playerRef: number): Promise<boolean> {
    return !!(await this.voteModel.exists({ gameId, votingNumber, voterRef: playerRef }));
  }
  async getGame(gameId: number) { return this.gameModel.findOne({ id: gameId }).lean().exec(); }
  private async getPlayerCount(gameId: number) { return this.playerModel.countDocuments({ gameId }); }
}
