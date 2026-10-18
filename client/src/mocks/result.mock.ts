// --- Result Fixtures ---

export const informedWin = {
  state: {
    roundNumber: 4,
    players: [
      { ref: 1, displayName: "Alaa", isHost: true },
      { ref: 2, displayName: "Taima", isHost: false },
      { ref: 3, displayName: "Yazan", isHost: false },
      { ref: 4, displayName: "Sara", isHost: false },
      { ref: 5, displayName: "Omar", isHost: false },
    ],
    result: {
      winner: "informed" as const,
      hiddenPlayerRef: 3,
      secretTip: "Coffee",
      accusedRef: 3,
      voteCounts: [
        { ref: 1, votes: 0 },
        { ref: 2, votes: 1 },
        { ref: 3, votes: 3 },
        { ref: 4, votes: 1 },
        { ref: 5, votes: 0 },
      ],
    },
  },
  me: {
    hasDecided: true,
  },
};

export const hiddenWin = {
  state: {
    roundNumber: 4,
    players: [
      { ref: 1, displayName: "Alaa", isHost: true },
      { ref: 2, displayName: "Taima", isHost: false },
      { ref: 3, displayName: "Yazan", isHost: false },
      { ref: 4, displayName: "Sara", isHost: false },
      { ref: 5, displayName: "Omar", isHost: false },
    ],
    result: {
      winner: "hidden" as const,
      hiddenPlayerRef: 2,
      secretTip: "Paris",
      accusedRef: 4,
      voteCounts: [
        { ref: 1, votes: 1 },
        { ref: 2, votes: 0 },
        { ref: 3, votes: 2 },
        { ref: 4, votes: 2 },
        { ref: 5, votes: 0 },
      ],
    },
  },
  me: {
    hasDecided: true,
  },
};