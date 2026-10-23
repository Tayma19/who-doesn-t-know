import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameplayReadStub,
  PendingQuestionView,
  DecisionProgress,
  VotingProgress,
  VoteCount,
} from '../gameplay/gameplay-read.stub';
import { GameDocument } from './schemas/game.schema';
import { Player, PlayerDocument } from './schemas/player.schema';

export interface PublicPlayer {
  ref: number;
  displayName: string;
  isHost: boolean;
}

export interface PublicGameResult {
  winner: number | null;
  accusedRef: number | null;
  lastDecisionOutcome: string | null;
  lastVoteTie: boolean;
}

export interface PublicGameState {
  gameId: number;
  roomCode: string;
  status: string;
  roundNumber: number;
  players: PublicPlayer[];
  playersNeeded: number;
  currentPlayerRef: number | null;
  nextPlayerRef: number | null;
  turnsCompleted: number;
  turnsRemaining: number;
  log: unknown;
  pendingQuestion: PendingQuestionView | null;
  decisionProgress: DecisionProgress;
  votingProgress: VotingProgress;
  voteCounts: VoteCount[];
  result: PublicGameResult | null;
}

@Injectable()
export class StateBuilder {
  constructor(
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    private readonly gameplayRead: GameplayReadStub,
  ) {}

  async build(game: GameDocument): Promise<PublicGameState> {
    const players = await this.playerModel
      .find({ gameId: game.id })
      .sort({ id: 1 })
      .lean();

    const [log, pendingQuestion, decisionProgress, votingProgress, voteCounts] =
      await Promise.all([
        this.gameplayRead.getLog(game.id),
        this.gameplayRead.getPendingQuestion(game.id),
        this.gameplayRead.getDecisionProgress(game),
        this.gameplayRead.getVotingProgress(game),
        this.gameplayRead.getVoteCounts(game.id, game.votingNumber),
      ]);

    const turnCount = game.turnOrder.length;
    const hasTurnOrder = turnCount > 0;
    const currentTurnIndex = hasTurnOrder
      ? game.currentTurnIndex % turnCount
      : 0;
    const currentPlayerRef = hasTurnOrder
      ? game.turnOrder[currentTurnIndex]
      : null;
    const nextPlayerRef = hasTurnOrder
      ? game.turnOrder[(currentTurnIndex + 1) % turnCount]
      : null;
    const turnsCompleted = game.turnsCompletedInRound;

    return {
      gameId: game.id,
      roomCode: game.roomCode,
      status: game.status,
      roundNumber: game.roundNumber,
      players: players.map(({ id, displayName, isHost }) => ({
        ref: id,
        displayName,
        isHost,
      })),
      playersNeeded: Math.max(0, 4 - players.length),
      currentPlayerRef,
      nextPlayerRef,
      turnsCompleted,
      turnsRemaining:
        game.status === 'lobby'
          ? 0
          : Math.max(0, players.length - turnsCompleted),
      log,
      pendingQuestion,
      decisionProgress,
      votingProgress,
      voteCounts,
      result:
        game.status === 'finished'
          ? {
              winner: game.winner,
              accusedRef: game.accusedRef,
              lastDecisionOutcome: game.lastDecisionOutcome,
              lastVoteTie: game.lastVoteTie,
            }
          : null,
    };
  }
}
