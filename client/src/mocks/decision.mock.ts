export function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

let hasChosen = false;

/**
 * Mocks submitting a decision.
 * First call succeeds, a second call rejects with an error message.
 */
export function submitDecision(_choice: "continue" | "vote") {
  if (hasChosen) {
    return Promise.reject(new Error("You already made your choice"));
  }
  hasChosen = true;
  return mockDelay({ ok: true });
}

// Reset helper for testing/previews
export function resetDecisionMock() {
  hasChosen = false;
}

// --- Fixtures ---

export const decisionOpen = {
  state: {
    roundNumber: 2,
    players: [
      { ref: 1, displayName: "Alaa", isHost: true },
      { ref: 2, displayName: "Taima", isHost: false },
      { ref: 3, displayName: "Yazan", isHost: false },
      { ref: 4, displayName: "Sara", isHost: false },
      { ref: 5, displayName: "Omar", isHost: false },
    ],
    decision: {
      submittedCount: 2,
      totalPlayers: 5,
      lastOutcome: null,
    },
  },
  me: {
    hasDecided: false,
  },
};

export const decisionChosen = {
  state: {
    roundNumber: 2,
    players: [
      { ref: 1, displayName: "Alaa", isHost: true },
      { ref: 2, displayName: "Taima", isHost: false },
      { ref: 3, displayName: "Yazan", isHost: false },
      { ref: 4, displayName: "Sara", isHost: false },
      { ref: 5, displayName: "Omar", isHost: false },
    ],
    decision: {
      submittedCount: 3,
      totalPlayers: 5,
      lastOutcome: null,
    },
  },
  me: {
    hasDecided: true,
  },
};

export const decisionAfterTie = {
  state: {
    roundNumber: 3,
    players: [
      { ref: 1, displayName: "Alaa", isHost: true },
      { ref: 2, displayName: "Taima", isHost: false },
      { ref: 3, displayName: "Yazan", isHost: false },
      { ref: 4, displayName: "Sara", isHost: false },
      { ref: 5, displayName: "Omar", isHost: false },
    ],
    decision: {
      submittedCount: 1,
      totalPlayers: 5,
      lastOutcome: "2 Continue, 2 Vote",
    },
  },
  me: {
    hasDecided: false,
  },
};
