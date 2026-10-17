import { useState } from "react";
import { submitDecision } from "../api/decision.api";
import type { PublicGameState, PrivateRoleView } from "../types";

interface RoundDecisionPageProps {
  state: PublicGameState;
  me: PrivateRoleView;
  session: {
    roomCode: string;
    playerId: string;
  };
  refresh: () => void;
}

export default function RoundDecisionPage({
  state,
  me,
  session,
  refresh,
}: RoundDecisionPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submittedCount = state.decision.submittedCount;
  const totalPlayers = state.decision.totalPlayers;

  const handleChoice = async (choice: "continue" | "vote") => {
    if (me.hasDecided || loading) return;

    setLoading(true);
    setError(null);

    try {
      await submitDecision(session, choice);
      refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your decision. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6 text-center font-sans">
      <h1 className="mb-4 text-2xl font-bold">
        Round {state.roundNumber} complete. Continue asking or vote?
      </h1>

      {state.decision.lastOutcome && (
        <p className="mb-4 text-sm italic text-gray-600">
          Previous outcome: {state.decision.lastOutcome.result}
        </p>
      )}

      <p className="my-6 text-lg font-medium" aria-live="polite">
        {submittedCount} / {totalPlayers} players have chosen
      </p>

      {me.hasDecided ? (
        <p className="my-6 rounded-lg bg-blue-50 p-4 font-semibold text-blue-700">
          Waiting for others...
        </p>
      ) : (
        <div className="my-6 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => handleChoice("continue")}
            disabled={loading || me.hasDecided}
            className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Continue asking"}
          </button>

          <button
            type="button"
            onClick={() => handleChoice("vote")}
            disabled={loading || me.hasDecided}
            className="rounded-lg bg-purple-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Vote"}
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </main>
  );
}