import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ScreenProps } from "../types";
import { createGame } from "../api/lobby.api";
import { saveSession } from "../api/session";
import "../style/ResultPage.css";

export default function ResultPage({ state, me }: ScreenProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const result = state.result;

  async function handlePlayAgain() {
    try {
      setBusy(true);
      setError("");

      const game = await createGame(me.displayName);

      saveSession({
        roomCode: game.roomCode,
        playerId: game.playerId,
        playerRef: game.playerRef,
      });

      navigate(`/room/${game.roomCode}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't create a new game.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!result) {
    return (
      <main className="result-page">
        <h1>Results aren't available yet.</h1>
      </main>
    );
  }

  const hiddenPlayer = state.players.find(
    (player) => player.ref === result.hiddenPlayerRef,
  );

  const playersWithVotes = state.players
    .map((player) => ({
      ...player,
      votes:
        result.voteCounts.find((vote) => vote.ref === player.ref)?.votes ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  return (
    <main className="result-page" data-winner={result.winner}>
      <section className="result-header">
        <h1>
          {result.winner === "informed"
            ? "The informed players win!"
            : "The hidden player wins!"}
        </h1>

        <p>
          {hiddenPlayer?.displayName ?? "Unknown player"} was the hidden player
        </p>

        <p>The secret was: {result.secretTip}</p>

        <div className="result-rematch">
          {me.isHost ? (
            <>
              <p>Start a fresh lobby, then share its invite link so everyone can join.</p>
              <button type="button" onClick={handlePlayAgain} disabled={busy}>
                {busy ? "Creating lobby..." : "Create rematch lobby"}
              </button>
              {error && <p className="result-rematch__error" role="alert">{error}</p>}
            </>
          ) : (
            <>
              <p>Want another round? Ask the host to create a new lobby and share its room code or invite link.</p>
              <button type="button" onClick={() => navigate("/")}>
                Join a rematch
              </button>
            </>
          )}
        </div>
      </section>

      <section>
        <h2>Voting results</h2>

        <table className="vote-table">
          <thead>
            <tr>
              <th>Player</th>
              <th className="votes">Votes</th>
            </tr>
          </thead>

          <tbody>
            {playersWithVotes.map((player) => {
              const isAccused = player.ref === result.accusedRef;

              return (
                <tr
                  key={player.ref}
                  className={isAccused ? "accused" : ""}
                >
                  <td>
                    {player.displayName}
                    {isAccused && (
                      <span className="accused-label"> (Accused)</span>
                    )}
                  </td>

                  <td className="votes">{player.votes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}