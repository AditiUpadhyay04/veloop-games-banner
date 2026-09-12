import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCoins,
  FaHome,
  FaRedo,
  FaTrophy,
  FaHeart,
  FaInfoCircle,
} from "react-icons/fa";
import { useGameCoin } from "../../context/GameCoinContext";
import styles from "./BladeMasterGame.module.css";

const TOTAL_THROWS = 5;
const REVIVE_THROWS = 3;
const GRAVITY = 800;
const REWARD_COINS = 50;

const DART_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

function BladeMasterGame() {
  const navigate = useNavigate();
  const { addGameCoins } = useGameCoin();

  const arenaRef = useRef(null);
  const animationRef = useRef(null);
  const rewardAddedRef = useRef(false);

  const [angle, setAngle] = useState(0);
  const [power, setPower] = useState(850);

  const [throwCount, setThrowCount] = useState(0);
  const [score, setScore] = useState(0);

  const [knife, setKnife] = useState(null);
  const [stuckKnives, setStuckKnives] = useState([]);

  const [throwing, setThrowing] = useState(false);
  const [message, setMessage] = useState("AIM YOUR KNIFE");
  const [lastPoints, setLastPoints] = useState(null);

  const [showGuide, setShowGuide] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showRevive, setShowRevive] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [reviveUsed, setReviveUsed] = useState(false);
  const [rewardAdded, setRewardAdded] = useState(false);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const calculateScore = (dx, dy, radius) => {
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      return {
        points: 0,
        label: "MISS",
        x: dx,
        y: dy,
      };
    }

    if (distance <= 18) {
      return {
        points: 50,
        label: "BULLSEYE!",
        x: dx,
        y: dy,
      };
    }

    if (distance <= 32) {
      return {
        points: 25,
        label: "OUTER BULL",
        x: dx,
        y: dy,
      };
    }

    let sectorAngle = (Math.atan2(dx, -dy) * 180) / Math.PI;

    if (sectorAngle < 0) {
      sectorAngle += 360;
    }

    const sectorIndex = Math.floor((sectorAngle + 9) / 18) % 20;

    const number = DART_NUMBERS[sectorIndex];

    if (distance >= 72 && distance <= 82) {
      return {
        points: number * 3,
        label: `TRIPLE ${number}`,
        x: dx,
        y: dy,
      };
    }

    if (distance >= 132 && distance <= 148) {
      return {
        points: number * 2,
        label: `DOUBLE ${number}`,
        x: dx,
        y: dy,
      };
    }

    return {
      points: number,
      label: `${number}`,
      x: dx,
      y: dy,
    };
  };

  const finishRound = () => {
    setGameOver(true);

    if (!reviveUsed) {
      setTimeout(() => {
        setShowRevive(true);
      }, 650);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 650);
    }
  };

  const handleResult = (result) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setKnife(null);
    setThrowing(false);

    setLastPoints(result.points);

    setScore((previous) => previous + result.points);

    setMessage(result.label);

    if (result.points > 0) {
      setStuckKnives((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${Math.random()}`,
          x: result.x,
          y: result.y,
          rotation: angle,
        },
      ]);
    }

    const nextThrow = throwCount + 1;

    setThrowCount(nextThrow);

    const currentThrowLimit = reviveUsed
      ? TOTAL_THROWS + REVIVE_THROWS
      : TOTAL_THROWS;

    if (nextThrow >= currentThrowLimit) {
      setTimeout(() => {
        finishRound();
      }, 800);
    } else {
      setTimeout(() => {
        setMessage("AIM YOUR KNIFE");
      }, 750);
    }
  };

  const throwKnife = () => {
    if (throwing || gameOver || showGuide || showRevive || showResult) {
      return;
    }

    const arena = arenaRef.current;

    if (!arena) return;

    const width = arena.clientWidth;
    const height = arena.clientHeight;

    const startX = width / 2;
    const startY = height - 45;

    const targetX = width / 2;
    const targetY = Math.min(205, height * 0.43);

    const radians = (angle * Math.PI) / 180;

    const velocityX = power * Math.sin(radians);

    const velocityY = -power * Math.cos(radians);

    setThrowing(true);
    setMessage("THROW!");
    setLastPoints(null);

    const startTime = performance.now();

    const animate = (currentTime) => {
      const t = (currentTime - startTime) / 1000;

      const x = startX + velocityX * t;

      const y = startY + velocityY * t + 0.5 * GRAVITY * t * t;

      const rotation = angle * 2 + t * 1000;

      setKnife({
        x,
        y,
        rotation,
      });

      if (y <= targetY + 4 && velocityY < 0) {
        const dx = x - targetX;
        const dy = y - targetY;

        const boardRadius = Math.min(150, width * 0.27);

        const result = calculateScore(dx, dy, boardRadius);

        handleResult(result);
        return;
      }

      if (y < targetY - 180 || x < -100 || x > width + 100 || y > height + 50) {
        handleResult({
          points: 0,
          label: "MISS",
          x: x - targetX,
          y: y - targetY,
        });

        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const useRevive = () => {
    setShowRevive(false);
    setGameOver(false);

    setReviveUsed(true);
    setThrowing(false);

    setMessage("REVIVE! KEEP GOING");

    setTimeout(() => {
      setMessage("AIM YOUR KNIFE");
    }, 1000);
  };

  const declineRevive = () => {
    setShowRevive(false);
    setShowResult(true);
  };

  const giveReward = () => {
    if (rewardAddedRef.current) return;

    addGameCoins(REWARD_COINS);

    rewardAddedRef.current = true;
    setRewardAdded(true);
  };

  const finishAndLeave = () => {
    giveReward();
    navigate("/game/1");
  };

  const restartGame = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setAngle(0);
    setPower(850);

    setThrowCount(0);
    setScore(0);

    setKnife(null);
    setStuckKnives([]);

    setThrowing(false);
    setMessage("AIM YOUR KNIFE");
    setLastPoints(null);

    setGameOver(false);
    setShowRevive(false);
    setShowResult(false);

    setReviveUsed(false);

    rewardAddedRef.current = false;
    setRewardAdded(false);

    setShowGuide(true);
  };

  const remainingThrows = Math.max(
    0,
    (reviveUsed ? TOTAL_THROWS + REVIVE_THROWS : TOTAL_THROWS) - throwCount,
  );

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/game/1")}
          aria-label="Back to Blade Master home"
        >
          <FaArrowLeft />
        </button>

        <div className={styles.title}>
          <h1>BLADE MASTER</h1>
          <span>TWIST • AIM • THROW</span>
        </div>

        <div className={styles.scoreBox}>
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>
      </header>

      {/* GAME AREA */}
      <main ref={arenaRef} className={styles.arena}>
        <div className={styles.boardFrame}>
          <div className={styles.board}>
            <div className={styles.outerRing}>
              <div className={styles.numberRing}>
                {DART_NUMBERS.map((number, index) => {
                  const rotation = index * 18;

                  return (
                    <span
                      key={number}
                      className={styles.number}
                      style={{
                        transform: `
                            rotate(${rotation}deg)
                            translateY(-${Math.min(
                              132,
                              arenaRef.current
                                ? arenaRef.current.clientWidth * 0.23
                                : 132,
                            )}px)
                            rotate(-${rotation}deg)
                          `,
                      }}
                    >
                      {number}
                    </span>
                  );
                })}

                <div className={styles.tripleRing} />
                <div className={styles.doubleRing} />

                <div className={styles.bull}>
                  <div className={styles.outerBull} />
                  <div className={styles.innerBull} />
                </div>
              </div>
            </div>

            {stuckKnives.map((item) => (
              <div
                key={item.id}
                className={styles.stuckKnife}
                style={{
                  left: `calc(50% + ${item.x}px)`,
                  top: `calc(50% + ${item.y}px)`,
                  transform: `
                    translate(-50%, -50%)
                    rotate(${item.rotation}deg)
                  `,
                }}
              >
                <span />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.message}>
          {message}

          {lastPoints !== null && (
            <strong>{lastPoints > 0 ? ` +${lastPoints}` : " 0"}</strong>
          )}
        </div>

        {knife && (
          <div
            className={styles.flyingKnife}
            style={{
              left: knife.x,
              top: knife.y,
              transform: `
                translate(-50%, -50%)
                rotate(${knife.rotation}deg)
              `,
            }}
          >
            <span />
          </div>
        )}

        <div className={styles.thrower}>
          <div className={styles.hand}>✋</div>

          <div className={styles.launchKnife}>
            <span />
          </div>
        </div>

        <div className={styles.throwCounter}>
          KNIVES
          <strong>{remainingThrows}</strong>
        </div>
      </main>

      {/* CONTROLS */}
      <section className={styles.controls}>
        <div className={styles.control}>
          <div className={styles.controlTop}>
            <span>ANGLE</span>

            <strong>
              {angle > 0 ? "+" : ""}
              {Math.round(angle)}°
            </strong>
          </div>

          <input
            type="range"
            min="-22"
            max="22"
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value))}
            disabled={throwing || gameOver}
            aria-label="Knife angle"
          />

          <div className={styles.rangeLabels}>
            <span>LEFT</span>
            <span>CENTER</span>
            <span>RIGHT</span>
          </div>
        </div>

        <div className={styles.control}>
          <div className={styles.controlTop}>
            <span>THROW POWER</span>

            <strong>{Math.round(power)}</strong>
          </div>

          <input
            type="range"
            min="700"
            max="1050"
            value={power}
            onChange={(event) => setPower(Number(event.target.value))}
            disabled={throwing || gameOver}
            aria-label="Throw power"
          />

          <div className={styles.rangeLabels}>
            <span>LOW</span>
            <span>MEDIUM</span>
            <span>HIGH</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.throwButton}
          onClick={throwKnife}
          disabled={
            throwing ||
            gameOver ||
            showGuide ||
            showRevive ||
            showResult ||
            remainingThrows <= 0
          }
        >
          <span className={styles.buttonKnife}>
            <span />
          </span>

          {throwing ? "THROWING..." : "THROW KNIFE"}
        </button>

        <p className={styles.physicsText}>
          Angle changes direction • Power changes velocity • Gravity controls
          the trajectory
        </p>
      </section>

      {/* FIRST-TIME GUIDE */}
      {showGuide && (
        <div className={styles.overlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalIcon}>
              <FaInfoCircle />
            </div>

            <span className={styles.modalLabel}>HOW TO PLAY</span>

            <h2>Master the Throw</h2>

            <p className={styles.modalIntro}>
              Hit the dartboard with your knives and score as many points as
              possible.
            </p>

            <div className={styles.guideList}>
              <div>
                <span>1</span>
                <p>
                  Adjust <strong>Angle</strong> to aim left or right.
                </p>
              </div>

              <div>
                <span>2</span>
                <p>
                  Adjust <strong>Power</strong> to control your throw.
                </p>
              </div>

              <div>
                <span>3</span>
                <p>
                  Hit the board to earn points. Bullseye gives the highest
                  score.
                </p>
              </div>

              <div>
                <span>4</span>
                <p>
                  You have <strong>5 knives</strong>. Use them carefully.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setShowGuide(false)}
            >
              START GAME
            </button>
          </div>
        </div>
      )}

      {/* REVIVE */}
      {showRevive && (
        <div className={styles.overlay}>
          <div className={styles.modalCard}>
            <div className={styles.reviveIcon}>
              <FaHeart />
            </div>

            <span className={styles.modalLabel}>ROUND OVER</span>

            <h2>Need Another Chance?</h2>

            <p className={styles.modalIntro}>
              Revive your round and get
              <strong> 3 extra knives</strong> to improve your score.
            </p>

            <div className={styles.currentScore}>
              <span>CURRENT SCORE</span>
              <strong>{score}</strong>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={declineRevive}
              >
                No Thanks
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={useRevive}
              >
                <FaHeart />
                Revive +3
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT */}
      {showResult && (
        <div className={styles.overlay}>
          <div className={styles.resultCard}>
            <FaTrophy className={styles.trophy} />

            <span className={styles.modalLabel}>BLADE MASTER</span>

            <h2>{score >= 200 ? "AMAZING SCORE!" : "ROUND COMPLETE"}</h2>

            <p>Your knives have found their mark.</p>

            <div className={styles.finalScore}>
              <span>FINAL SCORE</span>
              <strong>{score}</strong>
            </div>

            <div className={styles.reward}>
              <FaCoins />
              <span>+{REWARD_COINS} Game Coins</span>
            </div>

            <div className={styles.resultButtons}>
              <button
                type="button"
                className={styles.playAgain}
                onClick={restartGame}
              >
                <FaRedo />
                Play Again
              </button>

              <button
                type="button"
                className={styles.homeButton}
                onClick={finishAndLeave}
              >
                <FaHome />
                Game Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BladeMasterGame;
