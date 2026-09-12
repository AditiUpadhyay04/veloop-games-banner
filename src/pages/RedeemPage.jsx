import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";

import { useGameCoin } from "../context/GameCoinContext";

import styles from "./RedeemPage.module.css";

import gameCoinIcon from "../assets/games/game_coin.jpeg";
import veIcon from "../assets/games/multi_VEs.jpeg";
import sveIcon from "../assets/games/multi_SVEs.jpeg";
import gemIcon from "../assets/games/multi_gems.jpeg";
import tokenIcon from "../assets/games/multi_token.jpeg";
import spinIcon from "../assets/games/signle_spin.jpeg";

const rewards = [
  {
    id: "ve",
    name: "VE",
    amount: 1,
    cost: 100,
    image: veIcon,
  },
  {
    id: "sve",
    name: "SVE",
    amount: 1,
    cost: 200,
    image: sveIcon,
  },
  {
    id: "gem",
    name: "Gems",
    amount: 10,
    cost: 100,
    image: gemIcon,
  },
  {
    id: "token",
    name: "Tokens",
    amount: 10,
    cost: 80,
    image: tokenIcon,
  },
  {
    id: "spin",
    name: "Spins",
    amount: 1,
    cost: 120,
    image: spinIcon,
  },
];

function RedeemPage() {
  const navigate = useNavigate();

  const { gameCoins, spendGameCoins } = useGameCoin();

  const [selectedReward, setSelectedReward] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const handleRedeemClick = (reward) => {
    if (gameCoins < reward.cost) {
      setShowInsufficient(true);
      return;
    }

    setSelectedReward(reward);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) {
      return;
    }

    const success = spendGameCoins(selectedReward.cost);

    if (!success) {
      setSelectedReward(null);
      setShowInsufficient(true);
      return;
    }

    setSelectedReward(null);
    setShowSuccess(true);
  };

  const closeModal = () => {
    setSelectedReward(null);
    setShowSuccess(false);
    setShowInsufficient(false);
  };

  return (
    <div className={styles.page}>
      {/* =========================
          HEADER
      ========================= */}

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft />
        </button>

        <div className={styles.titleSection}>
          <h1>Redeem</h1>
          <span>Use your Game Coins</span>
        </div>

        <div className={styles.coinBalance}>
          <img src={gameCoinIcon} alt="Game Coins" />

          <div>
            <strong>{gameCoins}</strong>
            <span>Game Coins</span>
          </div>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className={styles.main}>
        <section className={styles.intro}>
          <h2>Redeem Rewards</h2>

          <p>Choose a reward and exchange your Game Coins for it.</p>
        </section>

        {/* =========================
            REWARD GRID
        ========================= */}

        <section className={styles.rewardGrid}>
          {rewards.map((reward) => {
            const canRedeem = gameCoins >= reward.cost;

            return (
              <article key={reward.id} className={styles.rewardCard}>
                <div className={styles.rewardImage}>
                  <img src={reward.image} alt={reward.name} />
                </div>

                <div className={styles.rewardInfo}>
                  <h3>{reward.name}</h3>

                  <p>
                    Get {reward.amount} {reward.name}
                  </p>

                  <div className={styles.rewardCost}>
                    <img src={gameCoinIcon} alt="Game Coins" />

                    <strong>{reward.cost}</strong>

                    <span>Game Coins</span>
                  </div>

                  <button
                    type="button"
                    className={styles.redeemButton}
                    onClick={() => handleRedeemClick(reward)}
                    disabled={!canRedeem}
                  >
                    {canRedeem ? "Redeem" : "Not Enough Coins"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      {/* =========================
          CONFIRM MODAL
      ========================= */}

      {selectedReward && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className={styles.modalIcon}>
              <img src={selectedReward.image} alt={selectedReward.name} />
            </div>

            <h2>Confirm Redemption</h2>

            <p>
              Redeem{" "}
              <strong>
                {selectedReward.amount} {selectedReward.name}
              </strong>{" "}
              for <strong>{selectedReward.cost} Game Coins</strong>?
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirmRedeem}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          SUCCESS MODAL
      ========================= */}

      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.successIcon}>
              <FiCheck />
            </div>

            <h2>Redeemed Successfully!</h2>

            <p>Your reward has been redeemed successfully.</p>

            <button
              type="button"
              className={styles.confirmButton}
              onClick={closeModal}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* =========================
          INSUFFICIENT COINS MODAL
      ========================= */}

      {showInsufficient && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className={styles.warningIcon}>!</div>

            <h2>Not Enough Game Coins</h2>

            <p>You don't have enough Game Coins to redeem this reward.</p>

            <div className={styles.currentBalance}>
              <img src={gameCoinIcon} alt="Game Coins" />

              <strong>{gameCoins}</strong>

              <span>Game Coins available</span>
            </div>

            <button
              type="button"
              className={styles.confirmButton}
              onClick={closeModal}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* =========================
          BOTTOM NAV
      ========================= */}

      <nav className={styles.bottomNav}>
        <button type="button" onClick={() => navigate("/")}>
          Home
        </button>

        <button
          type="button"
          className={styles.activeNav}
          onClick={() => navigate("/redeem")}
        >
          Redeem
        </button>
      </nav>
    </div>
  );
}

export default RedeemPage;
