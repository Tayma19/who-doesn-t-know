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
    <main className="voting-container">
      <h1 className="voting-title">
        Vote for a player
      </h1>

      <RoleCard me={me} />

      <p className="voting-status-count" aria-live="polite">
        {state.voting.submittedCount} / {state.voting.totalPlayers} voted
      </p>

      {hasVoted ? (
        <p className="voted-banner" role="status">
          You voted. Waiting for others…
        </p>
      ) : (
        <div className="voting-form-group">
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
            className="vote-submit-btn"
          >
            {loading ? "Submitting..." : "Vote"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="voting-error-msg">
          {error}
        </p>
      )}
    </main>
  );
}