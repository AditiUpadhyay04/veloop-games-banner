import styles from "./TokenCost.module.css";

function TokenCost({ cost, currency }) {
  return (
    <div className={styles.cost}>
      <img
        src="/src/assets/games/multi_token.jpeg"
        alt=""
        className={styles.icon}
        draggable="false"
      />

      <span>
        {cost} {currency}
      </span>
    </div>
  );
}

export default TokenCost;