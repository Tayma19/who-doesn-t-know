import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameplayReadService } from '../gameplay/gameplay-read.service';
import { Tip, TipDocument } from '../tips/schemas/tip.schema';
import { GameDocument } from './schemas/game.schema';
import { Player, PlayerDocument } from './schemas/player.schema';

export interface PublicPlayer {
  ref: number;
  displayName: string;
  isHost: boolean;
}

export interface PendingQuestionView {
  id: number;
  askerRef: number;
  targetRef: number;
  text: string;
}

export interface LogEntry {
  id: number;
  round: number;
  askerRef: number;
  targetRef: number;
  question: string;
  answer: string | null;
}

export interface PublicGameResult {
  winner: 'informed' | 'hidden';
  hiddenPlayerRef: number;
  secretTip: string;
  accusedRef: number;
  voteCounts: { ref: number; votes: number }[];
}

export interface PublicGameState {
  gameId: number;
  roomCode: string;
  status: string;
  roundNumber: number;
  hostRef: number;
  players: PublicPlayer[];
  minPlayers: number;
  playersNeeded: number;
  turnOrder: number[];
  currentPlayerRef: number | null;
  nextPlayerRef: number | null;
  turnsCompletedInRound: number;
  turnsRemainingInRound: number;
  pendingQuestion: PendingQuestionView | null;
  log: LogEntry[];
  decision: {
    submittedCount: number;
    totalPlayers: number;
    lastOutcome: GameDocument['lastDecisionOutcome'];
  };
  voting: {
    submittedCount: number;
    totalPlayers: number;
    lastTie: GameDocument['lastVoteTie'];
  };
  result: PublicGameResult | null;
}

@Injectable()
export class StateBuilder {
  private static readonly MIN_PLAYERS = 4;

  constructor(
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(Tip.name)
    private readonly tipModel: Model<TipDocument>,
    private readonly gameplayRead: GameplayReadService,
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

    const result = await this.buildFinishedResult(game, voteCounts);

    return {
      gameId: game.id,
      roomCode: game.roomCode,
      status: game.status,
      roundNumber: game.roundNumber,
      hostRef: game.hostRef,
      players: players.map(({ id, displayName, isHost }) => ({
        ref: id,
        displayName,
        isHost,
      })),
      minPlayers: StateBuilder.MIN_PLAYERS,
      playersNeeded: Math.max(0, StateBuilder.MIN_PLAYERS - players.length),
      turnOrder: [...game.turnOrder],
      currentPlayerRef: hasTurnOrder ? game.turnOrder[currentTurnIndex] : null,
      nextPlayerRef: hasTurnOrder
        ? game.turnOrder[(currentTurnIndex + 1) % turnCount]
        : null,
      turnsCompletedInRound: game.turnsCompletedInRound,
      turnsRemainingInRound:
        game.status === 'lobby'
          ? 0
          : Math.max(0, players.length - game.turnsCompletedInRound),
      pendingQuestion,
      log,
      decision: {
        submittedCount: decisionProgress.submittedCount,
        totalPlayers: decisionProgress.totalPlayers,
        lastOutcome: game.lastDecisionOutcome,
      },
      voting: {
        submittedCount: votingProgress.submittedCount,
        totalPlayers: votingProgress.totalPlayers,
        lastTie: game.lastVoteTie,
      },
      result,
    };
  }

  private async buildFinishedResult(
    game: GameDocument,
    voteCounts: { ref: number; votes: number }[],
  ): Promise<PublicGameResult | null> {
    if (game.status !== 'finished') return null;
    if (
      !game.hiddenPlayerRef ||
      !game.secretTipId ||
      !game.accusedRef ||
      !game.winner
    ) {
      throw new NotFoundException('Finished game result is incomplete');
    }

    const secretTip = await this.tipModel
      .findOne({ id: game.secretTipId })
      .lean();
    if (!secretTip) {
      throw new NotFoundException('Secret tip not found for finished game');
    }

    return {
      winner: game.winner,
      hiddenPlayerRef: game.hiddenPlayerRef,
      secretTip: secretTip.text,
      accusedRef: game.accusedRef,
      voteCounts,
    };
  }
}
