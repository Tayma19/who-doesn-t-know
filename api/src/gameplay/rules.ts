export function advanceTurn(
  currentTurnIndex: number,
  turnsCompletedInRound: number,
  playerCount: number,
): {
  currentTurnIndex: number;
  turnsCompletedInRound: number;
  roundCompleted: boolean;
} {
  const nextTurnIndex = (currentTurnIndex + 1) % playerCount;
  const newTurnsCompleted = turnsCompletedInRound + 1;
  const roundCompleted = newTurnsCompleted === playerCount;

  return {
    currentTurnIndex: nextTurnIndex,
    turnsCompletedInRound: roundCompleted ? 0 : newTurnsCompleted,
    roundCompleted,
  };
}

export function shouldEnterDecision(completedRound: number): boolean {
  return completedRound % 2 === 0;
}

export function resolveDecision(
  choices: ('continue' | 'vote')[],
): 'vote' | 'continue' {
  const voteCount = choices.filter((c) => c === 'vote').length;
  return voteCount > choices.length / 2 ? 'vote' : 'continue';
}

export function resolveVotes(
  votes: { voterRef: string; suspectRef: string }[],
): { accusedRef: string } | { tiedRefs: string[] } {
  const counts = new Map<string, number>();

  for (const v of votes) {
    counts.set(v.suspectRef, (counts.get(v.suspectRef) || 0) + 1);
  }

  let maxVotes = 0;
  let tied: string[] = [];

  for (const [ref, count] of counts.entries()) {
    if (count > maxVotes) {
      maxVotes = count;
      tied = [ref];
    } else if (count === maxVotes) {
      tied.push(ref);
    }
  }

  return tied.length === 1 ? { accusedRef: tied[0] } : { tiedRefs: tied };
}

export function decideWinner(
  accusedRef: string,
  hiddenPlayerRef: string,
): 'informed' | 'hidden' {
  return accusedRef === hiddenPlayerRef ? 'informed' : 'hidden';
}
