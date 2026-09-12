import { createContext, useContext, useState } from "react";

const GameCoinContext = createContext();

export function GameCoinProvider({ children }) {
  const [gameCoins, setGameCoins] = useState(100);

  const addGameCoins = (amount) => {
    setGameCoins((prev) => prev + amount);
  };

  const spendGameCoins = (amount) => {
    if (gameCoins < amount) {
      return false;
    }

    setGameCoins((prev) => prev - amount);
    return true;
  };

  return (
    <GameCoinContext.Provider
      value={{
        gameCoins,
        addGameCoins,
        spendGameCoins,
      }}
    >
      {children}
    </GameCoinContext.Provider>
  );
}

export function useGameCoin() {
  return useContext(GameCoinContext);
}
