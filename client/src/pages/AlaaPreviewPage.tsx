import { useState } from "react";
import ResultPage from "./ResultPage";
import RoundDecisionPage from "./RoundDecisionPage";
import {
  decisionOpen,
  decisionChosen,
  decisionAfterTie,
  resetDecisionMock,
} from "../mocks/decision.mock";
import { informedWin, hiddenWin } from "../mocks/result.mock";
import { decisionState, finishedState, meInformed } from "../mocks/state.mock";
import type { PublicGameState, ScreenProps } from "../types";
import "../style/AlaaPreviewPage.css";

const decisionFixtures = { decisionOpen, decisionChosen, decisionAfterTie };
const resultFixtures = { informedWin, hiddenWin };

const labels = {
  decisionOpen: "Decision (open)",
  decisionChosen: "Decision (I chose)",
  decisionAfterTie: "Decision (after tie)",
  informedWin: "Informed win",
  hiddenWin: "Hidden win",
};

type FixtureName = keyof typeof labels;

export default function AlaaPreviewPage() {
  const [selected, setSelected] = useState<FixtureName>("decisionOpen");

  const isResult = selected === "informedWin" || selected === "hiddenWin";
  const fixture = isResult
    ? resultFixtures[selected as keyof typeof resultFixtures]
    : decisionFixtures[selected as keyof typeof decisionFixtures];

  const state = {
    ...(isResult ? finishedState : decisionState),
    ...(fixture.state as Partial<PublicGameState>),
    status: isResult ? "finished" : "round_decision",
  } as PublicGameState;

  const props: ScreenProps = {
    state,
    me: { ...meInformed, playerRef: 1, displayName: "Alaa", hasDecided: fixture.me.hasDecided },
    session: { roomCode: "TEST", playerId: "preview-player", playerRef: 1 },
    refresh: () => {},
  };

  return (
    <div>
      <nav className="preview-nav">
        {(Object.keys(labels) as FixtureName[]).map((name) => (
          <button
            key={name}
            type="button"
            className={selected === name ? "active" : ""}
            onClick={() => {
              resetDecisionMock();
              setSelected(name);
            }}
          >
            {labels[name]}
          </button>
        ))}
      </nav>

      {isResult ? <ResultPage {...props} /> : <RoundDecisionPage {...props} />}
    </div>
  );
}
