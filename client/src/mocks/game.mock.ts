
import type {
  LogEntry,
  PrivateRoleView,
  PublicGameState,
} from "../types";
import { mockDelay, mockError } from "../api/http";

export interface GameFixture {
  state: PublicGameState;
  me: PrivateRoleView;
}

const players = [
  { ref: 1, displayName: "Taima", isHost: true },
  { ref: 2, displayName: "Ali", isHost: false },
  { ref: 3, displayName: "Alaa", isHost: false },
  { ref: 4, displayName: "Nawar", isHost: false },
  { ref: 5, displayName: "Yazan", isHost: false },
];

const turnOrder = [1, 2, 3, 4, 5];

const log: LogEntry[] = [
  {
    id: 1,
    round: 1,
    askerRef: 1,
    targetRef: 2,
    question: "What color is the sky on a clear day?",
    answer: "Blue",
  },
  {
    id: 2,
    round: 1,
    askerRef: 2,
    targetRef: 3,
    question: "Where might you find sand?",
    answer: "At the beach",
  },
  {
    id: 3,
    round: 1,
    askerRef: 3,
    targetRef: 4,
    question: "What do people use to tell time?",
    answer: "A clock",
  },
  {
    id: 4,
    round: 2,
    askerRef: 4,
    targetRef: 5,
    question: "What do you wear on your feet?",
    answer: "Shoes",
  },
  {
    id: 5,
    round: 2,
    askerRef: 5,
    targetRef: 1,
    question: "What shines in the night sky?",
    answer: null,
  },
];

function createState(
  overrides: Partial<PublicGameState>,
): PublicGameState {
  return {
    gameId: 101,
    roomCode: "MOCK42",
    status: "questioning",
    roundNumber: 2,
    hostRef: 1,

    players,
    minPlayers: 3,
    playersNeeded: 0,

    turnOrder,
    currentPlayerRef: 1,
    nextPlayerRef: 2,
    turnsCompletedInRound: 0,
    turnsRemainingInRound: 5,

    pendingQuestion: null,
    log,

    decision: {
      submittedCount: 0,
      totalPlayers: 5,
      lastOutcome: null,
    },

    voting: {
      submittedCount: 0,
      totalPlayers: 5,
      lastTie: null,
    },

    result: null,

    ...overrides,
  };
}

function createMe(
  overrides: Partial<PrivateRoleView>,
): PrivateRoleView {
  return {
    playerRef: 1,
    displayName: "Taima",
    isHost: true,
    role: "informed",
    secretTip: "Sunflower",
    hasDecided: false,
    hasVoted: false,
    ...overrides,
  };
}

export const myTurn: GameFixture = {
  state: createState({
    currentPlayerRef: 1,
    nextPlayerRef: 2,
    pendingQuestion: null,
  }),
  me: createMe({
    playerRef: 1,
    displayName: "Taima",
    role: "informed",
    secretTip: "Sunflower",
  }),
};

export const askedMe: GameFixture = {
  state: createState({
    currentPlayerRef: 3,
    nextPlayerRef: 4,
    pendingQuestion: {
      id: 12,
      askerRef: 2,
      targetRef: 1,
      text: "Where would you usually see one?",
    },
  }),
  me: createMe({
    playerRef: 1,
    displayName: "Taima",
    hasDecided: false,
  }),
};

export const waitingOthers: GameFixture = {
  state: createState({
    currentPlayerRef: 4,
    nextPlayerRef: 5,
    turnsCompletedInRound: 3,
    turnsRemainingInRound: 2,
  }),
  me: createMe({
    playerRef: 2,
    displayName: "Ali",
    isHost: false,
    hasDecided: true,
  }),
};

export const hiddenPlayerTurn: GameFixture = {
  state: createState({
    currentPlayerRef: 3,
    nextPlayerRef: 4,
    pendingQuestion: null,
  }),
  me: createMe({
    playerRef: 3,
    displayName: "Alaa",
    isHost: false,
    role: "hidden",
    secretTip: null,
  }),
};

export const afterVoteTie: GameFixture = {
  state: createState({
    status: "voting",
    currentPlayerRef: null,
    nextPlayerRef: null,
    voting: {
      submittedCount: 5,
      totalPlayers: 5,
      lastTie: {
        tiedRefs: [2, 4],
        counts: [
          { ref: 1, votes: 0 },
          { ref: 2, votes: 2 },
          { ref: 3, votes: 1 },
          { ref: 4, votes: 2 },
          { ref: 5, votes: 0 },
        ],
      },
    },
  }),
  me: createMe({
    playerRef: 1,
    displayName: "Taima",
    hasVoted: true,
  }),
};

export const votingNotVoted: GameFixture = {
  state: createState({
    status: "voting",
    currentPlayerRef: null,
    nextPlayerRef: null,
    voting: {
      submittedCount: 2,
      totalPlayers: 5,
      lastTie: null,
    },
  }),
  me: createMe({
    playerRef: 4,
    displayName: "Nawar",
    isHost: false,
    hasVoted: false,
  }),
};

export const votingVoted: GameFixture = {
  state: createState({
    status: "voting",
    currentPlayerRef: null,
    nextPlayerRef: null,
    voting: {
      submittedCount: 3,
      totalPlayers: 5,
      lastTie: null,
    },
  }),
  me: createMe({
    playerRef: 5,
    displayName: "Yazan",
    isHost: false,
    hasVoted: true,
  }),
};

export async function askQuestion(
  askerRef: number,
  targetRef: number,
  text: string,
): Promise<{ ok: true }> {
  if (!text.trim()) {
    return mockError("Question cannot be empty");
  }

  if (askerRef === targetRef) {
    return mockError("You cannot ask yourself");
  }

  return mockDelay({ ok: true });
}

export async function answerQuestion(
  text: string,
): Promise<{ ok: true }> {
  if (!text.trim()) {
    return mockError("Answer cannot be empty");
  }

  return mockDelay({ ok: true });
}
