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
      winner: "informed",
      hiddenPlayerRef: 3,
      secretTip: "The secret word was Coffee.",
      accusedRef: 3,
      voteCounts: {
        1: 0,
        2: 1,
        3: 3,
        4: 1,
        5: 0,
      },
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
      winner: "hidden",
      hiddenPlayerRef: 2,
      secretTip: "The secret place was Paris.",
      accusedRef: 4,
      voteCounts: {
        1: 1,
        2: 0,
        3: 2,
        4: 2,
        5: 0,
      },
    },
  },
  me: {
    hasDecided: true,
  },
};
