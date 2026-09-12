import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiRotateCcw } from "react-icons/fi";

import { useGameCoin } from "../../context/GameCoinContext";
import styles from "./WordHuntGame.module.css";

const TOTAL_LEVELS = 20;
const MAX_GRID_SIZE = 7;

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ==================================================
   WORD POOL
================================================== */

const WORD_POOL = [
  // 3 LETTER
  "CAT",
  "DOG",
  "SUN",
  "FUN",
  "RUN",
  "WIN",
  "BOX",
  "RED",
  "CAR",
  "BAT",
  "MAP",
  "FOX",
  "HAT",
  "KEY",
  "ICE",
  "JOY",
  "SKY",
  "DAY",
  "PEN",
  "CUP",
  "RAT",
  "BAG",
  "TOP",
  "BIG",
  "HOT",
  "AIR",
  "SEA",
  "WEB",
  "LOG",
  "FAN",
  "GEM",
  "FIG",
  "JAM",
  "ZIP",
  "FIG",
  "HOP",
  "RUN",
  "FOX",
  "BOX",

  // 4 LETTER
  "GAME",
  "PLAY",
  "WORD",
  "COIN",
  "STAR",
  "MOON",
  "FIRE",
  "WIND",
  "TREE",
  "BALL",
  "BLUE",
  "GOLD",
  "TIME",
  "FAST",
  "JUMP",
  "FIND",
  "HUNT",
  "LIFE",
  "ROCK",
  "FISH",
  "WAVE",
  "KING",
  "RING",
  "GLOW",
  "SNOW",
  "RAIN",
  "SHIP",
  "ROAD",
  "HOME",
  "LOVE",
  "DARK",
  "BIRD",
  "FROG",
  "BEAR",
  "WALL",
  "DOOR",
  "GIFT",
  "HOPE",
  "DREAM",

  // 5 LETTER
  "TOKEN",
  "SCORE",
  "LEVEL",
  "POINT",
  "POWER",
  "SPEED",
  "BOARD",
  "QUEST",
  "WORLD",
  "NIGHT",
  "BRAVE",
  "SMILE",
  "HEART",
  "MUSIC",
  "MAGIC",
  "WATER",
  "EARTH",
  "SPACE",
  "CROWN",
  "STORM",
  "FLAME",
  "CLOUD",
  "PLANT",
  "FRUIT",
  "GRASS",
  "STONE",
  "SWORD",
  "CHESS",
  "WORDS",
  "START",
  "ROUND",
  "MATCH",
  "LUCKY",
  "PRIZE",
  "BONUS",
  "TOWER",
  "SNAKE",
  "RIVER",
  "OCEAN",
  "LIGHT",
  "NORTH",
  "SOUTH",
  "GREEN",
  "BLACK",
  "WHITE",
  "HOUSE",
  "MOUSE",
  "HORSE",
  "PLANE",
  "TRAIN",
  "DRIVE",

  // 6 LETTER
  "PLAYER",
  "WINNER",
  "PUZZLE",
  "HIDDEN",
  "REWARD",
  "BATTLE",
  "MASTER",
  "TARGET",
  "CHANCE",
  "CREATE",
  "ENERGY",
  "GAMING",
  "JUNGLE",
  "PLANET",
  "SPRING",
  "SUMMER",
  "WINTER",
  "DRAGON",
  "CASTLE",
  "SECRET",
  "FRIEND",
  "BORDER",
  "BRIGHT",
  "GOLDEN",
  "FROZEN",
  "ROCKET",
  "MONKEY",
  "TIGER",
  "PIRATE",
  "FOREST",
  "ISLAND",
  "FLOWER",
  "CIRCLE",
  "NUMBER",
  "BUTTON",
  "CHANGE",
  "VICTORY",
  "DANGER",
  "FUTURE",
  "DESIGN",
  "CODING",
  "BRAINY",
  "HUNTER",
  "GAMERS",

  // 7 LETTER
  "MISSION",
  "WARRIOR",
  "RAINBOW",
  "CRYSTAL",
  "KINGDOM",
  "CAPTAIN",
  "JOURNEY",
  "FANTASY",
  "THUNDER",
  "SUNRISE",
  "MONSTER",
  "PUZZLER",
  "CHAMPION",
  "FORTUNE",
  "MYSTERY",
  "HUNTERS",
  "PLAYERS",
  "WINNERS",
  "TARGETS",
  "REWARDS",
  "DRAGONS",
  "PLANETS",
  "FLOWERS",
  "FORESTS",
  "ROCKETS",
  "GAMING",
  "GAMERS",
];

/* Remove duplicates */
const UNIQUE_WORD_POOL = [...new Set(WORD_POOL)];

/* ==================================================
   LEVEL SETTINGS
================================================== */

function getGridSize(level) {
  return Math.min(level + 2, MAX_GRID_SIZE);
}

function getWordCount(level) {
  return level + 1;
}

function getGameTime(level) {
  if (level <= 3) return 60;
  if (level <= 7) return 55;
  if (level <= 12) return 50;
  if (level <= 16) return 45;
  return 40;
}

function getMinimumWordLength(level) {
  if (level <= 5) return 3;
  if (level <= 10) return 4;
  if (level <= 15) return 4;
  return 5;
}

/* ==================================================
   GET WORDS
================================================== */

function getWordsForLevel(level) {
  const gridSize = getGridSize(level);
  const wordCount = getWordCount(level);
  const minimumLength = getMinimumWordLength(level);

  const candidates = UNIQUE_WORD_POOL.filter(
    (word) => word.length >= minimumLength && word.length <= gridSize,
  );

  /*
    Shuffle candidates
  */
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  /*
    Higher levels prefer longer words.
  */
  shuffled.sort((a, b) => {
    const aScore = a.length * level * 0.01 + Math.random();

    const bScore = b.length * level * 0.01 + Math.random();

    return bScore - aScore;
  });

  return shuffled.slice(0, Math.min(wordCount, shuffled.length));
}

/* ==================================================
   GRID HELPERS
================================================== */

function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function canPlaceWord(grid, word, row, col, rowDirection, colDirection) {
  const size = grid.length;

  const endRow = row + rowDirection * (word.length - 1);

  const endCol = col + colDirection * (word.length - 1);

  if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
    return false;
  }

  for (let index = 0; index < word.length; index++) {
    const currentRow = row + rowDirection * index;

    const currentCol = col + colDirection * index;

    const existing = grid[currentRow][currentCol];

    if (existing !== "" && existing !== word[index]) {
      return false;
    }
  }

  return true;
}

function placeWord(grid, word, row, col, rowDirection, colDirection) {
  const newGrid = grid.map((line) => [...line]);

  const positions = [];

  for (let index = 0; index < word.length; index++) {
    const currentRow = row + rowDirection * index;

    const currentCol = col + colDirection * index;

    newGrid[currentRow][currentCol] = word[index];

    positions.push({
      row: currentRow,
      col: currentCol,
    });
  }

  return {
    grid: newGrid,
    positions,
  };
}

/* ==================================================
   BUILD PUZZLE
================================================== */

function buildPuzzle(level) {
  const size = getGridSize(level);

  const words = getWordsForLevel(level);

  const orderedWords = [...words].sort((a, b) => b.length - a.length);

  if (!orderedWords.length) {
    return buildPuzzle(1);
  }

  for (let attempt = 0; attempt < 500; attempt++) {
    let grid = createEmptyGrid(size);

    const wordPositions = {};
    let success = true;

    for (const word of orderedWords) {
      const placements = [];

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          for (const [rowDirection, colDirection] of DIRECTIONS) {
            if (
              canPlaceWord(grid, word, row, col, rowDirection, colDirection)
            ) {
              placements.push({
                row,
                col,
                rowDirection,
                colDirection,
              });
            }
          }
        }
      }

      if (!placements.length) {
        success = false;
        break;
      }

      const placement =
        placements[Math.floor(Math.random() * placements.length)];

      const result = placeWord(
        grid,
        word,
        placement.row,
        placement.col,
        placement.rowDirection,
        placement.colDirection,
      );

      grid = result.grid;

      wordPositions[word] = result.positions;
    }

    if (!success) {
      continue;
    }

    const filledGrid = grid.map((row) =>
      row.map(
        (cell) => cell || ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
      ),
    );

    return {
      grid: filledGrid,
      words,
      wordPositions,
      size,
    };
  }

  return buildPuzzle(level);
}

/* ==================================================
   WORD HUNT GAME
================================================== */

function WordHuntGame() {
  const navigate = useNavigate();

  const { addGameCoins } = useGameCoin();

  const [level, setLevel] = useState(1);

  const initialPuzzle = useMemo(() => buildPuzzle(1), []);

  const [puzzle, setPuzzle] = useState(initialPuzzle);

  const [foundWords, setFoundWords] = useState([]);

  const [selectedCells, setSelectedCells] = useState([]);

  const [isSelecting, setIsSelecting] = useState(false);

  const [selectionDirection, setSelectionDirection] = useState(null);

  const [timeLeft, setTimeLeft] = useState(getGameTime(1));

  const [gameOver, setGameOver] = useState(false);

  const [showRevive, setShowRevive] = useState(false);

  const [revived, setRevived] = useState(false);

  const [levelComplete, setLevelComplete] = useState(false);

  const [finalComplete, setFinalComplete] = useState(false);

  /*
    Prevent duplicate rewards.
  */
  const rewardGrantedRef = useRef(false);

  const { grid, words, wordPositions, size } = puzzle;

  const totalWords = words.length;

  const isLastLevel = level === TOTAL_LEVELS;

  const reward = foundWords.length * 10;

  /* ==================================================
     TIMER
  ================================================== */

  useEffect(() => {
    if (gameOver || levelComplete || finalComplete) {
      return;
    }

    if (timeLeft <= 0) {
      setGameOver(true);
      setShowRevive(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver, levelComplete, finalComplete]);

  /* ==================================================
     CELL HELPERS
  ================================================== */

  const isCellSelected = (row, col) =>
    selectedCells.some((cell) => cell.row === row && cell.col === col);

  const isCellInFoundWord = (row, col) =>
    foundWords.some((word) =>
      wordPositions[word]?.some((cell) => cell.row === row && cell.col === col),
    );

  const getSelectedWord = (cells) =>
    cells.map((cell) => grid[cell.row][cell.col]).join("");

  /* ==================================================
     STRAIGHT LINE SELECTION
  ================================================== */

  const canContinueSelection = (cell) => {
    if (selectedCells.length === 0) {
      return true;
    }

    const lastCell = selectedCells[selectedCells.length - 1];

    const rowDifference = cell.row - lastCell.row;

    const colDifference = cell.col - lastCell.col;

    if (!selectionDirection) {
      const direction = DIRECTIONS.find(
        ([rowDirection, colDirection]) =>
          rowDirection === Math.sign(rowDifference) &&
          colDirection === Math.sign(colDifference),
      );

      if (!direction) {
        return false;
      }

      setSelectionDirection(direction);

      return true;
    }

    return (
      Math.sign(rowDifference) === selectionDirection[0] &&
      Math.sign(colDifference) === selectionDirection[1]
    );
  };

  /* ==================================================
     POINTER DOWN
  ================================================== */

  const handleCellPointerDown = (row, col) => {
    if (gameOver || levelComplete || finalComplete) {
      return;
    }

    setIsSelecting(true);

    setSelectionDirection(null);

    setSelectedCells([
      {
        row,
        col,
      },
    ]);
  };

  /* ==================================================
     POINTER ENTER
  ================================================== */

  const handleCellPointerEnter = (row, col) => {
    if (!isSelecting || gameOver || levelComplete || finalComplete) {
      return;
    }

    if (selectedCells.some((cell) => cell.row === row && cell.col === col)) {
      return;
    }

    const cell = {
      row,
      col,
    };

    if (!canContinueSelection(cell)) {
      return;
    }

    setSelectedCells((previous) => [...previous, cell]);
  };

  /* ==================================================
     FINISH SELECTION
  ================================================== */

  const finishSelection = () => {
    if (!isSelecting) {
      return;
    }

    setIsSelecting(false);

    const selectedWord = getSelectedWord(selectedCells);

    const reversedWord = selectedWord.split("").reverse().join("");

    const matchedWord = words.find(
      (word) =>
        !foundWords.includes(word) &&
        (word === selectedWord || word === reversedWord),
    );

    if (matchedWord) {
      setFoundWords((previous) => [...previous, matchedWord]);
    }

    setSelectedCells([]);

    setSelectionDirection(null);
  };

  /* ==================================================
     LEVEL COMPLETE
  ================================================== */

  useEffect(() => {
    if (foundWords.length !== totalWords) {
      return;
    }

    if (rewardGrantedRef.current) {
      return;
    }

    rewardGrantedRef.current = true;

    /*
      Game stops immediately
      once every word is found.
    */
    setIsSelecting(false);
    setSelectedCells([]);
    setLevelComplete(true);

    addGameCoins(reward);

    if (isLastLevel) {
      setFinalComplete(true);
    }
  }, [foundWords, totalWords, reward, addGameCoins, isLastLevel]);

  /* ==================================================
     NEXT LEVEL
  ================================================== */

  const handleNextLevel = () => {
    if (isLastLevel) {
      return;
    }

    const nextLevel = level + 1;

    const nextPuzzle = buildPuzzle(nextLevel);

    rewardGrantedRef.current = false;

    setLevel(nextLevel);

    setPuzzle(nextPuzzle);

    setFoundWords([]);
    setSelectedCells([]);

    setSelectionDirection(null);

    setIsSelecting(false);

    setTimeLeft(getGameTime(nextLevel));

    setGameOver(false);
    setShowRevive(false);
    setRevived(false);
    setLevelComplete(false);
    setFinalComplete(false);
  };

  /* ==================================================
     REVIVE
  ================================================== */

  const handleRevive = () => {
    if (revived) {
      return;
    }

    setRevived(true);
    setShowRevive(false);
    setGameOver(false);
    setTimeLeft(30);
  };

  /* ==================================================
     NO THANKS
  ================================================== */

  const handleNoThanks = () => {
    setShowRevive(false);
    setGameOver(true);
  };

  /* ==================================================
     RESTART
  ================================================== */

  const handleRestart = () => {
    rewardGrantedRef.current = false;

    setPuzzle(buildPuzzle(level));

    setFoundWords([]);
    setSelectedCells([]);

    setSelectionDirection(null);

    setIsSelecting(false);

    setTimeLeft(getGameTime(level));

    setGameOver(false);
    setShowRevive(false);
    setRevived(false);
    setLevelComplete(false);
    setFinalComplete(false);
  };

  /* ==================================================
     UI
  ================================================== */

  return (
    <div className={styles.page}>
      {/* HEADER */}

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/game/8")}
          aria-label="Back to Word Hunt"
        >
          <FiArrowLeft />
        </button>

        <div className={styles.headerTitle}>
          <span>WORD HUNT</span>

          <strong>
            Level {level} / {TOTAL_LEVELS}
          </strong>
        </div>

        <div className={styles.timer}>
          <FiHeart />

          <strong>{timeLeft}s</strong>
        </div>
      </header>

      {/* MAIN */}

      <main className={styles.main}>
        <section className={styles.gameContainer}>
          {/* LEVEL COMPLETE POPUP */}

          {levelComplete && (
            <div className={styles.levelCompleteOverlay}>
              <div className={styles.levelCompletePopup}>
                <div className={styles.completeIcon}>
                  {finalComplete ? "🏆" : "🎉"}
                </div>

                <span className={styles.completeLabel}>
                  {finalComplete ? "CHALLENGE COMPLETE" : "LEVEL COMPLETE"}
                </span>

                <h2>
                  {finalComplete
                    ? "All 20 Levels Complete!"
                    : `Level ${level} Complete!`}
                </h2>

                <p>You found all {totalWords} words.</p>

                <strong className={styles.completeReward}>
                  +{reward} Game Coins
                </strong>

                {!finalComplete ? (
                  <>
                    <button
                      type="button"
                      className={styles.nextLevelButton}
                      onClick={handleNextLevel}
                    >
                      Next Level →
                    </button>

                    <button
                      type="button"
                      className={styles.stayButton}
                      onClick={() => setLevelComplete(false)}
                    >
                      Stay on this level
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.nextLevelButton}
                    onClick={() => navigate("/game/8")}
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}

          {/* LEVEL INFO */}

          <div className={styles.levelInfo}>
            <div>
              <span>LEVEL</span>

              <strong>{level}</strong>
            </div>

            <div>
              <span>GRID</span>

              <strong>
                {size} × {size}
              </strong>
            </div>

            <div>
              <span>WORDS</span>

              <strong>
                {foundWords.length}/{totalWords}
              </strong>
            </div>
          </div>

          {/* GRID */}

          <div
            className={styles.gridWrapper}
            onPointerUp={finishSelection}
            onPointerCancel={finishSelection}
          >
            <div
              className={styles.grid}
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const selected = isCellSelected(rowIndex, colIndex);

                  const found = isCellInFoundWord(rowIndex, colIndex);

                  return (
                    <button
                      type="button"
                      key={`${rowIndex}-${colIndex}`}
                      className={[
                        styles.cell,
                        selected ? styles.selected : "",
                        found ? styles.found : "",
                      ].join(" ")}
                      onPointerDown={() =>
                        handleCellPointerDown(rowIndex, colIndex)
                      }
                      onPointerEnter={() =>
                        handleCellPointerEnter(rowIndex, colIndex)
                      }
                      aria-label={`Letter ${letter}`}
                    >
                      {letter}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          {/* INSTRUCTIONS */}

          <div className={styles.instructions}>
            <strong>How to play</strong>

            <span>Drag across letters in a straight line to find a word.</span>
          </div>
        </section>

        {/* LEVEL COMPLETE */}

        {/* FINAL COMPLETE */}

        {/* GAME OVER */}

        {gameOver && !levelComplete && !finalComplete && !showRevive && (
          <section className={styles.resultCard}>
            <div className={styles.resultIcon}>!</div>

            <h2>Game Over</h2>

            <p>
              You found {foundWords.length} of {totalWords} words on Level{" "}
              {level}.
            </p>

            <strong className={styles.rewardText}>+{reward} Game Coins</strong>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRestart}
            >
              <FiRotateCcw />
              Try Again
            </button>
          </section>
        )}
      </main>

      {/* REVIVE MODAL */}

      {showRevive && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>❤️</div>

            <h2>Time's Up!</h2>

            <p>Want another chance to continue Level {level}?</p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRevive}
            >
              Revive
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleNoThanks}
            >
              No Thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WordHuntGame;
