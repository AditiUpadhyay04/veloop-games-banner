import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import styles from "./PlayNowButton.module.css";

function PlayNowButton({ game }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Every game opens its own Game Home Page.
    // Actual gameplay is started from the Game Home Page.
    navigate(`/game/${game.id}`);
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      aria-label={`Open ${game.name}`}
    >
      <span className={styles.buttonText}>
        Play Now
      </span>

      <FiArrowRight className={styles.arrow} />
    </button>
  );
}

export default PlayNowButton;