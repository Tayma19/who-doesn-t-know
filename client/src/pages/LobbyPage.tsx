import { useState } from "react";
import { startGame } from "../api/lobby.api";
import ErrorBanner from "../components/ErrorBanner";
import type { ScreenProps } from "../types";
import "../style/LobbyPage.css";

export default function LobbyPage({ state, me, session, refresh }: ScreenProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");

  const inviteUrl = `${window.location.origin}/?join=${encodeURIComponent(state.roomCode)}`;

  const shareInvite = async () => {
    setInviteMessage("");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join my Who Doesn't Know? game", text: `Join room ${state.roomCode}`, url: inviteUrl });
        setInviteMessage("Invite shared.");
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        setInviteMessage("Invite link copied. Send it to your players.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setInviteMessage("Invite link copied. Send it to your players.");
      } catch {
        setInviteMessage(`Share this link with your players: ${inviteUrl}`);
      }
    }
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    setError(null);
    try {
      await startGame(session);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the game.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="lobby-page">
      <p className="lobby-page__label">Room code — share it with your friends</p>
      <div className="lobby-page__code" aria-label={`Room code ${state.roomCode}`}>
        {state.roomCode}
      </div>
      <div className="lobby-page__invite">
        <p>Players from the last game can join this lobby with the same room code.</p>
        <button type="button" onClick={shareInvite}>Share invite link</button>
        {inviteMessage && <p className="lobby-page__invite-status" role="status">{inviteMessage}</p>}
      </div>

      <section className="lobby-page__players">
        <h2>
          Players ({state.players.length})
        </h2>
        <ul>
          {state.players.map((p) => (
            <li key={p.ref}>
              <span>
                {p.displayName}
                {p.ref === session.playerRef && (
                  <span className="lobby-page__you"> (you)</span>
                )}
              </span>
              {p.isHost && <span className="lobby-page__badge">Host</span>}
            </li>
          ))}
        </ul>
      </section>

      {state.playersNeeded > 0 && (
        <p className="lobby-page__needed" role="status">
          {state.playersNeeded} more {state.playersNeeded === 1 ? "player" : "players"} needed
        </p>
      )}

      {me.isHost ? (
        <button
          type="button"
          className="lobby-page__start"
          onClick={handleStart}
          disabled={starting}
        >
          {starting ? "Starting…" : "Start game"}
        </button>
      ) : (
        <p className="lobby-page__waiting" role="status">
          Waiting for the host to start the game…
        </p>
      )}

      <ErrorBanner message={error} onClose={() => setError(null)} />
    </main>
  );
}