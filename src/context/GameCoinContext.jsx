import { createContext, useContext, useState } from "react";

const GameCoinContext = createContext();

export function GameCoinProvider({ children }) {
  const [tokens, setTokens] = useState(100);

  const spendTokens = (amount) => {
    if (tokens < amount) {
      return false;
    }

    setTokens((prev) => prev - amount);
    return true;
  };

  return (
    <GameCoinContext.Provider value={{ tokens, spendTokens }}>
      {children}
    </GameCoinContext.Provider>
  );
}

export function useGameCoin() {
  return useContext(GameCoinContext);
}
