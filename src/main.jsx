import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App.jsx";

import { GameCoinProvider } from "./context/GameCoinContext.jsx";
import { TokenProvider } from "./context/TokenContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <GameCoinProvider>
        <TokenProvider>
          <App />
        </TokenProvider>
      </GameCoinProvider>
    </ThemeProvider>
  </StrictMode>
);