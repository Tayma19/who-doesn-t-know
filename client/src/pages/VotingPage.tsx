
import { useState } from "react";
import { submitVote } from "../api/voting.api";
import RoleCard from "../components/RoleCard";
import PlayerPicker from "../components/PlayerPicker";
import type { ScreenProps } from "../types";
import "../style/VotingPage.css";
export default function VotingPage({
  state,
  me,
  session,
  refresh,
}: ScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const hasVoted = me.hasVoted || voteSubmitted;

  const handleVote = async () => {
    if (hasVoted || loading || selectedPlayer === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitVote(session, selectedPlayer);
      setVoteSubmitted(true);
      refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your vote. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6 font-sans">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Vote for a player
      </h1>

      <RoleCard me={me} />

      <p className="my-6 text-center text-lg font-medium" aria-live="polite">
        {state.voting.submittedCount} / {state.voting.totalPlayers} voted
      </p>

      {hasVoted ? (
        <p
          className="my-6 rounded-lg bg-blue-50 p-4 text-center font-semibold text-blue-700"
          role="status"
        >
          You voted. Waiting for others…
        </p>
      ) : (
        <div className="my-6 flex flex-col gap-4">
          <PlayerPicker
            players={state.players}
            excludedRef={me.playerRef}
            value={selectedPlayer}
            onChange={setSelectedPlayer}
            disabled={loading}
          />

          <button
            type="button"
            onClick={handleVote}
            disabled={loading || selectedPlayer === null}
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
