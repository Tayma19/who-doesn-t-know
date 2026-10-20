import {
  advanceTurn,
  shouldEnterDecision,
  resolveDecision,
  resolveVotes,
  decideWinner,
} from './rules';

import { describe, it, expect } from '@jest/globals';

describe('Gameplay Rules (T1)', () => {
  describe('advanceTurn', () => {
    it('should advance to the next player and not complete the round', () => {
      const result = advanceTurn(0, 0, 5);
      expect(result).toEqual({
        currentTurnIndex: 1,
        turnsCompletedInRound: 1,
        roundCompleted: false,
      });
    });

    it('should wrap-around to the first player and complete the round', () => {
      const result = advanceTurn(4, 4, 5);
      expect(result).toEqual({
        currentTurnIndex: 0,
        turnsCompletedInRound: 0,
        roundCompleted: true,
      });
    });
  });

  describe('shouldEnterDecision', () => {
    it('should detect even rounds for decision phase', () => {
      expect(shouldEnterDecision(1)).toBe(false);
      expect(shouldEnterDecision(2)).toBe(true);
      expect(shouldEnterDecision(4)).toBe(true);
    });
  });

  describe('resolveDecision', () => {
    it('should return vote on strict majority', () => {
      expect(resolveDecision(['vote', 'vote', 'continue'])).toBe('vote');
    });

    it('should return continue on 50/50 tie', () => {
      expect(resolveDecision(['vote', 'vote', 'continue', 'continue'])).toBe(
        'continue',
      );
    });
  });

  describe('resolveVotes', () => {
    it('should return single accused on clear majority', () => {
      const votes = [
        { voterRef: 'p1', suspectRef: 'p2' },
        { voterRef: 'p3', suspectRef: 'p2' },
        { voterRef: 'p4', suspectRef: 'p5' },
      ];
      expect(resolveVotes(votes)).toEqual({ accusedRef: 'p2' });
    });

    it('should return tiedRefs on a vote tie', () => {
      const votes = [
        { voterRef: 'p1', suspectRef: 'p2' },
        { voterRef: 'p3', suspectRef: 'p2' },
        { voterRef: 'p4', suspectRef: 'p5' },
        { voterRef: 'p6', suspectRef: 'p5' },
      ];
      expect(resolveVotes(votes)).toEqual({ tiedRefs: ['p2', 'p5'] });
    });
  });

  describe('decideWinner', () => {
    it('should return informed if accused is the hidden player', () => {
      expect(decideWinner('p4', 'p4')).toBe('informed');
    });

    it('should return hidden if accused is not the hidden player', () => {
      expect(decideWinner('p2', 'p4')).toBe('hidden');
    });
  });
});
