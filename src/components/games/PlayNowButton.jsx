import styles from "./PlayNowButton.module.css";
import { useNavigate } from "react-router-dom";

function PlayNowButton({ game }) {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate(`/game/${game.id}`);
  };
  return (
    <button
      type="button"
      className={styles.playButton}
      onClick={handlePlay}
      aria-label={`Play ${game.name}`}
    >
      <span>Play Now</span>
      <span className={styles.arrow}>→</span>
    </button>
  );
}

export default PlayNowButton;
