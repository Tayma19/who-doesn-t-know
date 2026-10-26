import { describe, it, expect } from '@jest/globals';
import {
  advanceTurn,
  shouldEnterDecision,
  resolveDecision,
  resolveVotes,
  decideWinner,
} from './rules';

describe('gameplay rules', () => {
  it('advances and wraps the turn while marking the round complete', () => {
    expect(advanceTurn(0, 0, 5)).toEqual({
      currentTurnIndex: 1,
      turnsCompletedInRound: 1,
      roundCompleted: false,
    });

    expect(advanceTurn(4, 4, 5)).toEqual({
      currentTurnIndex: 0,
      turnsCompletedInRound: 0,
      roundCompleted: true,
    });
  });

  it('enters decisions after even completed rounds', () => {
    expect(shouldEnterDecision(2)).toBe(true);
    expect(shouldEnterDecision(3)).toBe(false);
  });

  it('requires a strict majority for vote, so a tie continues', () => {
    expect(resolveDecision(['vote', 'vote', 'continue'])).toBe('vote');
    expect(resolveDecision(['vote', 'continue'])).toBe('continue');
  });

  it('resolves one accused and ties deterministically', () => {
    expect(
      resolveVotes([
        { voterRef: 1, suspectRef: 2 },
        { voterRef: 3, suspectRef: 2 },
        { voterRef: 4, suspectRef: 5 },
      ]),
    ).toEqual({ accusedRef: 2 });

    expect(
      resolveVotes([
        { voterRef: 1, suspectRef: 2 },
        { voterRef: 3, suspectRef: 2 },
        { voterRef: 4, suspectRef: 5 },
        { voterRef: 6, suspectRef: 5 },
      ]),
    ).toEqual({ tiedRefs: [2, 5] });
  });

  it('returns the correct winner in either case', () => {
    expect(decideWinner(4, 4)).toBe('informed');
    expect(decideWinner(2, 4)).toBe('hidden');
  });
});