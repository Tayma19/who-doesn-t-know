import type { ScreenProps } from "../types";
import RoleCard from "../components/RoleCard";
import TurnInfo from "../components/TurnInfo";
import QaLog from "../components/QaLog";
import AskForm from "../components/AskForm";
import AnswerForm from "../components/AnswerForm";
import "../style/GamePage.css";

export default function GamePage(props: ScreenProps) {
  const { state, me } = props;

  const getPlayerName = (playerRef: number | null): string => {
    if (playerRef === null) {
      return "another player";
    }

    return (
      state.players.find((player) => player.ref === playerRef)?.displayName ??
      "another player"
    );
  };

  const isMyTurn =
    state.status === "questioning" &&
    state.currentPlayerRef === me.playerRef &&
    state.pendingQuestion === null;

  const isMyQuestion =
    state.status === "questioning" &&
    state.pendingQuestion?.targetRef === me.playerRef;

  const isWaitingForAnswer =
    state.status === "questioning" &&
    state.pendingQuestion !== null &&
    state.pendingQuestion.targetRef !== me.playerRef;

  const isWaitingForTurn =
    state.status === "questioning" &&
    state.pendingQuestion === null &&
    state.currentPlayerRef !== null &&
    state.currentPlayerRef !== me.playerRef;

  return (
    <main className="game-page">
      <header className="game-page__header">
        <h1 className="game-page__title">Who Doesn't Know?</h1>
        <p className="game-page__room">Room: {state.roomCode}</p>
      </header>

      {state.voting.lastTie !== null && (
        <div className="game-page__tie" role="status">
          The vote was tied. Keep asking!
        </div>
      )}

      <RoleCard me={me} />

      <TurnInfo state={state} />

      {state.status === "questioning" && (
        <section className="game-page__interaction">
          {isMyTurn && <AskForm {...props} />}

          {isMyQuestion && <AnswerForm {...props} />}

          {isWaitingForAnswer && (
            <p className="game-page__waiting" role="status">
              Waiting for {getPlayerName(state.pendingQuestion!.targetRef)} to
              answer…
            </p>
          )}

          {isWaitingForTurn && (
            <p className="game-page__waiting" role="status">
              {getPlayerName(state.currentPlayerRef)} is choosing a question…
            </p>
          )}

          {state.currentPlayerRef === null &&
            state.pendingQuestion === null && (
              <p className="game-page__waiting" role="status">
                Waiting for the next round…
              </p>
            )}
        </section>
      )}

      <QaLog state={state} />
    </main>
  );
}
