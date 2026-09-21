import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiClock } from "react-icons/fi";

import styles from "./PlayNowButton.module.css";

function PlayNowButton({ game }) {
  const navigate = useNavigate();

  const isPlayable = game.status === "playable";

  const handleClick = () => {
    // Keep the existing Game Home flow for every game.
    navigate(`/game/${game.id}`);
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${
        !isPlayable ? styles.comingSoon : ""
      }`}
      onClick={handleClick}
      aria-label={
        isPlayable
          ? `Open ${game.name}`
          : `View ${game.name}`
      }
    >
      <span className={styles.buttonText}>
        {isPlayable ? "Play Now" : "Coming Soon"}
      </span>

      {isPlayable ? (
        <FiArrowRight className={styles.arrow} />
      ) : (
        <FiClock className={styles.arrow} />
      )}
    </button>
  );
}

export default PlayNowButton;