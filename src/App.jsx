import { BrowserRouter, Routes, Route } from "react-router-dom";

import GamesCarousel from "./components/games/GamesCarousel";
import GameHomePage from "./pages/GameHomePage";
import BladeMasterGame from "./games/gameOne/BladeMasterGame";
import WordHuntGame from "./games/gameTwo/WordHuntGame";
import RedeemPage from "./pages/RedeemPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Games Banner / Carousel */}
        <Route path="/" element={<GamesCarousel />} />

        {/* Game Home Page */}
        <Route path="/game/:gameId" element={<GameHomePage />} />

        {/* Playable Games */}
        <Route path="/game/1/play" element={<BladeMasterGame />} />
        <Route path="/game/8/play" element={<WordHuntGame />} />

        {/* Redeem */}
        <Route path="/redeem" element={<RedeemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
