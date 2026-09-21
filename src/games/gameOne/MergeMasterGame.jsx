import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCog,
  FaGamepad,
  FaGift,
  FaLightbulb,
  FaPause,
  FaPlay,
  FaStar,
  FaTrophy,
  FaBullseye,
} from "react-icons/fa";
import styles from "./MergeMasterGame.module.css";

const SIZE = 5;
const STARTING_TILES = 4;

const TILE_COLORS = {
  2: "tile2",
  4: "tile4",
  8: "tile8",
  16: "tile16",
  32: "tile32",
  64: "tile64",
  128: "tile128",
  256: "tile256",
  512: "tile512",
  1024: "tile1024",
  2048: "tile2048",
};

const EMPTY_BOARD = () =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const randomEmptyCell = (board) => {
  const empty = [];
  board.forEach((row, r) =>
    row.forEach((value, c) => {
      if (!value) empty.push([r, c]);
    })
  );
  return empty.length
    ? empty[Math.floor(Math.random() * empty.length)]
    : null;
};

const addRandomTile = (board) => {
  const next = board.map((row) => [...row]);
  const cell = randomEmptyCell(next);
  if (!cell) return next;

  const [r, c] = cell;
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const createInitialBoard = () => {
  let board = EMPTY_BOARD();
  for (let i = 0; i < STARTING_TILES; i += 1) {
    board = addRandomTile(board);
  }
  return board;
};

const slideLine = (line) => {
  const values = line.filter(Boolean);
  const result = [];
  let gained = 0;

  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      const merged = values[i] * 2;
      result.push(merged);
      gained += merged;
      i += 1;
    } else {
      result.push(values[i]);
    }
  }

  while (result.length < SIZE) result.push(0);
  return { line: result, gained };
};

const moveBoard = (board, direction) => {
  const next = EMPTY_BOARD();
  let gained = 0;

  if (direction === "left" || direction === "right") {
    for (let r = 0; r < SIZE; r += 1) {
      let line = [...board[r]];
      if (direction === "right") line.reverse();

      const moved = slideLine(line);
      gained += moved.gained;
      line = moved.line;

      if (direction === "right") line.reverse();
      next[r] = line;
    }
  } else {
    for (let c = 0; c < SIZE; c += 1) {
      let line = board.map((row) => row[c]);
      if (direction === "down") line.reverse();

      const moved = slideLine(line);
      gained += moved.gained;
      line = moved.line;

      if (direction === "down") line.reverse();

      for (let r = 0; r < SIZE; r += 1) {
        next[r][c] = line[r];
      }
    }
  }

  const changed = JSON.stringify(board) !== JSON.stringify(next);
  return { board: changed ? addRandomTile(next) : board, gained, changed };
};

const canMove = (board) => {
  if (board.some((row) => row.some((value) => value === 0))) return true;

  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const value = board[r][c];
      if (r < SIZE - 1 && board[r + 1][c] === value) return true;
      if (c < SIZE - 1 && board[r][c + 1] === value) return true;
    }
  }

  return false;
};

const highestTile = (board) =>
  Math.max(...board.flat(), 0);

const MergeMasterGame = ({
  gameCoins = 108,
  onBack,
  onRedeem,
}) => {
  const [board, setBoard] = useState(createInitialBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = Number(localStorage.getItem("mergeMasterBestScore") || 0);
    return Number.isFinite(saved) ? saved : 0;
  });
  const [bestTile, setBestTile] = useState(4);
  const [hintCount, setHintCount] = useState(2);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [touchStart, setTouchStart] = useState(null);
  const [rewardProgress, setRewardProgress] = useState(0);

  const goal = useMemo(() => {
    const max = highestTile(board);
    if (max < 512) return 512;
    if (max < 1024) return 1024;
    if (max < 2048) return 2048;
    return 4096;
  }, [board]);

  useEffect(() => {
    localStorage.setItem("mergeMasterBestScore", String(bestScore));
  }, [bestScore]);

  useEffect(() => {
    const handleKey = (event) => {
      if (paused || gameOver) return;

      const map = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };

      if (map[event.key]) {
        event.preventDefault();
        performMove(map[event.key]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const performMove = useCallback(
    (direction) => {
      if (paused || gameOver) return;

      const result = moveBoard(board, direction);
      if (!result.changed) {
        setMessage("Try another move");
        return;
      }

      const nextScore = score + result.gained;
      const nextBestTile = highestTile(result.board);

      setBoard(result.board);
      setScore(nextScore);
      setBestTile((current) =>
        Math.max(current, nextBestTile)
      );
      setBestScore((current) =>
        Math.max(current, nextScore)
      );

      if (result.gained >= 64) {
        setMessage("Great merge!");
        setRewardProgress((current) =>
          Math.min(100, current + 14)
        );
      } else if (result.gained > 0) {
        setMessage("Merge!");
        setRewardProgress((current) =>
          Math.min(100, current + 5)
        );
      } else {
        setMessage("");
      }

      if (nextBestTile >= goal) {
        setMessage(`Goal ${goal} reached!`);
      }

      if (!canMove(result.board)) {
        setGameOver(true);
        setMessage("No more moves");
      }
    },
    [board, gameOver, goal, paused, score]
  );

  const restartGame = () => {
    setBoard(createInitialBoard());
    setScore(0);
    setBestTile(4);
    setHintCount(2);
    setPaused(false);
    setGameOver(false);
    setMessage("");
    setRewardProgress(0);
  };

  const useHint = () => {
    if (!hintCount || paused || gameOver) return;

    const candidates = [];

    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (!board[r][c]) continue;

        if (
          c < SIZE - 1 &&
          board[r][c] === board[r][c + 1]
        ) {
          candidates.push([r, c]);
        }

        if (
          r < SIZE - 1 &&
          board[r][c] === board[r + 1][c]
        ) {
          candidates.push([r, c]);
        }
      }
    }

    setHintCount((count) => Math.max(0, count - 1));
    setMessage(
      candidates.length
        ? "Try a matching pair!"
        : "No immediate merge found"
    );
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleTouchEnd = (event) => {
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;

    setTouchStart(null);

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      performMove(dx > 0 ? "right" : "left");
    } else {
      performMove(dy > 0 ? "down" : "up");
    }
  };

  const getTileClass = (value) =>
    value ? styles[TILE_COLORS[value] || "tile2048"] : "";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>∞</div>
          <div>
            <div className={styles.brandName}>VELOOP</div>
            <div className={styles.brandSub}>REWARDS</div>
          </div>
        </div>

        <button
          className={styles.backButton}
          onClick={onBack}
        >
          <FaArrowLeft />
          Back to Games
        </button>

        <div className={styles.headerActions}>
          <div className={styles.coinPill}>
            <span className={styles.coinIcon}>◉</span>
            <strong>{gameCoins}</strong>
          </div>

          <button
            className={styles.redeemButton}
            onClick={onRedeem}
          >
            Redeem
          </button>

          <button
            className={styles.settingsButton}
            aria-label="Settings"
            onClick={() => setMessage("Settings")}
          >
            <FaCog />
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={`${styles.floatTile} ${styles.float256}`}>
          256
        </div>
        <div className={`${styles.floatTile} ${styles.float512}`}>
          512
        </div>
        <div className={`${styles.floatTile} ${styles.float128}`}>
          128
        </div>
        <div className={`${styles.floatTile} ${styles.float1024}`}>
          1024
        </div>

        <div className={styles.crown}>♛</div>
        <h1>MERGE MASTER</h1>
        <div className={styles.heroWords}>
          MERGE <span>•</span> SCORE <span>•</span> RELAX
          <span>•</span> WIN
        </div>
      </section>

      <main className={styles.main}>
        <aside className={styles.leftPanel}>
          <div className={styles.panelTitle}>
            <FaBullseye />
            TARGET
          </div>

          <p className={styles.targetText}>
            Reach the highest number
            <br />
            and get the best rewards!
          </p>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>CURRENT GOAL</div>
            <div className={styles.goalRow}>
              <div className={`${styles.goalTile} ${styles.tile512}`}>
                {goal}
              </div>
              <span>Merge tiles to<br />create {goal}</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <FaTrophy className={styles.infoIconGold} />
            <div>
              <div className={styles.infoLabel}>HIGH SCORE</div>
              <strong>{bestScore.toLocaleString()}</strong>
            </div>
          </div>

          <div className={styles.infoCard}>
            <FaStar className={styles.infoIconCyan} />
            <div>
              <div className={styles.infoLabel}>YOUR BEST TILE</div>
              <strong>{bestTile}</strong>
            </div>
          </div>
        </aside>

        <section className={styles.gameShell}>
          <div className={styles.topStats}>
            <div>
              <span>SCORE</span>
              <strong>{score.toLocaleString()}</strong>
            </div>

            <div>
              <FaTrophy />
              <span>BEST SCORE</span>
              <strong>{bestScore.toLocaleString()}</strong>
            </div>

            <div className={styles.rewardStat}>
              <FaGift />
              <div>
                <span>NEXT REWARD</span>
                <div className={styles.rewardProgress}>
                  <i style={{ width: `${rewardProgress}%` }} />
                </div>
              </div>
              <b>{goal}</b>
            </div>
          </div>

          <div
            className={styles.board}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {board.flatMap((row, r) =>
              row.map((value, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`${styles.cell} ${
                    value ? styles.occupied : ""
                  } ${getTileClass(value)}`}
                >
                  {value || ""}
                </div>
              ))
            )}

            {message && (
              <div className={styles.gameMessage}>
                {message}
              </div>
            )}

            {paused && (
              <div className={styles.overlay}>
                <FaPause />
                <strong>GAME PAUSED</strong>
                <button
                  onClick={() => setPaused(false)}
                >
                  <FaPlay /> Resume
                </button>
              </div>
            )}

            {gameOver && (
              <div className={styles.overlay}>
                <strong>GAME OVER</strong>
                <span>Final score: {score.toLocaleString()}</span>
                <button onClick={restartGame}>
                  Play Again
                </button>
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <button
              className={styles.hintButton}
              onClick={useHint}
              disabled={!hintCount || paused || gameOver}
            >
              <FaLightbulb />
              <span>{hintCount}</span>
            </button>

            <div className={styles.swipeHint}>SWIPE TO MERGE</div>

            <button
              className={styles.pauseButton}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? <FaPlay /> : <FaPause />}
            </button>
          </div>
        </section>

        <aside className={styles.rightPanel}>
          <div className={styles.panelTitle}>
            <FaGamepad />
            HOW TO PLAY
          </div>

          <div className={styles.steps}>
            <div><b>1</b><span>Swipe to move all tiles.</span></div>
            <div><b>2</b><span>Same numbers merge into a bigger number.</span></div>
            <div><b>3</b><span>Keep merging to reach higher numbers.</span></div>
            <div><b>4</b><span>Get the highest score and earn rewards!</span></div>
          </div>

          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>
              <FaStar />
              PREVIEW MERGES
            </div>

            {[
              [4, 4, 8],
              [8, 8, 16],
              [16, 16, 32],
              [32, 32, 64],
            ].map(([a, b, result]) => (
              <div className={styles.mergeRow} key={`${a}-${b}`}>
                <span className={styles.miniTile}>{a}</span>
                <b>+</b>
                <span className={styles.miniTile}>{b}</span>
                <b>→</b>
                <span className={`${styles.miniTile} ${styles.resultTile}`}>
                  {result}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.quote}>
            <span>//</span>
            <strong>Small Moves<br />Big Rewards</strong>
            <span>//</span>
          </div>
        </aside>
      </main>

      <footer className={styles.footer}>
        PLAY <span>•</span> EARN <span>•</span> REDEEM <span>•</span> REPEAT
      </footer>
    </div>
  );
};

export default MergeMasterGame;
