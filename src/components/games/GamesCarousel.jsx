import { useCallback, useEffect, useRef, useState } from "react";
import { FiGift, FiHome } from "react-icons/fi";

import games from "../../data/gamesData";
import GameCard from "./GameCard";
import CarouselDots from "./CarouselDots";
import styles from "./GamesCarousel.module.css";

import { useTokens } from "../../context/TokenContext";
import { useGameCoin } from "../../context/GameCoinContext";
import gameCoinIcon from "../../assets/games/game_coin.jpeg";
import tokenIcon from "../../assets/games/multi_token.jpeg";

const GAP = 24;

function GamesCarousel() {
  const carouselRef = useRef(null);
  const autoScrollRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { tokens } = useTokens();
  const { gameCoins } = useGameCoin();

  const repeatedGames = [...games, ...games, ...games];

  const getStep = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return 304;

    const firstCard = carousel.querySelector("[data-game-card]");

    if (!firstCard) return 304;

    return firstCard.getBoundingClientRect().width + GAP;
  }, []);

  const normalizePosition = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const oneSetWidth = games.length * getStep();

    if (carousel.scrollLeft >= oneSetWidth * 2) {
      carousel.scrollLeft -= oneSetWidth;
    } else if (carousel.scrollLeft <= 0) {
      carousel.scrollLeft += oneSetWidth;
    }
  }, [getStep]);

  const updateActiveIndex = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const step = getStep();
    const rawIndex = Math.round(carousel.scrollLeft / step);

    const normalizedIndex =
      ((rawIndex % games.length) + games.length) % games.length;

    setActiveIndex(normalizedIndex);
  }, [getStep]);

  const scrollNext = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const step = getStep();

    carousel.scrollTo({
      left: carousel.scrollLeft + step,
      behavior: "smooth",
    });
  }, [getStep]);

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);

    clearTimeout(resumeTimerRef.current);

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3500);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const oneSetWidth = games.length * getStep();

    carousel.scrollLeft = oneSetWidth;

    updateActiveIndex();
  }, [getStep, updateActiveIndex]);

  useEffect(() => {
    clearInterval(autoScrollRef.current);

    if (isPaused) return;

    autoScrollRef.current = setInterval(() => {
      scrollNext();
    }, 3000);

    return () => {
      clearInterval(autoScrollRef.current);
    };
  }, [isPaused, scrollNext]);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const handleScroll = () => {
      normalizePosition();
      updateActiveIndex();
    };

    carousel.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
    };
  }, [normalizePosition, updateActiveIndex]);

  useEffect(() => {
    return () => {
      clearInterval(autoScrollRef.current);
      clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const handlePointerEnter = () => {
    setIsPaused(true);
  };

  const handlePointerLeave = () => {
    setIsPaused(false);
  };

  const handleTouchStart = () => {
    pauseTemporarily();
  };

  const handleWheel = () => {
    pauseTemporarily();
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* ================= HEADER ================= */}

        <header className={styles.topBar}>
          <div className={styles.brandArea}>
            <div className={styles.brandIcon}>
              <FiGift />
            </div>

            <div>
              <div className={styles.brandName}>
                VELOOP
              </div>

              <div className={styles.brandSub}>
                REWARDS
              </div>
            </div>
          </div>

          <div className={styles.balanceArea}>

            <div className={styles.balanceItem}>
              <img
                src={tokenIcon}
                alt="Tokens"
              />

              <div>
                <strong>{tokens}</strong>
                <span>Tokens</span>
              </div>
            </div>

            <div className={styles.balanceDivider} />

            <div className={styles.balanceItem}>
              <img
                src={gameCoinIcon}
                alt="Game Coins"
              />

              <div>
                <strong>{gameCoins}</strong>
                <span>Game Coins</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.redeemButton}
              onClick={() => {
                window.location.href = "/redeem";
              }}
            >
              <FiGift />
              <span>Redeem</span>
            </button>

          </div>
        </header>

        {/* ================= SECTION HEADING ================= */}

        <div className={styles.headingArea}>
          <div>
            <span className={styles.sectionEyebrow}>
              PLAY &amp; EARN
            </span>

            <h1 className={styles.heading}>
              Games
            </h1>

            <p className={styles.subtitle}>
              Explore Games &amp; Earn Rewards
            </p>
          </div>

          <div className={styles.desktopHint}>
            <FiHome />
            <span>Choose a game to start</span>
          </div>
        </div>

        {/* ================= CAROUSEL ================= */}

        <div
          ref={carouselRef}
          className={styles.carousel}
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handleTouchStart}
          onWheel={handleWheel}
          aria-label="VELOOP games carousel"
        >
          {repeatedGames.map((game, index) => (
            <div
              key={`${game.id}-${index}`}
              className={styles.card}
              data-game-card
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>

        <CarouselDots
          total={games.length}
          activeIndex={activeIndex}
        />

      </div>
    </section>
  );
}

export default GamesCarousel;