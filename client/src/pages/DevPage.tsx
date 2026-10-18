import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveSession } from "../api/session";
import {
  getSelectedStateName,
  meFixtures,
  setSelectedStateName,
  stateFixtures,
  type MeFixtureName,
  type StateFixtureName,
} from "../mocks/state.mock";
import "../style/DevPage.css";

const ROOM = "K7MD2";

export default function DevPage() {
  const navigate = useNavigate();
  const [stateName, setStateName] = useState<StateFixtureName>(
    getSelectedStateName(),
  );
  const [meName, setMeName] = useState<string>(
    localStorage.getItem("mockMe") ?? "auto",
  );

  const apply = () => {
    setSelectedStateName(stateName);
    if (meName === "auto") localStorage.removeItem("mockMe");
    else localStorage.setItem("mockMe", meName);
  };

  const open = () => {
    apply();
    const ref =
      meName in meFixtures ? meFixtures[meName as MeFixtureName].playerRef : 1;
    saveSession({ roomCode: ROOM, playerId: "p_dev", playerRef: ref });
    navigate(`/room/${ROOM}`);
  };

  return (
    <main className="dev-page">
      <h1>Dev previews</h1>
      <p>
        Only works with <code>USE_MOCKS = true</code>. Pick a game status and a
        player view, then open the room. Changing these values in another tab
        switches the screen within 2 seconds.
      </p>

      <label htmlFor="dev-state">Game status (mockState)</label>
      <select
        id="dev-state"
        value={stateName}
        onChange={(e) => setStateName(e.target.value as StateFixtureName)}
      >
        {Object.keys(stateFixtures).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <label htmlFor="dev-me">Player view (mockMe)</label>
      <select
        id="dev-me"
        value={meName}
        onChange={(e) => setMeName(e.target.value)}
      >
        <option value="auto">auto</option>
        {Object.keys(meFixtures).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <div className="dev-page__actions">
        <button type="button" onClick={apply}>
          Apply
        </button>
        <button type="button" onClick={open}>
          Apply and open room
        </button>
      </div>

      <p>
        <Link to="/dev/result">Result preview (Alaa)</Link> ·{" "}
        <Link to="/">Home</Link>
      </p>
    </main>
  );
}