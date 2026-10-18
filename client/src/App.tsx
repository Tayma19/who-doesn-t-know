import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GameRoute from "./pages/GameRoute";
import DevPage from "./pages/DevPage";
import AlaaPreviewPage from "./pages/AlaaPreviewPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomCode" element={<GameRoute />} />
      <Route path="/dev" element={<DevPage />} />
      <Route path="/dev/result" element={<AlaaPreviewPage />} />
      {/* <Route path="*" element={} /> */}
    </Routes>
  );
}

export default App;