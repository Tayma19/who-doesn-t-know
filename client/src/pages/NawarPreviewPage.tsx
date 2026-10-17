import { useState } from "react";
import GamePage from "./GamePage";
import VotingPage from "./VotingPage";

import {
  myTurn,
  askedMe,
  waitingOthers,
  hiddenPlayerTurn,
  afterVoteTie,
  votingNotVoted,
  votingVoted,
} from "../mocks/game.mock";
import type { GameFixture } from "../mocks/game.mock";
import type { ScreenProps } from "../types";
import "../style/NawarPreviewPage.css";

const fixtures = {
  myTurn,
  askedMe,
  waitingOthers,
  hiddenPlayerTurn,
  afterVoteTie,
  votingNotVoted,
  votingVoted,
} satisfies Record<string, GameFixture>;

type FixtureName = keyof typeof fixtures;

const fixtureLabels: Record<FixtureName, string> = {
  myTurn: "My turn",
  askedMe: "Answer a question",
  waitingOthers: "Waiting for turn",
  hiddenPlayerTurn: "Hidden player",
  afterVoteTie: "After vote tie",
  votingNotVoted: "Ready to vote",
  votingVoted: "Already voted",
};

export default function NawarPreviewPage() {
  const [selected, setSelected] = useState<FixtureName>("myTurn");

  const fixture = fixtures[selected];

  const props = {
    state: fixture.state,
    me: fixture.me,
    session: {
      roomCode: fixture.state.roomCode,
      playerId: "nawar-preview-player",
      playerRef: fixture.me.playerRef,
    },
    refresh: () => {},
  } satisfies ScreenProps;

  const isVoting = fixture.state.status === "voting";

  return (
    <div className="nawar-preview-container">
      <header className="nawar-preview-header">
        <h1 className="nawar-preview-title">
          Nawar's Screen Preview
        </h1>
        <p className="nawar-preview-subtitle">
          Select a fixture to preview each screen state without the backend.
        </p>
      </header>

      <nav
        aria-label="Preview fixtures"
        className="nawar-preview-nav"
      >
        {(Object.keys(fixtures) as FixtureName[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelected(name)}
            aria-pressed={selected === name}
            className={`fixture-btn ${selected === name ? "active" : ""}`}
          >
            {fixtureLabels[name]}
          </button>
        ))}
      </nav>

      <div className="nawar-preview-content">
        {isVoting ? (
          <VotingPage {...props} />
        ) : (
          <GamePage {...props} />
        )}
      </div>
    </div>
  );
}