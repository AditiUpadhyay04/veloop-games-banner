import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlay,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

import games from "../data/gamesData";
import { useTokens } from "../context/TokenContext";
import { useGameCoin } from "../context/GameCoinContext";

import styles from "./GameHomePage.module.css";

import gameCoinIcon from "../assets/games/game_coin.jpeg";
import tokenIcon from "../assets/games/multi_token.jpeg";

const PLAY_COST = 20;

const gameDetails = {
  1: {
    tagline: "TWIST • AIM • THROW",
    description:
      "Adjust your angle and power, throw your blades and hit the target to score points.",
    instruction:
      "Use angle and power controls to aim your knife at the dartboard.",
  },

  8: {
    tagline: "FIND • THINK • WIN",
    description:
      "Find hidden words across the puzzle grid, complete levels and earn Game Coins.",
    instruction:
      "Select letters in a straight line to discover the hidden words.",
  },
};

function GameHomePage() {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const { tokens, spendTokens } = useTokens();
  const { gameCoins } = useGameCoin();

  const [isStarting, setIsStarting] = useState(false);
  const [showInsufficient, setShowInsufficient] =
    useState(false);

  const game = games.find(
    (item) => item.id === Number(gameId)
  );

  const isPlayable =
    game?.id === 1 || game?.id === 8;

  const details = game
    ? gameDetails[game.id]
    : null;

  useEffect(() => {
    if (!isStarting) return;

    const timer = setTimeout(() => {
      if (game?.id === 1) {
        navigate("/game/1/play");
      }

      if (game?.id === 8) {
        navigate("/game/8/play");
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [isStarting, game?.id, navigate]);

  if (!game) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1>Game Not Found</h1>

          <p>
            We couldn't find this game.
          </p>

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

  const handleStartGame = () => {
    if (!isPlayable || isStarting) {
      return;
    }

    if (tokens < PLAY_COST) {
      setShowInsufficient(true);
      return;
    }

    const success = spendTokens(PLAY_COST);

    if (!success) {
      setShowInsufficient(true);
      return;
    }

    setIsStarting(true);
  };

  const closeInsufficient = () => {
    setShowInsufficient(false);
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
          <img
            src={gameCoinIcon}
            alt="Game Coins"
          />

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
              <span className={styles.gameLabel}>
                {details?.tagline || "GAME"}
              </span>

              <h1>{game.name}</h1>

              <p>
                {details?.description ||
                  "Explore this game and earn rewards."}
              </p>
            </div>

            {/* ENTRY COST */}

            <div className={styles.entryCost}>
              <img
                src={tokenIcon}
                alt="Tokens"
              />

              <div>
                <span>Entry Fee</span>
                <strong>
                  {PLAY_COST} Tokens
                </strong>
              </div>
            </div>

            {/* PLAY BUTTON */}

            <button
              type="button"
              className={styles.playButton}
              onClick={handleStartGame}
              disabled={!isPlayable || isStarting}
              aria-busy={isStarting}
            >
              <span className={styles.playIcon}>
                {isStarting ? (
                  <span
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                ) : (
                  <FiPlay />
                )}
              </span>

              <span>
                {isStarting
                  ? "Starting Game..."
                  : isPlayable
                    ? "Play Now"
                    : "Coming Soon"}
              </span>
            </button>

            {/* TOKEN BALANCE */}

            <div className={styles.tokenBalance}>
              <img
                src={tokenIcon}
                alt="Tokens"
              />

              <span>Your balance:</span>

              <strong>
                {tokens} Tokens
              </strong>
            </div>

            {/* GAME INSTRUCTION */}

            {details?.instruction && (
              <div className={styles.quickTip}>
                <span>QUICK TIP</span>
                <p>{details.instruction}</p>
              </div>
            )}

          </div>
        </section>

        {/* BOTTOM NAVIGATION */}

        <nav className={styles.bottomNav}>
          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/redeem")}
          >
            Redeem
          </button>
        </nav>

      </main>

      {/* INSUFFICIENT TOKEN MODAL */}

      {showInsufficient && (
        <div
          className={styles.modalOverlay}
          onClick={closeInsufficient}
        >
          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeInsufficient}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className={styles.warningIcon}>
              <FiAlertCircle />
            </div>

            <span className={styles.modalLabel}>
              GAME ENTRY
            </span>

            <h2>Not Enough Tokens</h2>

            <p>
              You need{" "}
              <strong>{PLAY_COST} Tokens</strong>{" "}
              to play {game.name}.
            </p>

            <div className={styles.balanceBox}>
              <img
                src={tokenIcon}
                alt="Tokens"
              />

              <div>
                <strong>{tokens}</strong>
                <span>Tokens available</span>
              </div>
            </div>

            <div className={styles.requiredBox}>
              <span>Required</span>
              <strong>
                {PLAY_COST} Tokens
              </strong>
            </div>

            <button
              type="button"
              className={styles.modalButton}
              onClick={closeInsufficient}
            >
              Okay
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default GameHomePage;