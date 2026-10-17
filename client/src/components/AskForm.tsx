import { useState, type FormEvent } from "react";
import type { ScreenProps } from "../types";
import { askQuestion } from "../api/game.api";
import PlayerPicker from "./PlayerPicker";
import "./AskForm.css";

export default function AskForm({ state, me, session, refresh }: ScreenProps) {
  const [targetRef, setTargetRef] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (
    state.status !== "questioning" ||
    state.currentPlayerRef !== me.playerRef ||
    state.pendingQuestion !== null
  ) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (targetRef === null) {
      setError("Please choose a player.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setSending(true);

    try {
      await askQuestion(session, targetRef, question.trim());
      setQuestion("");
      setTargetRef(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ask question.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="ask-form" onSubmit={handleSubmit}>
      <h2 className="ask-form__title">Ask a question</h2>

      <PlayerPicker
        players={state.players}
        excludedRef={me.playerRef}
        value={targetRef}
        onChange={setTargetRef}
        disabled={sending}
      />

      <label className="ask-form__label" htmlFor="ask-question">
        Your question
      </label>

      <textarea
        id="ask-question"
        className="ask-form__textarea"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Type your question..."
        rows={3}
        disabled={sending}
      />

      {error && (
        <p className="ask-form__error" role="alert">
          {error}
        </p>
      )}

      <button className="ask-form__button" type="submit" disabled={sending}>
        {sending ? "Sending..." : "Ask question"}
      </button>
    </form>
  );
}
