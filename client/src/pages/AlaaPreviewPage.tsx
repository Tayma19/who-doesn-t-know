import { useState } from "react";
import ResultPage from "./ResultPage";
import { informedWin, hiddenWin } from "../mocks/result.mock";
import type { ScreenProps } from "../types";

const fixtures = {
  informedWin,
  hiddenWin,
};

type FixtureName = keyof typeof fixtures;

export default function AlaaPreviewPage() {
  const [selected, setSelected] =
    useState<FixtureName>("informedWin");

  const fixture = fixtures[selected];

  const props = {
    state: {
      ...fixture.state,
      gameId: 1,
      roomCode: "TEST",
      status: "finished" as const,
      hostRef: 1,
      minPlayers: 3,
      playersNeeded: 0,
      turnOrder: [],
      currentPlayerRef: null,
      nextPlayerRef: null,
      turnsCompletedInRound: 0,
      turnsRemainingInRound: 0,
      pendingQuestion: null,
      log: [],
      decision: {
        submittedCount: 5,
        totalPlayers: 5,
        lastOutcome: null,
      },
      voting: {
        submittedCount: 5,
        totalPlayers: 5,
        lastTie: null,
      },
    },
    me: {
      playerRef: 1,
      displayName: "Alaa",
      isHost: true,
      role: "informed" as const,
      secretTip: null,
      hasDecided: fixture.me.hasDecided,
      hasVoted: true,
    },
    session: {
      roomCode: "TEST",
      playerId: "preview-player",
      playerRef: 1,
    },
    refresh: () => {},
  } satisfies ScreenProps;

  return (
    <div>
      <nav className="preview-nav">
        <button
          type="button"
          onClick={() => setSelected("informedWin")}
          className={selected === "informedWin" ? "active" : ""}
        >
          Informed win
        </button>

        <button
          type="button"
          onClick={() => setSelected("hiddenWin")}
          className={selected === "hiddenWin" ? "active" : ""}
        >
          Hidden win
        </button>
      </nav>

      <ResultPage {...props} />
    </div>
  );
}