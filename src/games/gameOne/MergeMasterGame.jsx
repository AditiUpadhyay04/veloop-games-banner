import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiAward,
  FiClock,
  FiGift,
  FiRotateCcw,
  FiX,
  FiZap,
} from "react-icons/fi";

import { useGameCoin } from "../../context/GameCoinContext";
import styles from "./MergeMasterGame.module.css";

const SIZE = 4;
const START_TIME = 90;
const REVIVE_TIME = 30;

function emptyBoard() {
  return Array(SIZE * SIZE).fill(0);
}

function addRandomTile(board) {
  const next = [...board];

  const empty = next
    .map((value, index) =>
      value === 0 ? index : -1
    )
    .filter((index) => index !== -1);

  if (!empty.length) {
    return next;
  }

  const index =
    empty[Math.floor(Math.random() * empty.length)];

  next[index] =
    Math.random() < 0.9 ? 2 : 4;

  return next;
}

function createBoard() {
  let board = emptyBoard();

  board = addRandomTile(board);
  board = addRandomTile(board);

  return board;
}

function slide(line) {
  const values = line.filter(
    (value) => value !== 0
  );

  const result = [];
  let gained = 0;

  for (let i = 0; i < values.length; i++) {
    if (
      i < values.length - 1 &&
      values[i] === values[i + 1]
    ) {
      const merged = values[i] * 2;

      result.push(merged);
      gained += merged;

      i++;
    } else {
      result.push(values[i]);
    }
  }

  while (result.length < SIZE) {
    result.push(0);
  }

  return {
    line: result,
    gained,
  };
}

function moveBoard(board, direction) {
  const next = emptyBoard();
  let gained = 0;

  const indexOf = (row, col) =>
    row * SIZE + col;

  if (
    direction === "left" ||
    direction === "right"
  ) {
    for (let row = 0; row < SIZE; row++) {
      let line = [];

      for (let i = 0; i < SIZE; i++) {
        const col =
          direction === "left"
            ? i
            : SIZE - 1 - i;

        line.push(
          board[indexOf(row, col)]
        );
      }

      const result = slide(line);

      gained += result.gained;

      if (direction === "right") {
        result.line.reverse();
      }

      for (let col = 0; col < SIZE; col++) {
        const actualCol =
          direction === "left"
            ? col
            : SIZE - 1 - col;

        next[indexOf(row, actualCol)] =
          result.line[col];
      }
    }
  }

  if (
    direction === "up" ||
    direction === "down"
  ) {
    for (let col = 0; col < SIZE; col++) {
      let line = [];

      for (let i = 0; i < SIZE; i++) {
        const row =
          direction === "up"
            ? i
            : SIZE - 1 - i;

        line.push(
          board[indexOf(row, col)]
        );
      }

      const result = slide(line);

      gained += result.gained;

      if (direction === "down") {
        result.line.reverse();
      }

      for (let row = 0; row < SIZE; row++) {
        const actualRow =
          direction === "up"
            ? row
            : SIZE - 1 - row;

        next[indexOf(actualRow, col)] =
          result.line[row];
      }
    }
  }

  return {
    board: next,
    gained,
  };
}

function canMove(board) {
  if (board.some((value) => value === 0)) {
    return true;
  }

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const index = row * SIZE + col;

      if (
        col < SIZE - 1 &&
        board[index] === board[index + 1]
      ) {
        return true;
      }

      if (
        row < SIZE - 1 &&
        board[index] ===
          board[index + SIZE]
      ) {
        return true;
      }
    }
  }

  return false;
}

function getReward(score) {
  if (score >= 1500) return 40;
  if (score >= 1000) return 30;
  if (score >= 500) return 20;

  return 10;
}

function MergeMasterGame() {
  const navigate = useNavigate();
  const { addGameCoins } = useGameCoin();

  const [board, setBoard] =
    useState(createBoard);

  const [score, setScore] =
    useState(0);

  const [moves, setMoves] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(START_TIME);

  const [showGuide, setShowGuide] =
    useState(true);

  const [showRevive, setShowRevive] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [reviveUsed, setReviveUsed] =
    useState(false);

  const [rewardAdded, setRewardAdded] =
    useState(false);

  const reward = getReward(score);

  /* =========================================
     TIMER
  ========================================= */

  useEffect(() => {
    if (
      showGuide ||
      showRevive ||
      gameOver
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);

          setShowRevive(true);

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    showGuide,
    showRevive,
    gameOver,
  ]);

  /* =========================================
     FINISH
  ========================================= */

  const finishGame = useCallback(() => {
    if (!rewardAdded) {
      addGameCoins(reward);
      setRewardAdded(true);
    }

    setShowRevive(false);
    setGameOver(true);
  }, [
    addGameCoins,
    reward,
    rewardAdded,
  ]);

  /* =========================================
     MOVE
  ========================================= */

  const handleMove = useCallback(
    (direction) => {
      if (
        showGuide ||
        showRevive ||
        gameOver
      ) {
        return;
      }

      const result =
        moveBoard(
          board,
          direction
        );

      const changed =
        JSON.stringify(board) !==
        JSON.stringify(result.board);

      if (!changed) {
        if (!canMove(board)) {
          setShowRevive(true);
        }

        return;
      }

      const updatedBoard =
        addRandomTile(
          result.board
        );

      setBoard(updatedBoard);

      setScore(
        (current) =>
          current + result.gained
      );

      setMoves(
        (current) => current + 1
      );

      if (!canMove(updatedBoard)) {
        setShowRevive(true);
      }
    },
    [
      board,
      gameOver,
      showGuide,
      showRevive,
    ]
  );

  /* =========================================
     KEYBOARD
  ========================================= */

  useEffect(() => {
    const onKeyDown = (event) => {
      const map = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
      };

      const direction =
        map[event.key];

      if (!direction) {
        return;
      }

      event.preventDefault();

      handleMove(direction);
    };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [handleMove]);

  /* =========================================
     TOUCH
  ========================================= */

  const [touchStart, setTouchStart] =
    useState(null);

  const handleTouchStart = (event) => {
    const touch =
      event.touches[0];

    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleTouchEnd = (event) => {
    if (!touchStart) {
      return;
    }

    const touch =
      event.changedTouches[0];

    const dx =
      touch.clientX - touchStart.x;

    const dy =
      touch.clientY - touchStart.y;

    const threshold = 30;

    if (
      Math.abs(dx) < threshold &&
      Math.abs(dy) < threshold
    ) {
      setTouchStart(null);
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(
        dx > 0 ? "right" : "left"
      );
    } else {
      handleMove(
        dy > 0 ? "down" : "up"
      );
    }

    setTouchStart(null);
  };

  /* =========================================
     RESET
  ========================================= */

  const resetGame = () => {
    setBoard(createBoard());
    setScore(0);
    setMoves(0);
    setTimeLeft(START_TIME);
    setShowGuide(false);
    setShowRevive(false);
    setGameOver(false);
    setReviveUsed(false);
    setRewardAdded(false);
  };

  /* =========================================
     REVIVE
  ========================================= */

  const handleRevive = () => {
    if (reviveUsed) {
      finishGame();
      return;
    }

    setReviveUsed(true);
    setShowRevive(false);
    setTimeLeft(REVIVE_TIME);
  };

  /* =========================================
     NO THANKS
  ========================================= */

  const handleNoThanks = () => {
    finishGame();
    navigate("/game/10");
  };

  const bestTile =
    Math.max(...board);

  /* =========================================
     GUIDE
  ========================================= */

  if (showGuide) {
    return (
      <div className={styles.page}>

        <header className={styles.header}>

          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              navigate("/game/10")
            }
          >
            <FiArrowLeft />
          </button>

          <div className={styles.title}>
            <span>MERGE MASTER</span>
            <strong>PUZZLE CHALLENGE</strong>
          </div>

          <div className={styles.headerRight}>
            <FiZap />
            <span>READY</span>
          </div>

        </header>

        <main className={styles.main}>

          <section className={styles.guideCard}>

            <div className={styles.guideIcon}>
              <FiZap />
            </div>

            <span className={styles.guideLabel}>
              HOW TO PLAY
            </span>

            <h1>Merge Master</h1>

            <p>
              Combine matching number tiles,
              create larger values and build
              the highest score you can.
            </p>

            <div className={styles.guideGrid}>

              <GuideItem
                number="01"
                title="Swipe the board"
                text="Move tiles up, down, left or right."
              />

              <GuideItem
                number="02"
                title="Merge matching tiles"
                text="Equal values combine into one larger tile."
              />

              <GuideItem
                number="03"
                title="Plan ahead"
                text="Keep enough space for future moves."
              />

              <GuideItem
                number="04"
                title="Build your score"
                text="Larger merges increase your score."
              />

            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                setShowGuide(false)
              }
            >
              START GAME
            </button>

          </section>

        </main>

      </div>
    );
  }

  /* =========================================
     MAIN GAME
  ========================================= */

  return (
    <div className={styles.page}>

      <header className={styles.header}>

        <button
          type="button"
          className={styles.backButton}
          onClick={() =>
            navigate("/game/10")
          }
          aria-label="Back to Merge Master home"
        >
          <FiArrowLeft />
        </button>

        <div className={styles.title}>
          <span>MERGE MASTER</span>
          <strong>PUZZLE ARENA</strong>
        </div>

        <div className={styles.timer}>
          <FiClock />
          <strong>{timeLeft}s</strong>
        </div>

      </header>


      <main className={styles.main}>

        {/* TOP INTRO */}

        <section className={styles.arenaHeader}>

          <div>

            <span>MERGE ARENA</span>

            <h1>
              Reach higher tiles
            </h1>

          </div>

          <div className={styles.moves}>
            <span>MOVES</span>
            <strong>{moves}</strong>
          </div>

        </section>


        {/* HUD */}

        <section className={styles.stats}>

          <Stat
            label="SCORE"
            value={score}
          />

          <Stat
            label="BEST TILE"
            value={bestTile}
          />

          <Stat
            label="REWARD"
            value={`+${reward}`}
            reward
          />

        </section>


        {/* BOARD */}

        <section
          className={styles.boardCard}
          onTouchStart={
            handleTouchStart
          }
          onTouchEnd={
            handleTouchEnd
          }
        >

          <div className={styles.board}>

            {board.map(
              (value, index) => {

                const tileClass =
                  value === 0
                    ? styles.emptyTile
                    : styles[
                        `tile${Math.min(
                          value,
                          2048
                        )}`
                      ] ||
                      styles.tileBig;

                return (
                  <div
                    key={index}
                    className={`${styles.tile} ${tileClass}`}
                  >
                    {value || ""}
                  </div>
                );
              }
            )}

          </div>

        </section>


        {/* HELP */}

        <p className={styles.instructions}>
          <strong>Swipe</strong> or use your{" "}
          <strong>keyboard</strong> to move the tiles
        </p>


        {/* CONTROLS */}

        <div className={styles.controls}>

          <button
            type="button"
            onClick={() =>
              handleMove("up")
            }
          >
            ↑
          </button>

          <div>
            <button
              type="button"
              onClick={() =>
                handleMove("left")
              }
            >
              ←
            </button>

            <button
              type="button"
              onClick={() =>
                handleMove("down")
              }
            >
              ↓
            </button>

            <button
              type="button"
              onClick={() =>
                handleMove("right")
              }
            >
              →
            </button>
          </div>

        </div>


        {/* RESET */}

        <button
          type="button"
          className={styles.resetButton}
          onClick={resetGame}
        >
          <FiRotateCcw />
          Restart
        </button>


        {/* REWARD */}

        <div className={styles.rewardLine}>

          <FiGift />

          <span>
            Possible reward
          </span>

          <strong>
            +{reward} Game Coins
          </strong>

        </div>

      </main>


      {/* GAME OVER */}

      {gameOver && (

        <div className={styles.overlay}>

          <section className={styles.resultCard}>

            <div className={styles.resultIcon}>
              <FiAward />
            </div>

            <span className={styles.guideLabel}>
              CHALLENGE COMPLETE
            </span>

            <h1>Great Game!</h1>

            <div className={styles.resultGrid}>

              <ResultStat
                label="Score"
                value={score}
              />

              <ResultStat
                label="Best Tile"
                value={bestTile}
              />

              <ResultStat
                label="Reward"
                value={`+${reward}`}
              />

            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={resetGame}
            >
              <FiRotateCcw />
              PLAY AGAIN
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                navigate("/game/10")
              }
            >
              <FiArrowLeft />
              GAME HOME
            </button>

          </section>

        </div>
      )}


      {/* REVIVE */}

      {showRevive && (

        <div className={styles.overlay}>

          <section className={styles.modal}>

            <button
              type="button"
              className={styles.closeButton}
              onClick={handleNoThanks}
            >
              <FiX />
            </button>

            <div className={styles.modalIcon}>
              <FiZap />
            </div>

            <span className={styles.guideLabel}>
              TIME'S UP
            </span>

            <h2>Keep Playing?</h2>

            <p>
              Continue your current run with
              another chance.
            </p>

            {!reviveUsed ? (
              <>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleRevive}
                >
                  REVIVE
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleNoThanks}
                >
                  NO THANKS
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleNoThanks}
              >
                COLLECT REWARD
              </button>
            )}

          </section>

        </div>
      )}

    </div>
  );
}


/* =========================================
   HELPERS
========================================= */

function Stat({
  label,
  value,
  reward = false,
}) {
  return (
    <div className={styles.statCard}>

      <span>{label}</span>

      <strong className={
        reward
          ? styles.rewardValue
          : ""
      }>
        {value}
      </strong>

    </div>
  );
}


function ResultStat({
  label,
  value,
}) {
  return (
    <div className={styles.resultStat}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}


function GuideItem({
  number,
  title,
  text,
}) {
  return (
    <div className={styles.guideItem}>

      <span>{number}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

    </div>
  );
}

export default MergeMasterGame;