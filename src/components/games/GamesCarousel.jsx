import { useCallback, useEffect, useRef, useState } from "react";
import games from "../../data/gamesData";
import GameCard from "./GameCard";
import CarouselDots from "./CarouselDots";
import styles from "./GamesCarousel.module.css";

const CARD_WIDTH = 280;
const GAP = 24;
const STEP = CARD_WIDTH + GAP;

function GamesCarousel() {
  const carouselRef = useRef(null);
  const autoScrollRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const updateActiveIndex = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const rawIndex = Math.round(
      carousel.scrollLeft / STEP
    );

    const normalizedIndex =
      ((rawIndex % games.length) + games.length) %
      games.length;

    setActiveIndex(normalizedIndex);
  }, []);

  const scrollNext = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const nextPosition =
      carousel.scrollLeft + STEP;

    carousel.scrollTo({
      left: nextPosition,
      behavior: "smooth",
    });
  }, []);

  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    /*
      We render 3 copies of the games.
      When the user reaches the second copy,
      silently move back to the equivalent
      position in the first copy.

      This creates a seamless infinite loop.
    */

    const oneSetWidth =
      games.length * STEP;

    if (
      carousel.scrollLeft >=
      oneSetWidth * 2
    ) {
      carousel.scrollLeft -= oneSetWidth;
    }

    if (carousel.scrollLeft < 1) {
      carousel.scrollLeft += oneSetWidth;
    }

    updateActiveIndex();
  }, [updateActiveIndex]);

  const startAutoScroll = useCallback(() => {
    clearInterval(autoScrollRef.current);

    autoScrollRef.current = setInterval(() => {
      if (!isPaused) {
        scrollNext();
      }
    }, 2800);
  }, [isPaused, scrollNext]);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    /*
      Start in the middle copy.
      This allows scrolling both directions
      without immediately reaching an edge.
    */

    carousel.scrollLeft =
      games.length * STEP;

    updateActiveIndex();

    startAutoScroll();

    return () => {
      clearInterval(autoScrollRef.current);
    };
  }, [startAutoScroll, updateActiveIndex]);

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    carousel.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      carousel.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [handleScroll]);

  const handlePointerEnter = () => {
    setIsPaused(true);
  };

  const handlePointerLeave = () => {
    setIsPaused(false);
  };

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
  };

  const repeatedGames = [
    ...games,
    ...games,
    ...games,
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        <h2 className={styles.heading}>
          Games
        </h2>

        <p className={styles.subtitle}>
          Explore Games &amp; Earn Rewards
        </p>

        <div
          ref={carouselRef}
          className={styles.carousel}
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          aria-label="VELOOP games carousel"
        >
          {repeatedGames.map((game, index) => (
            <div
              key={`${game.id}-${index}`}
              className={styles.card}
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