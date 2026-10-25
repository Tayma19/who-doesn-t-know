import type {
  LogEntry,
  PrivateRoleView,
  PublicGameState,
  PublicPlayer,
  Session,
} from "../types";
import { mockDelay } from "../api/http";



const ALL_PLAYERS: PublicPlayer[] = [
  { ref: 1, displayName: "Taima", isHost: true },
  { ref: 2, displayName: "Ali", isHost: false },
  { ref: 3, displayName: "Alaa", isHost: false },
  { ref: 4, displayName: "Nawar", isHost: false },
  { ref: 5, displayName: "Yazan", isHost: false },
];

const MIN_PLAYERS = 4;

const sampleLog: LogEntry[] = [
  { id: 1, round: 1, askerRef: 1, targetRef: 3, question: "Would you go there on a normal weekday?", answer: "Only if I'm in a hurry." },
  { id: 2, round: 1, askerRef: 2, targetRef: 4, question: "Is it crowded?", answer: "Sometimes, I guess." },
  { id: 3, round: 1, askerRef: 3, targetRef: 5, question: "Do you need a ticket?", answer: "Yes, always." },
  { id: 4, round: 1, askerRef: 4, targetRef: 1, question: "Do you go there alone?", answer: "Usually with luggage." },
  { id: 5, round: 1, askerRef: 5, targetRef: 2, question: "Is it far from the city?", answer: "A bit far." },
];

function base(overrides: Partial<PublicGameState>): PublicGameState {
  const players = overrides.players ?? ALL_PLAYERS;
  return {
    gameId: 1,
    roomCode: "K7MD2",
    status: "lobby",
    roundNumber: 0,
    hostRef: 1,

    players,
    minPlayers: MIN_PLAYERS,
    playersNeeded: Math.max(0, MIN_PLAYERS - players.length),

    turnOrder: [],
    currentPlayerRef: null,
    nextPlayerRef: null,
    turnsCompletedInRound: 0,
    turnsRemainingInRound: 0,

    pendingQuestion: null,
    log: [],

    decision: { submittedCount: 0, totalPlayers: players.length, lastOutcome: null },
    voting: { submittedCount: 0, totalPlayers: players.length, lastTie: null },

    result: null,
    ...overrides,
  };
}



export const lobby2Players: PublicGameState = base({
  players: ALL_PLAYERS.slice(0, 2),
});

export const lobby5Players: PublicGameState = base({
  players: ALL_PLAYERS,
});

export const questioningState: PublicGameState = base({
  status: "questioning",
  roundNumber: 1,
  turnOrder: [1, 2, 3, 4, 5],
  currentPlayerRef: 1,
  nextPlayerRef: 2,
  turnsCompletedInRound: 0,
  turnsRemainingInRound: 5,
  log: [],
});

export const decisionState: PublicGameState = base({
  status: "round_decision",
  roundNumber: 2,
  turnOrder: [1, 2, 3, 4, 5],
  log: sampleLog,
  decision: { submittedCount: 2, totalPlayers: 5, lastOutcome: null },
});

export const votingState: PublicGameState = base({
  status: "voting",
  roundNumber: 4,
  turnOrder: [1, 2, 3, 4, 5],
  log: sampleLog,
  voting: { submittedCount: 2, totalPlayers: 5, lastTie: null },
});

export const finishedState: PublicGameState = base({
  status: "finished",
  roundNumber: 4,
  turnOrder: [1, 2, 3, 4, 5],
  log: sampleLog,
  decision: { submittedCount: 5, totalPlayers: 5, lastOutcome: null },
  voting: { submittedCount: 5, totalPlayers: 5, lastTie: null },
  result: {
    winner: "informed",
    hiddenPlayerRef: 4,
    secretTip: "Airport",
    accusedRef: 4,
    voteCounts: [
      { ref: 1, votes: 0 },
      { ref: 2, votes: 1 },
      { ref: 3, votes: 0 },
      { ref: 4, votes: 4 },
      { ref: 5, votes: 0 },
    ],
  },
});



const meBase: PrivateRoleView = {
  playerRef: 1,
  displayName: "Taima",
  isHost: true,
  role: "informed",
  secretTip: "Airport",
  hasDecided: false,
  hasVoted: false,
};


export const meHost: PrivateRoleView = {
  ...meBase,
  role: "waiting",
  secretTip: null,
};


export const meWaiting: PrivateRoleView = {
  ...meBase,
  playerRef: 2,
  displayName: "Ali",
  isHost: false,
  role: "waiting",
  secretTip: null,
};


export const meInformed: PrivateRoleView = { ...meBase };


export const meHidden: PrivateRoleView = {
  ...meBase,
  playerRef: 4,
  displayName: "Nawar",
  isHost: false,
  role: "hidden",
  secretTip: null,
};



export const stateFixtures = {
  lobby2Players,
  lobby5Players,
  questioningState,
  decisionState,
  votingState,
  finishedState,
};

export const meFixtures = { meHost, meWaiting, meInformed, meHidden };

export type StateFixtureName = keyof typeof stateFixtures;
export type MeFixtureName = keyof typeof meFixtures;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getSelectedStateName(): StateFixtureName {
  const v = readStorage("mockState");
  return v && v in stateFixtures ? (v as StateFixtureName) : "lobby2Players";
}

export function setSelectedStateName(name: StateFixtureName): void {
  localStorage.setItem("mockState", name);
}


export function getState(roomCode: string): Promise<PublicGameState> {
  const fixture = stateFixtures[getSelectedStateName()];
  return mockDelay({ ...fixture, roomCode: roomCode.toUpperCase() }, 100);
}



export function getMe(session: Session): Promise<PrivateRoleView> {
  const forced = readStorage("mockMe");
  if (forced && forced in meFixtures) {
    return mockDelay(meFixtures[forced as MeFixtureName], 100);
  }
  const status = stateFixtures[getSelectedStateName()].status;
  if (status === "lobby") {
    return mockDelay(session.playerRef === 1 ? meHost : meWaiting, 100);
  }
  return mockDelay(meInformed, 100);
}