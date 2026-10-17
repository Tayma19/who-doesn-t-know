import { useState } from "react";
// استيراد شاشات الفريق
import GamePage from "./pages/GamePage";
import RoundDecisionPage from "./pages/RoundDecisionPage";
import ResultPage from "./pages/ResultPage";

// استيراد ملفات الـ Mocks الوهمية
import * as gameMocks from "./mocks/game.mock";
import { informedWin } from "./mocks/result.mock";

export default function App() {
  // حالة بسيطة للتحكم بالواجهة التي تريدين عرضها للتجربة
  const [currentScreen, setCurrentScreen] = useState<"game" | "decision" | "result">("game");

  // بيانات الجلسة الافتراضية المشتركة
  const session = { roomCode: "ROOM123", playerId: "p1", playerRef: 1 };
  const refresh = () => console.log("Refreshed!");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", paddingBottom: "40px" }}>
      {/* شريط علوي مؤقت للتبديل بين الواجهات أثناء الاختبار */}
      <nav style={{ display: "flex", justifyContent: "center", gap: "10px", padding: "16px", background: "#1e293b", borderBottom: "1px solid #334155", marginBottom: "20px" }}>
        <button 
          onClick={() => setCurrentScreen("game")}
          style={{ padding: "8px 16px", borderRadius: "8px", background: currentScreen === "game" ? "#7c3aed" : "#0f172a", color: "#fff", border: "1px solid #475569", cursor: "pointer", fontWeight: "600" }}
        >
          شاشة اللعب (GamePage)
        </button>
        <button 
          onClick={() => setCurrentScreen("decision")}
          style={{ padding: "8px 16px", borderRadius: "8px", background: currentScreen === "decision" ? "#7c3aed" : "#0f172a", color: "#fff", border: "1px solid #475569", cursor: "pointer", fontWeight: "600" }}
        >
          شاشة القرار (RoundDecision)
        </button>
        <button 
          onClick={() => setCurrentScreen("result")}
          style={{ padding: "8px 16px", borderRadius: "8px", background: currentScreen === "result" ? "#7c3aed" : "#0f172a", color: "#fff", border: "1px solid #475569", cursor: "pointer", fontWeight: "600" }}
        >
          شاشة النتائج (ResultPage)
        </button>
      </nav>

      {/* عرض الشاشة المحددة بناءً على الاختيار */}
      {currentScreen === "game" && (
        <GamePage 
          state={gameMocks.myTurn.state} 
          me={gameMocks.myTurn.me} 
          session={session} 
          refresh={refresh} 
        />
      )}

      {currentScreen === "decision" && (
        <RoundDecisionPage 
          state={gameMocks.myTurn.state} 
          me={{ playerRef: 1, displayName: "أدلينا", isHost: true, role: "informed", secretTip: "Pizza", hasDecided: false, hasVoted: false }} 
          session={{ roomCode: "ROOM123", playerId: "p1" }} 
          refresh={refresh} 
        />
      )}

      {currentScreen === "result" && (
        <ResultPage 
          state={{
            ...informedWin.state,
            gameId: 1,
            roomCode: "ROOM123",
            status: "finished",
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
            decision: { submittedCount: 5, totalPlayers: 5, lastOutcome: null },
            voting: { submittedCount: 5, totalPlayers: 5, lastTie: null },
          }} 
          me={{ playerRef: 1, displayName: "أدلينا", isHost: true, role: "informed", secretTip: null, hasDecided: true, hasVoted: true }} 
          session={session} 
          refresh={refresh} 
        />
      )}
    </div>
  );
}