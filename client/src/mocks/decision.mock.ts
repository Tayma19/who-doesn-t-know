export function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// Track decisions separately for each room and player.
const chosenPlayers = new Set<string>();

/**
 * Mocks submitting a decision.
 * Each player can submit only one decision per room.
 */
export async function submitDecision(
  sessionKey: string,
  _choice: "continue" | "vote",
) {
  if (chosenPlayers.has(sessionKey)) {
    throw new Error("You already made your choice");
  }

  chosenPlayers.add(sessionKey);
  return mockDelay({ ok: true });
}

// Reset helper for testing/previews.
export function resetDecisionMock() {
  chosenPlayers.clear();
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
      lastOutcome: "2 Continue · 2 Vote",
    },
  },
  me: {
    hasDecided: false,
  },
};
