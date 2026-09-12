import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App.jsx";
import { GameCoinProvider } from "./context/GameCoinContext.jsx";
import { TokenProvider } from "./context/TokenContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GameCoinProvider>
      <TokenProvider>
        <App />
      </TokenProvider>
    </GameCoinProvider>
  </StrictMode>,
);
