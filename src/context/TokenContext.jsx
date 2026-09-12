import { createContext, useContext, useState } from "react";

const TokenContext = createContext();

export function TokenProvider({ children }) {
  const [tokens, setTokens] = useState(100);

  const spendTokens = (amount) => {
    if (tokens < amount) {
      return false;
    }

    setTokens((prev) => prev - amount);
    return true;
  };

  return (
    <TokenContext.Provider value={{ tokens, spendTokens }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  return useContext(TokenContext);
}