import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaArrowLeft,
  FaCog,
  FaGamepad,
  FaGift,
  FaPause,
  FaPlay,
  FaStar,
  FaTrophy,
  FaBullseye,
} from "react-icons/fa";
import styles from "./MergeMasterGame.module.css";
import { useGameCoin } from "../../context/GameCoinContext";

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
    }),
  );
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
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
  if (!changed) {
    return { board, gained, changed, spawned: null };
  }

  const emptyAfterMove = [];
  next.forEach((row, r) =>
    row.forEach((value, c) => {
      if (!value) emptyAfterMove.push([r, c]);
    }),
  );

  const spawned = emptyAfterMove.length
    ? emptyAfterMove[Math.floor(Math.random() * emptyAfterMove.length)]
    : null;

  if (spawned) {
    const [r, c] = spawned;
    next[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  return { board: next, gained, changed, spawned };
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

const highestTile = (board) => Math.max(...board.flat(), 0);

const GOAL_REWARDS = { 512: 10, 1024: 20, 2048: 35, 4096: 55 };

const MergeMasterGame = ({ gameCoins, onBack, onRedeem }) => {
  const { gameCoins: contextCoins, addGameCoins } = useGameCoin();

  const displayedCoins = Number.isFinite(Number(contextCoins))
    ? Number(contextCoins)
    : Number.isFinite(Number(gameCoins))
      ? Number(gameCoins)
      : 0;

  const handleRedeem = () => {
    if (typeof onRedeem === "function") {
      onRedeem();
      return;
    }

    window.location.assign("/redeem");
  };
  const [board, setBoard] = useState(createInitialBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = Number(localStorage.getItem("mergeMasterBestScore") || 0);
    return Number.isFinite(saved) ? saved : 0;
  });
  const [bestTile, setBestTile] = useState(4);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [rewardProgress, setRewardProgress] = useState(0);
  const [lastMove, setLastMove] = useState("");
  const [earnedReward, setEarnedReward] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [moveDirection, setMoveDirection] = useState("");
  const [spawnedCell, setSpawnedCell] = useState(null);
  const [moveFlash, setMoveFlash] = useState(false);
  const rewardedGoalsRef = useRef(new Set());
  const moveLockRef = useRef(false);
  const boardRef = useRef(null);

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
        a: "left",
        d: "right",
        w: "up",
        s: "down",
        A: "left",
        D: "right",
        W: "up",
        S: "down",
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
      if (paused || gameOver || moveLockRef.current) return;

      moveLockRef.current = true;
      window.setTimeout(() => {
        moveLockRef.current = false;
      }, 170);

      const result = moveBoard(board, direction);
      if (!result.changed) {
        setMessage("Try another move");
        return;
      }

      const nextScore = score + result.gained;
      const nextBestTile = highestTile(result.board);

      setBoard(result.board);
      setLastMove(direction);
      setMoveDirection(direction);
      setSpawnedCell(result.spawned);
      setMoveFlash(true);
      window.setTimeout(() => setMoveFlash(false), 280);
      window.setTimeout(() => setSpawnedCell(null), 420);
      setScore(nextScore);
      setBestTile((current) => Math.max(current, nextBestTile));
      setBestScore((current) => Math.max(current, nextScore));

      if (result.gained >= 64) {
        setMessage("Great merge!");
        setRewardProgress((current) => Math.min(100, current + 14));
      } else if (result.gained > 0) {
        setMessage("Merge!");
        setRewardProgress((current) => Math.min(100, current + 5));
      } else {
        setMessage("");
      }

      if (nextBestTile >= goal) {
        const reward = GOAL_REWARDS[goal] || 10;
        if (!rewardedGoalsRef.current.has(goal)) {
          rewardedGoalsRef.current.add(goal);
          addGameCoins(reward);
          setEarnedReward(reward);
          setRewardProgress(100);
          setMessage(`Goal ${goal} reached! +${reward} coins`);
        } else {
          setMessage(`Goal ${goal} reached!`);
        }
      }

      if (!canMove(result.board)) {
        setGameOver(true);
        setMessage("No more moves");
      }
    },
    [addGameCoins, board, gameOver, goal, paused, score],
  );

  const restartGame = () => {
    setBoard(createInitialBoard());
    setScore(0);
    setBestTile(4);
    setPaused(false);
    setGameOver(false);
    setMessage("");
    setRewardProgress(0);
    setLastMove("");
    setMoveDirection("");
    setSpawnedCell(null);
    setMoveFlash(false);
    setEarnedReward(0);
    rewardedGoalsRef.current = new Set();
  };

  const handlePointerStart = (event) => {
    if (paused || gameOver) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    boardRef.current = event.currentTarget;
    setTouchStart({ x: event.clientX, y: event.clientY });
    setIsSwiping(true);
  };

  const handlePointerEnd = (event) => {
    if (!touchStart) return;
    event.preventDefault();

    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setTouchStart(null);
    setIsSwiping(false);

    const distance = Math.max(Math.abs(dx), Math.abs(dy));
    if (distance < 34) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      performMove(dx > 0 ? "right" : "left");
    } else {
      performMove(dy > 0 ? "down" : "up");
    }
  };

  const handlePointerCancel = () => {
    setTouchStart(null);
    setIsSwiping(false);
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

        <button className={styles.backButton} onClick={onBack}>
          <FaArrowLeft />
          Back to Games
        </button>

        <div className={styles.headerActions}>
          <div className={styles.coinPill}>
            <span className={styles.coinIcon}>◉</span>
            <strong>{displayedCoins}</strong>
          </div>

          <button className={styles.redeemButton} onClick={handleRedeem}>
            Redeem
          </button>

          <button
            className={styles.settingsButton}
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <FaCog />
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={`${styles.floatTile} ${styles.float256}`}>256</div>
        <div className={`${styles.floatTile} ${styles.float512}`}>512</div>
        <div className={`${styles.floatTile} ${styles.float128}`}>128</div>
        <div className={`${styles.floatTile} ${styles.float1024}`}>1024</div>

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
              <span>
                Merge tiles to
                <br />
                create {goal}
              </span>
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
            ref={boardRef}
            className={[
              styles.board,
              isSwiping ? styles.boardSwiping : "",
              moveDirection
                ? styles[
                    `move${moveDirection[0].toUpperCase()}${moveDirection.slice(1)}`
                  ]
                : "",
              moveFlash ? styles.moveFlash : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onPointerDown={handlePointerStart}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerCancel}
            onContextMenu={(event) => event.preventDefault()}
          >
            {board.flatMap((row, r) =>
              row.map((value, c) => (
                <div
                  key={`${r}-${c}`}
                  className={[
                    styles.cell,
                    value ? styles.occupied : "",
                    getTileClass(value),
                    spawnedCell && spawnedCell[0] === r && spawnedCell[1] === c
                      ? styles.newTile
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {value || ""}
                </div>
              )),
            )}

            {message && <div className={styles.gameMessage}>{message}</div>}

            {paused && (
              <div className={styles.overlay}>
                <FaPause />
                <strong>GAME PAUSED</strong>
                <button onClick={() => setPaused(false)}>
                  <FaPlay /> Resume
                </button>
              </div>
            )}

            {gameOver && (
              <div className={styles.overlay}>
                <strong>GAME OVER</strong>
                <span>Final score: {score.toLocaleString()}</span>
                <button onClick={restartGame}>Play Again</button>
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <div className={styles.swipeHint}>
              <span>↔</span>
              SWIPE TO MERGE
            </div>

            <button
              className={styles.pauseButton}
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Resume game" : "Pause game"}
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
            <div>
              <b>1</b>
              <span>Swipe to move all tiles.</span>
            </div>
            <div>
              <b>2</b>
              <span>Same numbers merge into a bigger number.</span>
            </div>
            <div>
              <b>3</b>
              <span>Keep merging to reach higher numbers.</span>
            </div>
            <div>
              <b>4</b>
              <span>Get the highest score and earn rewards!</span>
            </div>
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
            <strong>
              Small Moves
              <br />
              Big Rewards
            </strong>
            <span>//</span>
          </div>
        </aside>
      </main>

      {settingsOpen && (
        <div className={styles.settingsOverlay} role="dialog" aria-modal="true">
          <div className={styles.settingsCard}>
            <button
              className={styles.settingsClose}
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
            >
              ×
            </button>
            <FaCog />
            <strong>GAME SETTINGS</strong>
            <span>Use swipe, arrow keys or W A S D to move tiles.</span>
            <button onClick={() => setSettingsOpen(false)}>Got it</button>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        PLAY <span>•</span> EARN <span>•</span> REDEEM <span>•</span> REPEAT
      </footer>
    </div>
  );
};

export default MergeMasterGame;
