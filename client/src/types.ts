export type GameStatus =
  | "lobby"
  | "questioning"
  | "round_decision"
  | "voting"
  | "finished";

export type Role = "waiting" | "informed" | "hidden";
export type DecisionChoice = "continue" | "vote";

export interface Session {
  roomCode: string;
  playerId: string;
  playerRef: number;
}

export interface Player {
  publicRef: number;
  displayName: string;
}

export interface QuestionLog {
  id: number;
  roundNumber: number;
  askerRef: number;
  targetRef: number;
  question: string;
  answer: string | null;
}

export interface PublicGameState {
  roomCode: string;
  status: GameStatus;
  roundNumber: number;
  players: Player[];
  currentPlayerRef: number | null;
  nextPlayerRef: number | null;
  turnsCompleted: number;
  turnsRemaining: number;
  log: QuestionLog[];
  submittedCount: number;
}

export interface PrivateRoleView {
  role: Role;
  secretTip: string | null;
  hasDecided: boolean;
  hasVoted: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
}
