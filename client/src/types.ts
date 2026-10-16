export type GameStatus =
  | "lobby"
  | "questioning"
  | "round_decision"
  | "voting"
  | "finished";

export interface PublicPlayer {
  ref: number;
  displayName: string;
  isHost: boolean;
}

export interface LogEntry {
  id: number;
  round: number;
  askerRef: number;
  targetRef: number;
  question: string;
  answer: string | null;
}

export interface PublicGameState {
  gameId: number;
  roomCode: string;
  status: GameStatus;
  roundNumber: number;
  hostRef: number;
  players: PublicPlayer[];
  minPlayers: number;
  playersNeeded: number;

  // lobby
  turnOrder: number[];
  currentPlayerRef: number | null;
  nextPlayerRef: number | null;
  turnsCompletedInRound: number;
  turnsRemainingInRound: number;

  pendingQuestion: {
    id: number;
    askerRef: number;
    targetRef: number;
    text: string;
  } | null;

  log: LogEntry[];

  decision: {
    submittedCount: number;
    totalPlayers: number;
    lastOutcome: {
      round: number;
      continueCount: number;
      voteCount: number;
      result: "continue" | "vote";
    } | null;
  };

  voting: {
    submittedCount: number;
    totalPlayers: number;
    lastTie: {
      tiedRefs: number[];
      counts: { ref: number; votes: number }[];
    } | null;
    result: null | {
      winner: "informed" | "hidden";
      hiddenPlayerRef: number;
      secretTip: string;
      accusedRef: number;
      voteCounts: { ref: number; votes: number }[];
    };
  };
}

export interface PrivateRoleView {
  playerRef: number;
  displayName: string;
  isHost: boolean;
  role: "waiting" | "informed" | "hidden";
  secretTip: string | null;
  hasDecided: boolean;
  hasVoted: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}