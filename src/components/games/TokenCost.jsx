import styles from "./TokenCost.module.css";
import tokenIcon from "../../assets/games/multi_token.jpeg";

function TokenCost({ cost, currency }) {
  return (
    <div className={styles.cost}>
      <img
        src={tokenIcon}
        alt="Tokens"
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