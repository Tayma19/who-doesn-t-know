export function advanceTurn(
  currentTurnIndex: number,
  turnsCompletedInRound: number,
  playerCount: number,
): {
  currentTurnIndex: number;
  turnsCompletedInRound: number;
  roundCompleted: boolean;
} {
  if (!Number.isInteger(playerCount) || playerCount < 1) {
    throw new RangeError('playerCount must be a positive integer');
  }

  if (
    !Number.isInteger(currentTurnIndex) ||
    currentTurnIndex < 0 ||
    currentTurnIndex >= playerCount
  ) {
    throw new RangeError('currentTurnIndex is out of range');
  }

  if (
    !Number.isInteger(turnsCompletedInRound) ||
    turnsCompletedInRound < 0 ||
    turnsCompletedInRound >= playerCount
  ) {
    throw new RangeError('turnsCompletedInRound is out of range');
  }

  const completed = turnsCompletedInRound + 1;
  const roundCompleted = completed === playerCount;

  return {
    currentTurnIndex: (currentTurnIndex + 1) % playerCount,
    turnsCompletedInRound: roundCompleted ? 0 : completed,
    roundCompleted,
  };
}

export function shouldEnterDecision(completedRound: number): boolean {
  return completedRound % 2 === 0;
}

export function resolveDecision(
  choices: ('continue' | 'vote')[],
): 'vote' | 'continue' {
  if (!choices.length) {
    throw new RangeError('At least one decision is required');
  }

  const votes = choices.filter((choice) => choice === 'vote').length;

  return votes > choices.length / 2 ? 'vote' : 'continue';
}

export function resolveVotes(
  votes: { voterRef: number; suspectRef: number }[],
): { accusedRef: number } | { tiedRefs: number[] } {
  if (!votes.length) {
    throw new RangeError('At least one vote is required');
  }

  const counts = new Map<number, number>();

  for (const vote of votes) {
    counts.set(vote.suspectRef, (counts.get(vote.suspectRef) ?? 0) + 1);
  }

  const max = Math.max(...counts.values());

  const tiedRefs = [...counts.entries()]
    .filter(([, count]) => count === max)
    .map(([ref]) => ref)
    .sort((a, b) => a - b);

  return tiedRefs.length === 1 ? { accusedRef: tiedRefs[0] } : { tiedRefs };
}

export function decideWinner(
  accusedRef: number,
  hiddenPlayerRef: number,
): 'informed' | 'hidden' {
  return accusedRef === hiddenPlayerRef ? 'informed' : 'hidden';
}