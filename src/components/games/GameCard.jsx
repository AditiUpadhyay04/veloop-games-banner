import { useState } from "react";
import styles from "./GameCard.module.css";
import PlayNowButton from "./PlayNowButton";
import TokenCost from "./TokenCost";

function GameCard({ game }) {
  const isPlayable = game.status === "playable";

  const [mousePosition, setMousePosition] = useState({
    x: 50,
    y: 50,
  });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 100;

    const y =
      ((event.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({
      x: 50,
      y: 50,
    });
  };

  return (
    <article
      className={styles.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--mouse-x": `${mousePosition.x}%`,
        "--mouse-y": `${mousePosition.y}%`,
      }}
    >
      {/* Premium light reflection */}
      <div className={styles.cardReflection} />

      <div className={styles.imageWrap}>
        <img
          src={game.image}
          alt={`${game.name} game artwork`}
          className={styles.image}
          loading="lazy"
          draggable="false"
        />

        <div className={styles.imageOverlay} />

        {/* Top-left status */}
        <div className={styles.statusBadge}>
          {isPlayable ? "NEW" : "COMING SOON"}
        </div>

        {/* Game information */}
        <div className={styles.gameInfo}>
          <span className={styles.gameType}>
            {game.type}
          </span>

          <h3>{game.name}</h3>
        </div>
      </div>

      {/* Bottom glass panel */}
      <div className={styles.bottom}>
        <TokenCost
          cost={game.cost}
          currency={game.currency}
        />

        <PlayNowButton game={game} />
      </div>
    </article>
  );
}

export default GameCard;