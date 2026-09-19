import { BrowserRouter, Routes, Route } from "react-router-dom";

import GamesCarousel from "./components/games/GamesCarousel";

import GameHomePage from "./pages/GameHomePage";
import RedeemPage from "./pages/RedeemPage";

import WordHuntGame from "./games/gameTwo/WordHuntGame";
import MergeMasterGame from "./games/gameOne/MergeMasterGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* MAIN GAMES PAGE */}
        <Route
          path="/"
          element={<GamesCarousel />}
        />

        {/* REDEEM */}
        <Route
          path="/redeem"
          element={<RedeemPage />}
        />

        {/* ALL GAME HOME PAGES */}
        <Route
          path="/game/:gameId"
          element={<GameHomePage />}
        />

        {/* PLAYABLE GAME 1 */}
        <Route
          path="/game/8/play"
          element={<WordHuntGame />}
        />

        {/* PLAYABLE GAME 2 */}
        <Route
          path="/game/10/play"
          element={<MergeMasterGame />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;