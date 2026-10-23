import { useState } from "react";
import { submitDecision } from "../api/decision.api";



import type { ScreenProps } from "../types"; 
import "../style/RoundDecisionPage.css";


export default function RoundDecisionPage({
  state,
  me,
  session,
  refresh,
}: ScreenProps) {
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
    <main className="round-decision-card">
      <h1 className="round-decision-title">
        Round {state.roundNumber} complete. Continue asking or vote?
      </h1>

      {state.decision.lastOutcome && (
        <p className="round-decision-outcome">
         Last time: {state.decision.lastOutcome.continueCount} Continue · {state.decision.lastOutcome.voteCount} Vote
        </p>
      )}

      <p className="round-decision-status" aria-live="polite">
        {submittedCount} / {totalPlayers} players have chosen
      </p>

      {me.hasDecided ? (
        <p className="round-decision-waiting">
          Waiting for others...
        </p>
      ) : (
        <div className="round-decision-actions">
          <button
            type="button"
            onClick={() => handleChoice("continue")}
            disabled={loading || me.hasDecided}
            className="round-decision-btn"
          >
            {loading ? "Submitting..." : "Continue asking"}
          </button>

          <button
            type="button"
            onClick={() => handleChoice("vote")}
            disabled={loading || me.hasDecided}
            className="round-decision-btn"
          >
            {loading ? "Submitting..." : "Vote"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="round-decision-error">
          {error}
        </p>
      )}
    </main>
  );
}