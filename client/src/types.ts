



export interface Session {
  roomCode: string;
  playerId: string;
  playerRef: number;
}

export interface ScreenProps {
  state: PublicGameState; 
  me: PrivateRoleView;    
  session: Session;       
  refresh: () => void;    
}

// ---------- Contract (from the backend) ----------

export type GameStatus =
  | 'lobby'
  | 'questioning'
  | 'round_decision'
  | 'voting'
  | 'finished';

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

  // lobby
  players: PublicPlayer[];
  minPlayers: number;
  playersNeeded: number;

  // turns
  turnOrder: number[];
  currentPlayerRef: number | null;
  nextPlayerRef: number | null;
  turnsCompletedInRound: number;
  turnsRemainingInRound: number;

  // questions
  pendingQuestion: {
    id: number;
    askerRef: number;
    targetRef: number;
    text: string;
  } | null;
  log: LogEntry[];

  // round decision
  decision: {
    submittedCount: number;
    totalPlayers: number;
    lastOutcome: {
      round: number;
      continueCount: number;
      voteCount: number;
      result: 'continue' | 'vote';
    } | null;
  };

  // voting
  voting: {
    submittedCount: number;
    totalPlayers: number;
    lastTie: {
      tiedRefs: number[];
      counts: { ref: number; votes: number }[];
    } | null;
  };

  // only when finished
  result: null | {
    winner: 'informed' | 'hidden';
    hiddenPlayerRef: number;
    secretTip: string;
    accusedRef: number;
    voteCounts: { ref: number; votes: number }[];
  };
}

export interface PrivateRoleView {
  playerRef: number;
  displayName: string;
  isHost: boolean;
  role: 'waiting' | 'informed' | 'hidden'; 
  secretTip: string | null;                
  hasDecided: boolean;                     
  hasVoted: boolean;                     
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
