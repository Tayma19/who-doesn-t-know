import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../api/useGame";
import { clearSession } from "../api/session";
import ErrorBanner from "../components/ErrorBanner";
import LobbyPage from "./LobbyPage";
import GamePage from "./GamePage";
import RoundDecisionPage from "./RoundDecisionPage";
// import VotingPage from "./VotingPage";
import ResultPage from "./ResultPage";
import "../style/GameRoute.css";

function Notice({
  title,
  message,
  onHome,
}: {
  title: string;
  message: string;
  onHome: () => void;
}) {
  return (
    <main className="notice-page">
      <h1>{title}</h1>
      <p>{message}</p>
      <button type="button" className="notice-page__button" onClick={onHome}>
        Back to Home
      </button>
    </main>
  );
}

export default function GameRoute() {
  const params = useParams<{ roomCode: string }>();
  const roomCode = (params.roomCode ?? "").toUpperCase();
  const navigate = useNavigate();
  const { state, me, session, refresh, error, loading } = useGame(roomCode);

  const goHome = () => {
    if (error && !state) clearSession();
    navigate("/");
  };

  if (!session) {
    return (
      <Notice
        title="You're not in this game"
        message="Join the game from the home page with the room code and your name."
        onHome={goHome}
      />
    );
  }

  if (!state || !me) {
    if (error) {
      return (
        <Notice
          title="Can't open this game"
          message={error.message}
          onHome={goHome}
        />
      );
    }
    return (
      <main className="notice-page" aria-busy={loading}>
        <p>Loading game…</p>
      </main>
    );
  }

  const props = { state, me, session, refresh };

  let screen;
  switch (state.status) {
    case "lobby":
      screen = <LobbyPage {...props} />;
      break;
    case "questioning":
      screen = <GamePage {...props} />;
      break;
    case "round_decision":
      screen = <RoundDecisionPage {...props} />;
      break;
    // case "voting":
    //   screen = <VotingPage {...props} />;
    //   break;
    case "finished":
      screen = <ResultPage {...props} />;
      break;
    default:
      screen = (
        <Notice
          title="Unknown game status"
          message="The game is in a state this screen doesn't know."
          onHome={goHome}
        />
      );
  }

  return (
    <>
      {/* A failed poll keeps the last good screen and shows a message above it. */}
      {error && (
        <div className="route-error">
          <ErrorBanner message={`Connection problem: ${error.message}`} />
        </div>
      )}
      {screen}
    </>
  );
}