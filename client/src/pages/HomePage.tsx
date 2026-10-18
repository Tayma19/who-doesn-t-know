import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame, type JoinResult } from "../api/lobby.api";
import { saveSession } from "../api/session";
import ErrorBanner from "../components/ErrorBanner";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const enter = (r: JoinResult) => {
    saveSession({
      roomCode: r.roomCode,
      playerId: r.playerId,
      playerRef: r.playerRef,
    });
    navigate(`/room/${r.roomCode}`);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const name = createName.trim();
    if (!name) {
      setCreateError("Please enter your display name.");
      return;
    }
    setBusy("create");
    setCreateError(null);
    try {
      enter(await createGame(name));
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create the game.");
      setBusy(null);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const code = joinCode.trim().toUpperCase();
    const name = joinName.trim();
    if (code.length !== 5) {
      setJoinError("The room code has 5 characters.");
      return;
    }
    if (!name) {
      setJoinError("Please enter your display name.");
      return;
    }
    setBusy("join");
    setJoinError(null);
    try {
      enter(await joinGame(code, name));
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Could not join the game.");
      setBusy(null);
    }
  };

  return (
    <main className="home-page">
      <header className="home-page__header">
        <h1>Who Doesn't Know?</h1>
        <p>Everyone knows the secret — except one player. Find who is pretending.</p>
      </header>

      <div className="home-page__cards">
        <section className="home-card">
          <h2>Create game</h2>
          <form onSubmit={handleCreate} noValidate>
            <label htmlFor="create-name">Your display name</label>
            <input
              id="create-name"
              type="text"
              value={createName}
              maxLength={30}
              autoComplete="off"
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Taima"
            />
            <button type="submit" disabled={busy !== null}>
              {busy === "create" ? "Creating…" : "Create game"}
            </button>
          </form>
          <ErrorBanner message={createError} />
        </section>

        <section className="home-card">
          <h2>Join game</h2>
          <form onSubmit={handleJoin} noValidate>
            <label htmlFor="join-code">Room code</label>
            <input
              id="join-code"
              className="home-card__code"
              type="text"
              value={joinCode}
              maxLength={5}
              autoComplete="off"
              autoCapitalize="characters"
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="K7MD2"
            />
            <label htmlFor="join-name">Your display name</label>
            <input
              id="join-name"
              type="text"
              value={joinName}
              maxLength={30}
              autoComplete="off"
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="e.g. Ali"
            />
            <button type="submit" disabled={busy !== null}>
              {busy === "join" ? "Joining…" : "Join game"}
            </button>
          </form>
          <ErrorBanner message={joinError} />
        </section>
      </div>
    </main>
  );
}
