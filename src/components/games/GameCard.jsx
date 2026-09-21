import { useState } from "react";
import { motion } from "framer-motion";

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
    <motion.article
      className={styles.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--mouse-x": `${mousePosition.x}%`,
        "--mouse-y": `${mousePosition.y}%`,
      }}
      whileHover={{
        y: -6,
        scale: 1.012,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
    >
      {/* premium cursor reflection */}
      <div className={styles.cardReflection} />

      {/* image */}
      <div className={styles.imageWrap}>
        <img
          src={game.image}
          alt={`${game.name} game artwork`}
          className={styles.image}
          loading="lazy"
          draggable="false"
        />

        <div className={styles.imageOverlay} />

        {/* subtle image glow */}
        <div className={styles.imageGlow} />

        {/* status */}
        <div
          className={`${styles.statusBadge} ${
            isPlayable ? styles.playableBadge : styles.comingSoonBadge
          }`}
        >
          <span className={styles.statusDot} />
          {isPlayable ? "PLAYABLE" : "COMING SOON"}
        </div>

        {/* game info */}
        <div className={styles.gameInfo}>
          <span className={styles.gameType}>
            {game.type}
          </span>

          <h3>{game.name}</h3>
        </div>
      </div>

      {/* bottom */}
      <div className={styles.bottom}>
        <TokenCost
          cost={game.cost}
          currency={game.currency}
        />

        <PlayNowButton game={game} />
      </div>
    </motion.article>
  );
}

export default GameCard;