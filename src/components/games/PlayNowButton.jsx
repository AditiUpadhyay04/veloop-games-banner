import styles from "./PlayNowButton.module.css";
import { useGameCoin } from "../../context/GameCoinContext";

function PlayNowButton({ game }) {
  const { tokens, spendTokens } = useGameCoin();

  const handlePlay = () => {
    const success = spendTokens(game.cost);

    if (!success) {
      alert(
        `Not Enough Tokens\nYou need ${game.cost} Tokens to play.\nYour Balance: ${tokens} Tokens`,
      );
      return;
    }

    console.log(`Playing ${game.name}`);
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
