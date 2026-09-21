import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import GamesCarousel from "./components/games/GamesCarousel";
import LoginPage from "./pages/LoginPage";
import GameHomePage from "./pages/GameHomePage";
import RedeemPage from "./pages/RedeemPage";

import WordHuntGame from "./games/gameTwo/WordHuntGame";
import MergeMasterGame from "./games/gameOne/MergeMasterGame";


function isLoggedIn() {
  try {
    const user = JSON.parse(
      localStorage.getItem("veloopUser")
    );

    return Boolean(user?.loggedIn && user?.email);
  } catch {
    return false;
  }
}


function ProtectedRoute({ children }) {
  return isLoggedIn()
    ? children
    : <Navigate to="/login" replace />;
}


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


function App() {
  return (
    <BrowserRouter>

      <ScrollToTop />

      <Routes>

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GamesCarousel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/redeem"
          element={
            <ProtectedRoute>
              <RedeemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/game/:gameId"
          element={
            <ProtectedRoute>
              <GameHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/game/8/play"
          element={
            <ProtectedRoute>
              <WordHuntGame />
            </ProtectedRoute>
          }
        />

        <Route
          path="/game/10/play"
          element={
            <ProtectedRoute>
              <MergeMasterGame />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;