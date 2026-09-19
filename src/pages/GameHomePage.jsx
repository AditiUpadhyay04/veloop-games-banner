import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiAward,
  FiChevronRight,
  FiClock,
  FiGift,
  FiHome,
  FiPlay,
  FiTarget,
  FiZap,
} from "react-icons/fi";

import { useGameCoin } from "../context/GameCoinContext";
import { useTokens } from "../context/TokenContext";

import games from "../data/gamesData";

import gameCoinAsset from "../assets/games/game_coin.jpeg";
import tokenAsset from "../assets/games/multi_token.jpeg";

import styles from "./GameHomePage.module.css";

const PLAYABLE_GAME_IDS = new Set([8, 10]);

const PLAY_ROUTES = {
  8: "/game/8/play",
  10: "/game/10/play",
};

const GAME_CONTENT = {
  8: {
    badge: "WORD PUZZLE",
    eyebrow: "READY TO PLAY?",
    description:
      "Find hidden words across the letter grid before the timer runs out and complete every level.",
    icon: "target",
    quickTitle: "Word Hunt",
    quickText: "Find hidden words",
    accent: "#7863e8",
    steps: [
      {
        title: "Find a word",
        text: "Look through the letter grid and identify a target word.",
      },
      {
        title: "Drag across letters",
        text: "Select the word from its first letter to its last.",
      },
      {
        title: "Beat the timer",
        text: "Find every target word before the timer reaches zero.",
      },
      {
        title: "Advance and earn",
        text: "Complete levels to increase your score and Game Coin rewards.",
      },
    ],
  },

  10: {
    badge: "PUZZLE STRATEGY",
    eyebrow: "READY TO PLAY?",
    description:
      "Merge matching values, build bigger combinations and push your score higher.",
    icon: "target",
    quickTitle: "Merge Master",
    quickText: "Puzzle strategy",
    accent: "#8661e8",
    steps: [
      {
        title: "Study the board",
        text: "Look at the current tiles and plan your next move.",
      },
      {
        title: "Merge matching tiles",
        text: "Combine equal values to create a stronger tile.",
      },
      {
        title: "Plan ahead",
        text: "Keep enough space available for your next moves.",
      },
      {
        title: "Build your score",
        text: "Create larger values and improve your final result.",
      },
    ],
  },
};

function GameHomePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const { gameCoins } = useGameCoin();
  const { tokens, spendTokens } = useTokens();

  const [starting, setStarting] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const game = games.find(
    (item) => String(item.id) === String(gameId)
  );

  if (!game) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundCard}>
          <div className={styles.notFoundIcon}>
            <FiTarget />
          </div>

          <span>VELOOP REWARDS</span>

          <h1>Game not found</h1>

          <p>
            We couldn't find the game you're looking for.
          </p>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/")}
          >
            <FiHome />
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const id = Number(game.id);

  const isPlayable = PLAYABLE_GAME_IDS.has(id);

  const content =
    GAME_CONTENT[id] || {
      badge: "GAME EXPERIENCE",
      eyebrow: "MORE GAMES COMING",
      description:
        "This game is coming soon. Stay tuned for the full interactive experience.",
      icon: "target",
      quickTitle: "Interactive",
      quickText: "Game experience",
      accent: "#7863e8",
      steps: [
        {
          title: "Explore the game",
          text: "A new challenge is being prepared for you.",
        },
        {
          title: "Learn the mechanics",
          text: "Understand the objective and interactions.",
        },
        {
          title: "Play and progress",
          text: "Complete challenges and improve your score.",
        },
        {
          title: "Earn rewards",
          text: "Collect Game Coins when gameplay becomes available.",
        },
      ],
    };

  const handleStartGame = () => {
    if (!isPlayable || starting) return;

    setStarting(true);

    const success = spendTokens(20);

    if (!success) {
      setStarting(false);
      setShowInsufficient(true);
      return;
    }

    navigate(PLAY_ROUTES[id]);
  };

  return (
    <div
      className={styles.page}
      style={{
        "--accent": content.accent,
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <header className={styles.header}>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/")}
          aria-label="Back to games"
        >
          <FiArrowLeft />
        </button>

        <div className={styles.headerTitle}>
          <span>VELOOP</span>
          <strong>{game.name}</strong>
        </div>

        <div className={styles.headerCoin}>
          <img
            src={gameCoinAsset}
            alt=""
            className={styles.headerCoinIcon}
          />

          <div>
            <span>GAME COINS</span>
            <strong>{gameCoins}</strong>
          </div>
        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className={styles.content}>

        {/* HERO */}

        <section className={styles.heroCard}>

          {/* LEFT ART */}

          <div className={styles.artworkSide}>

            <div className={styles.artGlow} />

            <div className={styles.artTopLabel}>
              <span className={styles.statusDot} />

              {isPlayable
                ? "PLAYABLE GAME"
                : "COMING SOON"}
            </div>

            <div className={styles.artworkFrame}>
              <img
                src={game.image}
                alt={`${game.name} game artwork`}
                className={styles.artwork}
              />
            </div>

            <div className={styles.artBottom}>
              <span>{game.type}</span>
              <strong>{game.name}</strong>
            </div>

          </div>


          {/* RIGHT */}

          <div className={styles.detailsSide}>

            <div className={styles.detailsInner}>

              <span className={styles.eyebrow}>
                {content.eyebrow}
              </span>

              <h1>{game.name}</h1>

              <p className={styles.description}>
                {content.description}
              </p>


              {/* PLAYABLE */}

              {isPlayable ? (
                <>
                  <button
                    type="button"
                    className={styles.playButton}
                    onClick={handleStartGame}
                    disabled={starting}
                  >

                    <span className={styles.playButtonIcon}>
                      <FiPlay />
                    </span>

                    <span className={styles.playButtonText}>
                      {starting
                        ? "STARTING..."
                        : "PLAY NOW"}
                    </span>

                    {!starting && (
                      <FiChevronRight />
                    )}

                  </button>

                  <div className={styles.entryFee}>

                    <div className={styles.entryIcon}>
                      <img
                        src={tokenAsset}
                        alt=""
                      />
                    </div>

                    <div>
                      <strong>20 Tokens</strong>
                      <span>Entry Fee</span>
                    </div>

                  </div>
                </>
              ) : (

                <div className={styles.comingSoonBox}>

                  <div className={styles.comingSoonIcon}>
                    <FiClock />
                  </div>

                  <div>
                    <strong>Coming Soon</strong>

                    <span>
                      Stay tuned for the full experience.
                    </span>
                  </div>

                </div>

              )}


              {/* TOKEN BALANCE */}

              <div className={styles.balanceCard}>

                <div>
                  <span>Your Tokens</span>
                  <strong>{tokens}</strong>
                </div>

                <div className={styles.balanceLabel}>
                  Available balance
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* QUICK INFO */}

        <section className={styles.quickInfo}>

          <InfoCard
            icon={<FiTarget />}
            title={content.quickTitle}
            text={content.quickText}
          />

          <InfoCard
            icon={<FiClock />}
            title="Game Time"
            text={
              isPlayable
                ? "Timed challenge"
                : "Stay tuned"
            }
          />

          <InfoCard
            icon={<FiGift />}
            title="Rewards"
            text="Earn Game Coins"
          />

        </section>


        {/* GUIDE */}

        <section className={styles.infoSection}>

          <div className={styles.infoHeading}>

            <div className={styles.infoHeadingIcon}>
              <FiTarget />
            </div>

            <div>
              <span>GAME GUIDE</span>
              <h2>How to Play</h2>
            </div>

          </div>

          <div className={styles.stepsGrid}>

            {content.steps.map((step, index) => (
              <div
                className={styles.step}
                key={step.title}
              >

                <div className={styles.stepNumber}>
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>

              </div>
            ))}

          </div>

        </section>


        {/* REWARDS */}

        <section className={styles.rewardSection}>

          <div className={styles.rewardLeft}>

            <div className={styles.rewardIcon}>
              <FiAward />
            </div>

            <div>
              <span>GAME REWARDS</span>

              <h2>
                Play → Score → Earn
              </h2>

              <p>
                Complete gameplay and earn Game Coins
                based on your performance.
              </p>
            </div>

          </div>

          <div className={styles.rewardAmount}>

            <img
              src={gameCoinAsset}
              alt=""
            />

            <div>
              <strong>Game Coins</strong>
              <span>
                Centralized rewards balance
              </span>
            </div>

          </div>

        </section>

      </main>


      {/* =================================================
          BOTTOM NAV
      ================================================= */}

      <nav className={styles.bottomNav}>

        <button
          type="button"
          className={`${styles.bottomNavItem} ${styles.bottomNavActive}`}
          onClick={() => navigate(`/game/${id}`)}
        >
          <FiHome />
          <span>Home</span>
        </button>

        <div className={styles.bottomNavDivider} />

        <button
          type="button"
          className={styles.bottomNavItem}
          onClick={() => navigate("/redeem")}
        >
          <FiGift />
          <span>Redeem</span>
        </button>

      </nav>


      {/* =================================================
          INSUFFICIENT TOKENS
      ================================================= */}

      {showInsufficient && (

        <div
          className={styles.modalOverlay}
          onClick={() => setShowInsufficient(false)}
        >

          <div
            className={styles.tokenModal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className={styles.modalIcon}>
              <FiZap />
            </div>

            <span className={styles.modalEyebrow}>
              NOT ENOUGH TOKENS
            </span>

            <h2>
              You're short on Tokens
            </h2>

            <p>
              You need 20 Tokens to start this game.
            </p>

            <div className={styles.balanceCompare}>

              <div>
                <span>Your Balance</span>
                <strong>{tokens}</strong>
              </div>

              <div>
                <span>Required</span>
                <strong>20</strong>
              </div>

            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                setShowInsufficient(false)
              }
            >
              GOT IT
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


function InfoCard({ icon, title, text }) {
  return (
    <div className={styles.infoCard}>

      <div className={styles.infoCardIcon}>
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

    </div>
  );
}

export default GameHomePage;