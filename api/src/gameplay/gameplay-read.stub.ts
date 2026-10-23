import { Injectable } from '@nestjs/common';
import { GameDocument } from '../games/schemas/game.schema';

export interface PendingQuestionView {
  id: number;
  askerRef: number;
  targetRef: number;
  text: string;
}

export type GameplayLog = unknown;
export type DecisionProgress = unknown;
export type VotingProgress = unknown;

export interface VoteCount {
  ref: number;
  votes: number;
}

export interface GameplayReadService {
  getLog(gameId: number): Promise<GameplayLog>;
  getPendingQuestion(gameId: number): Promise<PendingQuestionView | null>;
  getDecisionProgress(game: GameDocument): Promise<DecisionProgress>;
  getVotingProgress(game: GameDocument): Promise<VotingProgress>;
  getVoteCounts(gameId: number, votingNumber: number): Promise<VoteCount[]>;
}

/**
 * Temporary read-only adapter for the gameplay-owned data.
 * Ali Mikdad can replace the method bodies later without changing this
 * interface or the games state builder.
 */
@Injectable()
export class GameplayReadStub implements GameplayReadService {
  async getLog(_gameId: number): Promise<GameplayLog> {
    return [];
  }

  async getPendingQuestion(
    _gameId: number,
  ): Promise<PendingQuestionView | null> {
    return null;
  }

  async getDecisionProgress(_game: GameDocument): Promise<DecisionProgress> {
    return {};
  }

  async getVotingProgress(_game: GameDocument): Promise<VotingProgress> {
    return {};
  }

  async getVoteCounts(
    _gameId: number,
    _votingNumber: number,
  ): Promise<VoteCount[]> {
    return [];
  }
}
