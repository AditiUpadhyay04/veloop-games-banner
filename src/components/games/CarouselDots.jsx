import styles from "./GamesCarousel.module.css";

function CarouselDots({
  total,
  activeIndex,
  onSelect,
}) {
  return (
    <div
      className={styles.dots}
      aria-label="Game carousel navigation"
    >
      {Array.from({ length: total }).map(
        (_, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.dot} ${
              index === activeIndex
                ? styles.activeDot
                : ""
            }`}
            onClick={() => onSelect(index)}
            aria-label={`Go to game ${index + 1}`}
            aria-current={
              index === activeIndex
                ? "true"
                : undefined
            }
          />
        )
      )}
    </div>
  );
}

export default CarouselDots;