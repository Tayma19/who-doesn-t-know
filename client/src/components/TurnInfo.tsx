
import type { PublicGameState } from "../types";
import "./TurnInfo.css";

interface TurnInfoProps {
  state: PublicGameState;
}

export default function TurnInfo({ state }: TurnInfoProps) {
  const getPlayerName = (playerRef: number | null): string => {
    if (playerRef === null) {
      return "None";
    }

    return (
      state.players.find((player) => player.ref === playerRef)
        ?.displayName ?? "Unknown player"
    );
  };

  return (
    <section className="turn-info">
      <div className="turn-info__header">
        <h2 className="turn-info__title">
          Round {state.roundNumber}
        </h2>
        <span className="turn-info__status">
          {state.status.replace("_", " ")}
        </span>
      </div>

      <div className="turn-info__players">
        <p>
          <strong>Current player:</strong>{" "}
          {getPlayerName(state.currentPlayerRef)}
        </p>
        <p>
          <strong>Next player:</strong>{" "}
          {getPlayerName(state.nextPlayerRef)}
        </p>
      </div>

      <p className="turn-info__progress">
        {state.turnsCompletedInRound} done ·{" "}
        {state.turnsRemainingInRound} left
      </p>
    </section>
  );
}
