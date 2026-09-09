import styles from "./GameCard.module.css";
import PlayNowButton from "./PlayNowButton";
import TokenCost from "./TokenCost";

function GameCard({ game }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={game.image}
          alt={`${game.name} game`}
          className={styles.gameImage}
          loading="lazy"
        />
      </div>

      <div className={styles.bottomSection}>
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