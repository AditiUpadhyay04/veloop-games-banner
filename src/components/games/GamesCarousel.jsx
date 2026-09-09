import { useEffect, useRef, useState } from "react";
import games from "../../data/gamesData";
import GameCard from "./GameCard";
import styles from "./GamesCarousel.module.css";
import CarouselDots from "./CarouselDots";

function GamesCarousel() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const carousel = carouselRef.current;

    let interval;

    const startAutoScroll = () => {
      interval = setInterval(() => {
        if (carousel) {
          carousel.scrollBy({
            left: 304,
            behavior: "smooth",
          });

          setActiveIndex((prev) => (prev + 1) % games.length);
        }
      }, 3000);
    };

    const stopAutoScroll = () => {
      clearInterval(interval);
    };

    startAutoScroll();

    carousel?.addEventListener("mouseenter", stopAutoScroll);
    carousel?.addEventListener("mouseleave", startAutoScroll);

    return () => {
      clearInterval(interval);
      carousel?.removeEventListener("mouseenter", stopAutoScroll);
      carousel?.removeEventListener("mouseleave", startAutoScroll);
    };
  }, []);
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Games</h2>
        <p className={styles.subtitle}>Explore Games & Earn Rewards</p>

        <div ref={carouselRef} className={styles.carousel}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        <CarouselDots total={games.length} activeIndex={activeIndex} />
      </div>
    </section>
  );
}

export default GamesCarousel;
