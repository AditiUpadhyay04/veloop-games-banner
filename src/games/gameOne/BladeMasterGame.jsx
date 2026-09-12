import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCoins, FaHome, FaRedo, FaTrophy } from "react-icons/fa";
import { useGameCoin } from "../../context/GameCoinContext";
import styles from "./BladeMasterGame.module.css";

const TOTAL_THROWS = 5;
const GRAVITY = 800;

const DART_NUMBERS = [
  20, 1, 18, 4, 13,
  6, 10, 15, 2, 17,
  3, 19, 7, 16, 8,
  11, 14, 9, 12, 5,
];

function BladeMasterGame() {
  const navigate = useNavigate();
  const { addGameCoins } = useGameCoin();

  const arenaRef = useRef(null);
  const animationRef = useRef(null);

  const [angle, setAngle] = useState(0);
  const [power, setPower] = useState(850);

  const [throwCount, setThrowCount] = useState(0);
  const [score, setScore] = useState(0);

  const [knife, setKnife] = useState(null);
  const [stuckKnives, setStuckKnives] = useState([]);

  const [throwing, setThrowing] = useState(false);
  const [message, setMessage] = useState("AIM YOUR KNIFE");
  const [lastPoints, setLastPoints] = useState(null);

  const [gameFinished, setGameFinished] = useState(false);
  const [rewardAdded, setRewardAdded] = useState(false);

  /* ---------------------------
     Cleanup
  --------------------------- */

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  /* ---------------------------
     Calculate dart score
  --------------------------- */

  const calculateScore = (dx, dy, radius) => {
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Outside board
    if (distance > radius) {
      return {
        points: 0,
        label: "MISS",
        x: dx,
        y: dy,
      };
    }

    // Bullseye
    if (distance <= 18) {
      return {
        points: 50,
        label: "BULLSEYE!",
        x: dx,
        y: dy,
      };
    }

    // Outer bull
    if (distance <= 32) {
      return {
        points: 25,
        label: "OUTER BULL",
        x: dx,
        y: dy,
      };
    }

    // Find numbered sector.
    // Angle is measured from the top and clockwise.
    let sectorAngle =
      (Math.atan2(dx, -dy) * 180) / Math.PI;

    if (sectorAngle < 0) {
      sectorAngle += 360;
    }

    const sectorIndex =
      Math.floor((sectorAngle + 9) / 18) % 20;

    const number = DART_NUMBERS[sectorIndex];

    // Triple ring
    if (distance >= 72 && distance <= 82) {
      return {
        points: number * 3,
        label: `TRIPLE ${number}`,
        x: dx,
        y: dy,
      };
    }

    // Double ring
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

  /* ---------------------------
     Throw knife
  --------------------------- */

  const throwKnife = () => {
    if (throwing || gameFinished) return;

    const arena = arenaRef.current;

    if (!arena) return;

    const width = arena.clientWidth;
    const height = arena.clientHeight;

    /*
      Coordinate system:

      start = bottom centre
      target = upper centre

      θ = horizontal deviation from vertical

      vx = v sin(θ)
      vy = -v cos(θ)

      x(t) = x0 + vx*t
      y(t) = y0 + vy*t + 1/2*g*t²
    */

    const startX = width / 2;
    const startY = height - 45;

    const targetX = width / 2;
    const targetY = Math.min(205, height * 0.43);

    const radians = (angle * Math.PI) / 180;

    const velocityX =
      power * Math.sin(radians);

    const velocityY =
      -power * Math.cos(radians);

    setThrowing(true);
    setMessage("THROW!");
    setLastPoints(null);

    const startTime = performance.now();

    const animate = (currentTime) => {
      const t = (currentTime - startTime) / 1000;

      const x =
        startX + velocityX * t;

      const y =
        startY +
        velocityY * t +
        0.5 * GRAVITY * t * t;

      const rotation =
        angle * 2 + t * 1000;

      setKnife({
        x,
        y,
        rotation,
      });

      /*
        Check when knife reaches
        target's vertical level.
      */

      if (y <= targetY + 4 && velocityY < 0) {
        const dx = x - targetX;
        const dy = y - targetY;

        const boardRadius = Math.min(
          150,
          width * 0.27
        );

        const result = calculateScore(
          dx,
          dy,
          boardRadius
        );

        handleResult(result);

        return;
      }

      /*
        Missed and passed the target.
      */

      if (
        y < targetY - 180 ||
        x < -100 ||
        x > width + 100 ||
        y > height + 50
      ) {
        handleResult({
          points: 0,
          label: "MISS",
          x: x - targetX,
          y: y - targetY,
        });

        return;
      }

      animationRef.current =
        requestAnimationFrame(animate);
    };

    animationRef.current =
      requestAnimationFrame(animate);
  };

  /* ---------------------------
     Handle result
  --------------------------- */

  const handleResult = (result) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setKnife(null);
    setThrowing(false);

    setLastPoints(result.points);

    setScore((previous) =>
      previous + result.points
    );

    setMessage(result.label);

    /*
      Only keep knives that
      actually hit the board.
    */

    if (result.points > 0) {
      setStuckKnives((previous) => [
        ...previous,
        {
          id: Date.now(),
          x: result.x,
          y: result.y,
          rotation: angle,
        },
      ]);
    }

    const nextThrow = throwCount + 1;

    setThrowCount(nextThrow);

    if (nextThrow >= TOTAL_THROWS) {
      setTimeout(() => {
        setGameFinished(true);
      }, 900);
    } else {
      setTimeout(() => {
        setMessage("AIM YOUR KNIFE");
      }, 850);
    }
  };

  /* ---------------------------
     Reward
  --------------------------- */

  useEffect(() => {
    if (gameFinished && !rewardAdded) {
      addGameCoins(50);
      setRewardAdded(true);
    }
  }, [
    gameFinished,
    rewardAdded,
    addGameCoins,
  ]);

  /* ---------------------------
     Restart
  --------------------------- */

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
    setGameFinished(false);
    setRewardAdded(false);
  };

  return (
    <div className={styles.page}>

      {/* HEADER */}

      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          aria-label="Home"
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

      <main
        ref={arenaRef}
        className={styles.arena}
      >

        {/* Wooden board frame */}

        <div className={styles.boardFrame}>
          <div className={styles.board}>

            {/* Dartboard rings */}

            <div className={styles.outerRing}>
              <div className={styles.numberRing}>

                {DART_NUMBERS.map(
                  (number, index) => {
                    const rotation =
                      index * 18;

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
                                ? arenaRef.current.clientWidth *
                                  0.23
                                : 132
                            )}px)
                            rotate(-${rotation}deg)
                          `,
                        }}
                      >
                        {number}
                      </span>
                    );
                  }
                )}

                <div className={styles.tripleRing} />
                <div className={styles.doubleRing} />

                <div className={styles.bull}>
                  <div className={styles.outerBull} />
                  <div className={styles.innerBull} />
                </div>

              </div>
            </div>

            {/* Stuck knives */}

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

        {/* Message */}

        <div className={styles.message}>
          {message}

          {lastPoints !== null && (
            <strong>
              {lastPoints > 0
                ? ` +${lastPoints}`
                : " 0"}
            </strong>
          )}
        </div>

        {/* Throwing knife */}

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

        {/* Throwing hand / knife launcher */}

        <div className={styles.thrower}>
          <div className={styles.hand}>
            ✋
          </div>

          <div className={styles.launchKnife}>
            <span />
          </div>
        </div>

        {/* Throw counter */}

        <div className={styles.throwCounter}>
          KNIVES
          <strong>
            {TOTAL_THROWS - throwCount}
          </strong>
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
            onChange={(event) =>
              setAngle(
                Number(event.target.value)
              )
            }
            disabled={throwing}
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
            <strong>
              {Math.round(power)}
            </strong>
          </div>

          <input
            type="range"
            min="700"
            max="1050"
            value={power}
            onChange={(event) =>
              setPower(
                Number(event.target.value)
              )
            }
            disabled={throwing}
          />

          <div className={styles.rangeLabels}>
            <span>LOW</span>
            <span>MEDIUM</span>
            <span>HIGH</span>
          </div>
        </div>

        <button
          className={styles.throwButton}
          onClick={throwKnife}
          disabled={
            throwing ||
            gameFinished ||
            throwCount >= TOTAL_THROWS
          }
        >
          <span className={styles.buttonKnife}>
            <span />
          </span>

          {throwing
            ? "THROWING..."
            : "THROW KNIFE"}
        </button>

        <p className={styles.physicsText}>
          Angle changes direction • Power changes
          velocity • Gravity controls the trajectory
        </p>

      </section>

      {/* RESULT */}

      {gameFinished && (
        <div className={styles.overlay}>
          <div className={styles.resultCard}>

            <FaTrophy
              className={styles.trophy}
            />

            <h2>
              {score >= 200
                ? "BLADE MASTER!"
                : "ROUND COMPLETE"}
            </h2>

            <p>
              Your knives have found their mark.
            </p>

            <div className={styles.finalScore}>
              <span>FINAL SCORE</span>
              <strong>{score}</strong>
            </div>

            <div className={styles.reward}>
              <FaCoins />
              <span>+50 Game Coins</span>
            </div>

            <div className={styles.resultButtons}>

              <button
                className={styles.playAgain}
                onClick={restartGame}
              >
                <FaRedo />
                Play Again
              </button>

              <button
                className={styles.homeButton}
                onClick={() => navigate("/")}
              >
                <FaHome />
                Home
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default BladeMasterGame; 