import { useState, type FormEvent } from "react";
import type { ScreenProps } from "../types";
import { answerQuestion } from "../api/game.api";
import "./AnswerForm.css";

export default function AnswerForm({
  state,
  me,
  session,
  refresh,
}: ScreenProps) {
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const pendingQuestion = state.pendingQuestion;

  if (
    state.status !== "questioning" ||
    pendingQuestion === null ||
    pendingQuestion.targetRef !== me.playerRef
  ) {
    return null;
  }

  const questionId = pendingQuestion.id;

  const asker = state.players.find(
    (player) => player.ref === pendingQuestion.askerRef,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!answer.trim()) {
      setError("Please enter an answer.");
      return;
    }

    setSending(true);

    try {
      await answerQuestion(session, questionId, answer.trim());
      setAnswer("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="answer-form" onSubmit={handleSubmit}>
      <h2 className="answer-form__title">Answer the question</h2>

      <p className="answer-form__asker">
        Asked by: {asker?.displayName ?? "Unknown player"}
      </p>

      <p className="answer-form__question">{pendingQuestion.text}</p>

      <label className="answer-form__label" htmlFor="answer-text">
        Your answer
      </label>

      <textarea
        id="answer-text"
        className="answer-form__textarea"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Type your answer..."
        rows={3}
        disabled={sending}
      />

      {error && (
        <p className="answer-form__error" role="alert">
          {error}
        </p>
      )}

      <button className="answer-form__button" type="submit" disabled={sending}>
        {sending ? "Sending..." : "Submit answer"}
      </button>
    </form>
  );
}
