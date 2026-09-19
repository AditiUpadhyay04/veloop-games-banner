import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiHome,
  FiGift,
  FiCheck,
  FiX,
} from "react-icons/fi";

import { useGameCoin } from "../context/GameCoinContext";

import veIcon from "../assets/games/multi_VEs.jpeg";
import sveIcon from "../assets/games/multi_SVEs.jpeg";
import gemIcon from "../assets/games/multi_gems.jpeg";
import tokenIcon from "../assets/games/multi_token.jpeg";

import styles from "./RedeemPage.module.css";

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
    id: "gems",
    name: "Gems",
    amount: 10,
    cost: 100,
    image: gemIcon,
  },
  {
    id: "tokens",
    name: "Tokens",
    amount: 10,
    cost: 80,
    image: tokenIcon,
  },
  {
    id: "spins",
    name: "Spins",
    amount: 1,
    cost: 120,
    image: gemIcon,
  },
];

function RedeemPage() {
  const navigate = useNavigate();

  const {
    gameCoins,
    spendGameCoins,
  } = useGameCoin();

  const [selectedReward, setSelectedReward] =
    useState(null);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [showInsufficient, setShowInsufficient] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const handleRedeemClick = (reward) => {
    if (gameCoins < reward.cost) {
      setShowInsufficient(true);
      return;
    }

    setSelectedReward(reward);
    setShowConfirm(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;

    const success = spendGameCoins(
      selectedReward.cost
    );

    setShowConfirm(false);

    if (!success) {
      setShowInsufficient(true);
      return;
    }

    setShowSuccess(true);
  };

  const closeModals = () => {
    setShowConfirm(false);
    setShowInsufficient(false);
    setShowSuccess(false);
    setSelectedReward(null);
  };

  return (
    <div className={styles.page}>

      {/* ================= HEADER ================= */}

      <header className={styles.header}>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft />
        </button>

        <div className={styles.headerTitle}>
          <span>VELOOP REWARDS</span>
          <strong>Redeem</strong>
        </div>

        <div className={styles.coinBalance}>
          <span className={styles.coinIcon}>
            🪙
          </span>

          <div>
            <span>GAME COINS</span>
            <strong>{gameCoins}</strong>
          </div>
        </div>

      </header>

      {/* ================= CONTENT ================= */}

      <main className={styles.content}>

        {/* HERO */}

        <section className={styles.hero}>

          <div className={styles.heroIcon}>
            <FiGift />
          </div>

          <div>
            <span className={styles.eyebrow}>
              REWARDS STORE
            </span>

            <h1>
              Redeem your Game Coins
            </h1>

            <p>
              Use your earned Game Coins
              to unlock rewards.
            </p>
          </div>

          <div className={styles.balanceCard}>
            <span>
              AVAILABLE
            </span>

            <strong>
              🪙 {gameCoins}
            </strong>
          </div>

        </section>

        {/* REWARD GRID */}

        <section className={styles.rewardSection}>

          <div className={styles.sectionHeader}>
            <div>
              <span>
                REWARDS
              </span>

              <h2>
                Choose a reward
              </h2>
            </div>

            <small>
              {rewards.length} options
            </small>
          </div>

          <div className={styles.rewardGrid}>

            {rewards.map((reward) => {
              const canRedeem =
                gameCoins >= reward.cost;

              return (
                <article
                  key={reward.id}
                  className={`${styles.rewardCard} ${
                    !canRedeem
                      ? styles.lockedCard
                      : ""
                  }`}
                >

                  <div
                    className={
                      styles.rewardImage
                    }
                  >
                    <img
                      src={reward.image}
                      alt={reward.name}
                    />
                  </div>

                  <div
                    className={
                      styles.rewardInfo
                    }
                  >
                    <span
                      className={
                        styles.rewardAmount
                      }
                    >
                      {reward.amount}{" "}
                      {reward.name}
                    </span>

                    <div
                      className={
                        styles.rewardCost
                      }
                    >
                      <span>
                        🪙
                      </span>

                      <strong>
                        {reward.cost}
                      </strong>

                      <small>
                        Game Coins
                      </small>
                    </div>

                    <button
                      type="button"
                      className={
                        styles.redeemButton
                      }
                      onClick={() =>
                        handleRedeemClick(
                          reward
                        )
                      }
                    >
                      {canRedeem
                        ? "REDEEM"
                        : "INSUFFICIENT"}
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        </section>

        {/* INFO */}

        <section className={styles.infoBox}>

          <div className={styles.infoIcon}>
            🪙
          </div>

          <div>
            <strong>
              How redemption works
            </strong>

            <p>
              Select a reward, confirm the
              redemption and the required
              Game Coins will be deducted
              from your balance.
            </p>
          </div>

        </section>

      </main>

      {/* ================= BOTTOM NAV ================= */}

      <nav className={styles.bottomNav}>

        <button
          type="button"
          className={styles.navItem}
          onClick={() => navigate("/")}
        >
          <FiHome />

          <span>
            Home
          </span>
        </button>

        <button
          type="button"
          className={`${styles.navItem} ${styles.activeNav}`}
        >
          <FiGift />

          <span>
            Redeem
          </span>
        </button>

      </nav>

      {/* ================= CONFIRM MODAL ================= */}

      {showConfirm &&
        selectedReward && (
          <div
            className={styles.modalOverlay}
            onClick={closeModals}
          >

            <div
              className={styles.modal}
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModals}
                aria-label="Close"
              >
                <FiX />
              </button>

              <div
                className={styles.modalIcon}
              >
                <FiGift />
              </div>

              <span
                className={styles.modalLabel}
              >
                CONFIRM REDEMPTION
              </span>

              <h2>
                Redeem{" "}
                {selectedReward.amount}{" "}
                {selectedReward.name}?
              </h2>

              <p>
                {selectedReward.cost} Game
                Coins will be deducted
                from your balance.
              </p>

              <div
                className={
                  styles.confirmSummary
                }
              >
                <span>
                  Current Balance
                </span>

                <strong>
                  🪙 {gameCoins}
                </strong>

                <span>
                  After Redemption
                </span>

                <strong>
                  🪙{" "}
                  {gameCoins -
                    selectedReward.cost}
                </strong>
              </div>

              <div
                className={
                  styles.modalActions
                }
              >

                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={closeModals}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  className={
                    styles.confirmButton
                  }
                  onClick={
                    handleConfirmRedeem
                  }
                >
                  CONFIRM
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ================= INSUFFICIENT MODAL ================= */}

      {showInsufficient && (
        <div
          className={styles.modalOverlay}
          onClick={closeModals}
        >

          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModals}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div
              className={
                styles.warningIcon
              }
            >
              !
            </div>

            <span
              className={styles.modalLabel}
            >
              INSUFFICIENT GAME COINS
            </span>

            <h2>
              Not enough Game Coins
            </h2>

            <p>
              You don't have enough Game
              Coins to redeem this reward.
            </p>

            <div
              className={
                styles.balanceCompare
              }
            >

              <div>
                <span>
                  Your Balance
                </span>

                <strong>
                  🪙 {gameCoins}
                </strong>
              </div>

              <div>
                <span>
                  Need More
                </span>

                <strong>
                  Keep playing
                </strong>
              </div>

            </div>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={closeModals}
            >
              GOT IT
            </button>

          </div>

        </div>
      )}

      {/* ================= SUCCESS MODAL ================= */}

      {showSuccess && (
        <div
          className={styles.modalOverlay}
          onClick={closeModals}
        >

          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={
                styles.successIcon
              }
            >
              <FiCheck />
            </div>

            <span
              className={styles.modalLabel}
            >
              REDEMPTION SUCCESSFUL
            </span>

            <h2>
              Reward redeemed!
            </h2>

            <p>
              Your{" "}
              {selectedReward?.amount}{" "}
              {selectedReward?.name} reward
              has been redeemed successfully.
            </p>

            <div
              className={
                styles.successBalance
              }
            >
              <span>
                Remaining Game Coins
              </span>

              <strong>
                🪙 {gameCoins}
              </strong>
            </div>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={closeModals}
            >
              DONE
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default RedeemPage;