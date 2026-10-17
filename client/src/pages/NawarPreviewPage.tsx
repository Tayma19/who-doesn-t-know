
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <header className="mx-auto mb-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">
          Nawar's Screen Preview
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Select a fixture to preview each screen state without the backend.
        </p>
      </header>

      <nav
        aria-label="Preview fixtures"
        className="mx-auto mb-6 flex max-w-4xl flex-wrap gap-2"
      >
        {(Object.keys(fixtures) as FixtureName[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelected(name)}
            aria-pressed={selected === name}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              selected === name
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            {fixtureLabels[name]}
          </button>
        ))}
      </nav>

      <div className="mx-auto max-w-4xl">
        {isVoting ? (
          <VotingPage {...props} />
        ) : (
          <GamePage {...props} />
        )}
      </div>
    </div>
  );
}
