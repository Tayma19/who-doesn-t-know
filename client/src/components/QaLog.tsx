
import type { PublicGameState } from "../types";
import "./QaLog.css";

interface QaLogProps {
  state: PublicGameState;
}

export default function QaLog({ state }: QaLogProps) {
  const getPlayerName = (playerRef: number): string => {
    return (
      state.players.find((player) => player.ref === playerRef)
        ?.displayName ?? "Unknown player"
    );
  };

  const rounds = Array.from(
    new Set(state.log.map((entry) => entry.round)),
  ).sort((a, b) => a - b);

  return (
    <section className="qa-log">
      <h2 className="qa-log__title">Question History</h2>

      {rounds.length === 0 ? (
        <p className="qa-log__empty">
          No questions have been asked yet.
        </p>
      ) : (
        rounds.map((round) => (
          <div className="qa-log__round" key={round}>
            <h3 className="qa-log__round-title">
              Round {round}
            </h3>

            {state.log
              .filter((entry) => entry.round === round)
              .map((entry) => (
                <article className="qa-log__entry" key={entry.id}>
                  <p className="qa-log__question">
                    <strong>{getPlayerName(entry.askerRef)}</strong>
                    {" → "}
                    <strong>{getPlayerName(entry.targetRef)}</strong>
                    {": "}
                    {entry.question}
                  </p>

                  <p className="qa-log__answer">
                    <strong>Answer:</strong>{" "}
                    {entry.answer ?? "waiting…"}
                  </p>
                </article>
              ))}
          </div>
        ))
      )}
    </section>
  );
}
