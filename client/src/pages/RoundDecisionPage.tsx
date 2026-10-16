import { useState } from 'react';
import { submitDecision } from '../api/decision.api';
import type { Session } from '../types';

interface RoundDecisionProps {
  state: {
    roundNumber: number;
    decision?: {
      submittedCount: number;
      totalPlayers: number;
      lastOutcome: string | null;
    };
  };
  me: {
    hasDecided: boolean;
  };
  session: Session;
  refresh: () => void;
}

export default function RoundDecisionPage({ state, me, session, refresh }: RoundDecisionProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChoice = async (choice: 'continue' | 'vote') => {
    if (me.hasDecided || loading) return;
    setLoading(true);
    setError(null);

    try {
      await submitDecision(session, choice);
      refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit decision');
      }
    } finally {
      setLoading(false);
    }
  };

  const { roundNumber, decision } = state;

  return (
    <div className="round-decision-page p-6 max-w-md mx-auto text-center font-sans">
      <h1 className="text-2xl font-bold mb-4">
        Round {roundNumber} complete. Continue asking or vote?
      </h1>

      {decision?.lastOutcome && (
        <p className="text-sm text-gray-600 mb-4 italic">
          Last time: {decision.lastOutcome}
        </p>
      )}

      <div className="my-6">
        <p className="text-lg font-medium">
          {decision?.submittedCount ?? 0} / {decision?.totalPlayers ?? 0} have chosen
        </p>
      </div>

      {me.hasDecided ? (
        <div className="my-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-lg font-semibold">
          Waiting for others...
        </div>
      ) : (
        <div className="flex flex-col gap-4 my-6">
          <button
            onClick={() => handleChoice('continue')}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Continue asking
          </button>
          <button
            onClick={() => handleChoice('vote')}
            disabled={loading}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Vote
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-4 text-sm font-medium bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}