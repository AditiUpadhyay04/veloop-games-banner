import styles from "./TokenCost.module.css";
import tokenIcon from "../../assets/games/multi_token.jpeg";


function TokenCost({ cost, currency }) {
  return (
    <div className={styles.tokenCost}>
      <img src={tokenIcon} alt="Token" className={styles.tokenIcon} />
      <span>
        {cost} {currency}
      </span>
    </div>
  );
}
export default TokenCost;
