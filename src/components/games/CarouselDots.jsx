import styles from "./GamesCarousel.module.css";

function CarouselDots({ total, activeIndex }) {
  return (
    <div className={styles.dots}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={`${styles.dot} ${
            index === activeIndex ? styles.activeDot : ""
          }`}
        />
      ))}
    </div>
  );
}

export default CarouselDots;
