import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlay } from "react-icons/fi";

import games from "../data/gamesData";
import { useTokens } from "../context/TokenContext";
import { useGameCoin } from "../context/GameCoinContext";

import styles from "./GameHomePage.module.css";

import gameCoinIcon from "../assets/games/game_coin.jpeg";
import tokenIcon from "../assets/games/multi_token.jpeg";

function GameHomePage() {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const { tokens, spendTokens } = useTokens();
  const { gameCoins } = useGameCoin();

  const game = games.find((item) => item.id === Number(gameId));

  if (!game) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1>Game Not Found</h1>

          <p>We couldn't find this game.</p>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/")}
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  // Only these two games are fully playable.
  const isPlayable = game.id === 1 || game.id === 8;

  const handleStartGame = () => {
    if (!isPlayable) {
      return;
    }

    if (tokens < 20) {
      alert(
        `Not Enough Tokens\n\nYou need 20 Tokens to play.\nYour Balance: ${tokens} Tokens`,
      );

      return;
    }

    const success = spendTokens(20);

    if (!success) {
      return;
    }

    if (game.id === 1) {
      navigate("/game/1/play");
      return;
    }

    if (game.id === 8) {
      navigate("/game/8/play");
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/")}
          aria-label="Back to games"
        >
          <FiArrowLeft />
        </button>

        <div className={styles.coinBalance}>
          <img src={gameCoinIcon} alt="Game Coins" />

          <div>
            <strong>{gameCoins}</strong>

            <span>Game Coins</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className={styles.main}>
        <section className={styles.gameCard}>
          {/* GAME ARTWORK */}
          <div className={styles.artworkContainer}>
            <img
              src={game.image}
              alt={`${game.name} game artwork`}
              className={styles.artwork}
            />
          </div>

          {/* GAME INFO */}
          <div className={styles.gameInfo}>
            <div>
              <span className={styles.gameLabel}>GAME</span>

              <h1>{game.name}</h1>

              <p>Find hidden words, discover challenges and win Game Coins.</p>
            </div>

            {/* ENTRY COST */}
            <div className={styles.entryCost}>
              <img src={tokenIcon} alt="Tokens" />

              <div>
                <span>Entry Fee</span>

                <strong>20 Tokens</strong>
              </div>
            </div>

            {/* PLAY BUTTON */}
            <button
              type="button"
              className={styles.playButton}
              onClick={handleStartGame}
              disabled={!isPlayable}
            >
              <span className={styles.playIcon}>
                <FiPlay />
              </span>

              <span>{isPlayable ? "Play Now" : "Coming Soon"}</span>
            </button>

            {/* TOKEN BALANCE */}
            <div className={styles.tokenBalance}>
              <img src={tokenIcon} alt="Tokens" />

              <span>Your balance:</span>

              <strong>{tokens} Tokens</strong>
            </div>
          </div>
        </section>

        {/* BOTTOM NAVIGATION */}
        <nav className={styles.bottomNav}>
          <button type="button" onClick={() => navigate("/")}>
            Home
          </button>

          <button type="button" onClick={() => navigate("/redeem")}>
            Redeem
          </button>
        </nav>
      </main>
    </div>
  );
}

export default GameHomePage;
