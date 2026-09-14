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
  "HOP",

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
];

const UNIQUE_WORD_POOL = [...new Set(WORD_POOL)];

/* ==================================================
   LEVEL SETTINGS
================================================== */

function getGridSize(level) {
  return Math.min(level + 2, MAX_GRID_SIZE);
}

function getWordCount(level) {
  return Math.min(level + 1, 10);
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
    (word) =>
      word.length >= minimumLength &&
      word.length <= gridSize,
  );

  const shuffled = [...candidates].sort(
    () => Math.random() - 0.5,
  );

  shuffled.sort((a, b) => {
    const aScore =
      a.length * level * 0.01 + Math.random();

    const bScore =
      b.length * level * 0.01 + Math.random();

    return bScore - aScore;
  });

  return shuffled.slice(
    0,
    Math.min(wordCount, shuffled.length),
  );
}

/* ==================================================
   GRID HELPERS
================================================== */

function createEmptyGrid(size) {
  return Array.from(
    { length: size },
    () => Array(size).fill(""),
  );
}

function canPlaceWord(
  grid,
  word,
  row,
  col,
  rowDirection,
  colDirection,
) {
  const size = grid.length;

  const endRow =
    row + rowDirection * (word.length - 1);

  const endCol =
    col + colDirection * (word.length - 1);

  if (
    endRow < 0 ||
    endRow >= size ||
    endCol < 0 ||
    endCol >= size
  ) {
    return false;
  }

  for (let index = 0; index < word.length; index++) {
    const currentRow =
      row + rowDirection * index;

    const currentCol =
      col + colDirection * index;

    const existing =
      grid[currentRow][currentCol];

    if (
      existing !== "" &&
      existing !== word[index]
    ) {
      return false;
    }
  }

  return true;
}

function placeWord(
  grid,
  word,
  row,
  col,
  rowDirection,
  colDirection,
) {
  const newGrid = grid.map((line) => [...line]);
  const positions = [];

  for (let index = 0; index < word.length; index++) {
    const currentRow =
      row + rowDirection * index;

    const currentCol =
      col + colDirection * index;

    newGrid[currentRow][currentCol] =
      word[index];

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

  const orderedWords = [...words].sort(
    (a, b) => b.length - a.length,
  );

  for (let attempt = 0; attempt < 150; attempt++) {
    let grid = createEmptyGrid(size);
    const wordPositions = {};
    let success = true;

    for (const word of orderedWords) {
      const placements = [];

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          for (const [
            rowDirection,
            colDirection,
          ] of DIRECTIONS) {
            if (
              canPlaceWord(
                grid,
                word,
                row,
                col,
                rowDirection,
                colDirection,
              )
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
        placements[
          Math.floor(
            Math.random() * placements.length,
          )
        ];

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
        (cell) =>
          cell ||
          ALPHABET[
            Math.floor(
              Math.random() * ALPHABET.length,
            )
          ],
      ),
    );

    return {
      grid: filledGrid,
      words,
      wordPositions,
      size,
    };
  }

  /* Safe fallback */
  const fallbackGrid = createEmptyGrid(size);
  const fallbackWords = orderedWords.slice(
    0,
    Math.min(3, orderedWords.length),
  );

  const fallbackPositions = {};

  fallbackWords.forEach((word, index) => {
    const row = Math.min(index, size - 1);

    if (word.length <= size) {
      const result = placeWord(
        fallbackGrid,
        word,
        row,
        0,
        0,
        1,
      );

      fallbackPositions[word] =
        result.positions;
    }
  });

  const filledGrid = fallbackGrid.map((row) =>
    row.map(
      (cell) =>
        cell ||
        ALPHABET[
          Math.floor(
            Math.random() * ALPHABET.length,
          )
        ],
    ),
  );

  return {
    grid: filledGrid,
    words: fallbackWords,
    wordPositions: fallbackPositions,
    size,
  };
}

/* ==================================================
   WORD HUNT GAME
================================================== */

function WordHuntGame() {
  const navigate = useNavigate();
  const { addGameCoins } = useGameCoin();

  const [level, setLevel] = useState(1);

  const initialPuzzle = useMemo(
    () => buildPuzzle(1),
    [],
  );

  const [puzzle, setPuzzle] =
    useState(initialPuzzle);

  const [foundWords, setFoundWords] =
    useState([]);

  const [selectedCells, setSelectedCells] =
    useState([]);

  const [isSelecting, setIsSelecting] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(getGameTime(1));

  const [gameOver, setGameOver] =
    useState(false);

  const [showRevive, setShowRevive] =
    useState(false);

  const [revived, setRevived] =
    useState(false);

  const [levelComplete, setLevelComplete] =
    useState(false);

  const [finalComplete, setFinalComplete] =
    useState(false);

  const rewardGrantedRef = useRef(false);
  const gridRef = useRef(null);
  const selectingRef = useRef(false);
  const selectedCellsRef = useRef([]);
  const directionRef = useRef(null);

  const { grid, words, wordPositions, size } =
    puzzle;

  const totalWords = words.length;
  const isLastLevel =
    level === TOTAL_LEVELS;

  const reward = foundWords.length * 10;

  /* ==================================================
     TIMER
  ================================================== */

  useEffect(() => {
    if (
      gameOver ||
      levelComplete ||
      finalComplete
    ) {
      return;
    }

    if (timeLeft <= 0) {
      setGameOver(true);

      if (!revived) {
        setShowRevive(true);
      } else if (!rewardGrantedRef.current) {
        rewardGrantedRef.current = true;
        addGameCoins(reward);
      }

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (previous) => previous - 1,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft,
    gameOver,
    levelComplete,
    finalComplete,
    revived,
  ]);

  /* ==================================================
     CELL HELPERS
  ================================================== */

  const isCellSelected = (row, col) =>
    selectedCells.some(
      (cell) =>
        cell.row === row &&
        cell.col === col,
    );

  const isCellInFoundWord = (row, col) =>
    foundWords.some((word) =>
      wordPositions[word]?.some(
        (cell) =>
          cell.row === row &&
          cell.col === col,
      ),
    );

  const getSelectedWord = (cells) =>
    cells
      .map((cell) => grid[cell.row][cell.col])
      .join("");

  /* ==================================================
     SELECTION
  ================================================== */

  const canContinueSelection = (cell) => {
    const current =
      selectedCellsRef.current;

    if (current.length === 0) {
      return true;
    }

    const lastCell =
      current[current.length - 1];

    const rowDifference =
      cell.row - lastCell.row;

    const colDifference =
      cell.col - lastCell.col;

    if (
      rowDifference === 0 &&
      colDifference === 0
    ) {
      return false;
    }

    if (!directionRef.current) {
      const rowStep =
        Math.sign(rowDifference);

      const colStep =
        Math.sign(colDifference);

      const validDirection =
        DIRECTIONS.find(
          ([rowDirection, colDirection]) =>
            rowDirection === rowStep &&
            colDirection === colStep,
        );

      if (!validDirection) {
        return false;
      }

      directionRef.current =
        validDirection;
    }

    return (
      Math.sign(rowDifference) ===
        directionRef.current[0] &&
      Math.sign(colDifference) ===
        directionRef.current[1]
    );
  };

  const addCellToSelection = (
    row,
    col,
  ) => {
    const cell = { row, col };

    const current =
      selectedCellsRef.current;

    if (
      current.some(
        (item) =>
          item.row === row &&
          item.col === col,
      )
    ) {
      return;
    }

    if (
      !canContinueSelection(cell)
    ) {
      return;
    }

    const next = [...current, cell];

    selectedCellsRef.current = next;
    setSelectedCells(next);
  };

  const addCellsBetween = (
    targetRow,
    targetCol,
  ) => {
    const current =
      selectedCellsRef.current;

    if (!current.length) {
      addCellToSelection(
        targetRow,
        targetCol,
      );
      return;
    }

    const last =
      current[current.length - 1];

    const rowDifference =
      targetRow - last.row;

    const colDifference =
      targetCol - last.col;

    const rowStep =
      Math.sign(rowDifference);

    const colStep =
      Math.sign(colDifference);

    if (
      Math.abs(rowDifference) !==
        Math.abs(colDifference) &&
      rowDifference !== 0 &&
      colDifference !== 0
    ) {
      return;
    }

    if (
      directionRef.current &&
      (rowStep !==
        directionRef.current[0] ||
        colStep !==
          directionRef.current[1])
    ) {
      return;
    }

    if (!directionRef.current) {
      const validDirection =
        DIRECTIONS.find(
          ([r, c]) =>
            r === rowStep &&
            c === colStep,
        );

      if (!validDirection) {
        return;
      }

      directionRef.current =
        validDirection;
    }

    const distance = Math.max(
      Math.abs(rowDifference),
      Math.abs(colDifference),
    );

    for (
      let step = 1;
      step <= distance;
      step++
    ) {
      const nextRow =
        last.row + rowStep * step;

      const nextCol =
        last.col + colStep * step;

      if (
        nextRow < 0 ||
        nextRow >= size ||
        nextCol < 0 ||
        nextCol >= size
      ) {
        break;
      }

      const alreadySelected =
        selectedCellsRef.current.some(
          (item) =>
            item.row === nextRow &&
            item.col === nextCol,
        );

      if (alreadySelected) {
        continue;
      }

      const next = [
        ...selectedCellsRef.current,
        {
          row: nextRow,
          col: nextCol,
        },
      ];

      selectedCellsRef.current = next;
      setSelectedCells(next);
    }
  };

  /* ==================================================
     POINTER DOWN
  ================================================== */

  const handleCellPointerDown = (
    event,
    row,
    col,
  ) => {
    if (
      gameOver ||
      levelComplete ||
      finalComplete
    ) {
      return;
    }

    event.preventDefault();

    selectingRef.current = true;

    directionRef.current = null;

    const firstCell = [
      {
        row,
        col,
      },
    ];

    selectedCellsRef.current =
      firstCell;

    setSelectedCells(firstCell);

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId,
      );
    } catch {
      // Pointer capture may not be supported
      // in every browser environment.
    }
  };

  /* ==================================================
     POINTER MOVE
  ================================================== */

  const handleGridPointerMove = (
    event,
  ) => {
    if (
      !selectingRef.current ||
      gameOver ||
      levelComplete ||
      finalComplete
    ) {
      return;
    }

    event.preventDefault();

    const element =
      document.elementFromPoint(
        event.clientX,
        event.clientY,
      );

    const cellElement =
      element?.closest(
        "[data-row][data-col]",
      );

    if (!cellElement) {
      return;
    }

    const row = Number(
      cellElement.dataset.row,
    );

    const col = Number(
      cellElement.dataset.col,
    );

    if (
      Number.isNaN(row) ||
      Number.isNaN(col)
    ) {
      return;
    }

    addCellsBetween(row, col);
  };

  /* ==================================================
     FINISH SELECTION
  ================================================== */

  const finishSelection = () => {
    if (!selectingRef.current) {
      return;
    }

    selectingRef.current = false;

    const cells =
      selectedCellsRef.current;

    if (cells.length < 3) {
      selectedCellsRef.current = [];
      setSelectedCells([]);
      directionRef.current = null;
      return;
    }

    const selectedWord =
      getSelectedWord(cells);

    const reversedWord = selectedWord
      .split("")
      .reverse()
      .join("");

    const matchedWord =
      words.find(
        (word) =>
          !foundWords.includes(word) &&
          (word === selectedWord ||
            word === reversedWord),
      );

    if (matchedWord) {
      setFoundWords(
        (previous) => [
          ...previous,
          matchedWord,
        ],
      );
    }

    selectedCellsRef.current = [];
    setSelectedCells([]);
    directionRef.current = null;
  };

  /* ==================================================
     LEVEL COMPLETE
  ================================================== */

  useEffect(() => {
    if (
      foundWords.length !== totalWords ||
      totalWords === 0
    ) {
      return;
    }

    if (rewardGrantedRef.current) {
      return;
    }

    rewardGrantedRef.current = true;

    selectingRef.current = false;
    selectedCellsRef.current = [];

    setIsSelecting(false);
    setSelectedCells([]);
    setLevelComplete(true);

    addGameCoins(reward);

    if (isLastLevel) {
      setFinalComplete(true);
    }
  }, [
    foundWords,
    totalWords,
    reward,
    addGameCoins,
    isLastLevel,
  ]);

  /* ==================================================
     NEXT LEVEL
  ================================================== */

  const handleNextLevel = () => {
    if (isLastLevel) {
      return;
    }

    const nextLevel = level + 1;
    const nextPuzzle =
      buildPuzzle(nextLevel);

    rewardGrantedRef.current = false;

    selectedCellsRef.current = [];
    directionRef.current = null;
    selectingRef.current = false;

    setLevel(nextLevel);
    setPuzzle(nextPuzzle);
    setFoundWords([]);
    setSelectedCells([]);
    setIsSelecting(false);
    setTimeLeft(
      getGameTime(nextLevel),
    );
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

    selectedCellsRef.current = [];
    directionRef.current = null;
    selectingRef.current = false;

    setSelectedCells([]);
    setIsSelecting(false);

    setRevived(true);
    setShowRevive(false);
    setGameOver(false);
    setTimeLeft(30);
  };

  /* ==================================================
     NO THANKS / FINISH
  ================================================== */

  const finishGame = () => {
    if (!rewardGrantedRef.current) {
      rewardGrantedRef.current = true;
      addGameCoins(reward);
    }

    setShowRevive(false);
    setGameOver(true);

    navigate("/game/8");
  };

  const handleNoThanks = () => {
    finishGame();
  };

  /* ==================================================
     RESTART
  ================================================== */

  const handleRestart = () => {
    rewardGrantedRef.current = false;

    selectedCellsRef.current = [];
    directionRef.current = null;
    selectingRef.current = false;

    setPuzzle(buildPuzzle(level));
    setFoundWords([]);
    setSelectedCells([]);
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
          onClick={() =>
            navigate("/game/8")
          }
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

          <strong>
            {timeLeft}s
          </strong>
        </div>
      </header>

      {/* MAIN */}

      <main className={styles.main}>
        {/* LEVEL COMPLETE POPUP */}

        {levelComplete && (
          <div
            className={
              styles.levelCompleteOverlay
            }
          >
            <div
              className={
                styles.levelCompletePopup
              }
            >
              <div
                className={styles.completeIcon}
              >
                {finalComplete
                  ? "🏆"
                  : "🎉"}
              </div>

              <span
                className={
                  styles.completeLabel
                }
              >
                {finalComplete
                  ? "CHALLENGE COMPLETE"
                  : "LEVEL COMPLETE"}
              </span>

              <h2>
                {finalComplete
                  ? "All 20 Levels Complete!"
                  : `Level ${level} Complete!`}
              </h2>

              <p>
                You found all{" "}
                {totalWords} words.
              </p>

              <strong
                className={
                  styles.completeReward
                }
              >
                +{reward} Game Coins
              </strong>

              {!finalComplete ? (
                <>
                  <button
                    type="button"
                    className={
                      styles.nextLevelButton
                    }
                    onClick={
                      handleNextLevel
                    }
                  >
                    Next Level →
                  </button>

                  <button
                    type="button"
                    className={
                      styles.stayButton
                    }
                    onClick={() =>
                      setLevelComplete(
                        false,
                      )
                    }
                  >
                    Stay on this level
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={
                    styles.nextLevelButton
                  }
                  onClick={() =>
                    navigate("/game/8")
                  }
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}

        <section
          className={styles.gameContainer}
        >
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
                {foundWords.length}/
                {totalWords}
              </strong>
            </div>
          </div>

          {/* GRID */}

          <div
            ref={gridRef}
            className={styles.gridWrapper}
            onPointerMove={
              handleGridPointerMove
            }
            onPointerUp={
              finishSelection
            }
            onPointerCancel={
              finishSelection
            }
            onPointerLeave={(event) => {
              if (
                selectingRef.current &&
                event.pointerType === "mouse"
              ) {
                // Don't finish selection here.
                // Pointer can leave a cell while
                // continuing across the board.
              }
            }}
          >
            <div
              className={styles.grid}
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {grid.map(
                (row, rowIndex) =>
                  row.map(
                    (letter, colIndex) => {
                      const selected =
                        isCellSelected(
                          rowIndex,
                          colIndex,
                        );

                      const found =
                        isCellInFoundWord(
                          rowIndex,
                          colIndex,
                        );

                      return (
                        <button
                          type="button"
                          key={`${rowIndex}-${colIndex}`}
                          data-row={rowIndex}
                          data-col={colIndex}
                          className={[
                            styles.cell,
                            selected
                              ? styles.selected
                              : "",
                            found
                              ? styles.found
                              : "",
                          ].join(" ")}
                          onPointerDown={(
                            event,
                          ) =>
                            handleCellPointerDown(
                              event,
                              rowIndex,
                              colIndex,
                            )
                          }
                          aria-label={`Letter ${letter}`}
                        >
                          {letter}
                        </button>
                      );
                    },
                  ),
              )}
            </div>
          </div>

          {/* INSTRUCTIONS */}

          <div
            className={styles.instructions}
          >
            <strong>
              How to play
            </strong>

            <span>
              Drag across letters in a
              straight line to find a
              word.
            </span>
          </div>
        </section>

        {/* GAME OVER */}

        {gameOver &&
          !levelComplete &&
          !finalComplete &&
          !showRevive && (
            <section
              className={styles.resultCard}
            >
              <div
                className={styles.resultIcon}
              >
                !
              </div>

              <h2>Game Over</h2>

              <p>
                You found{" "}
                {foundWords.length} of{" "}
                {totalWords} words on
                Level {level}.
              </p>

              <strong
                className={
                  styles.rewardText
                }
              >
                +{reward} Game Coins
              </strong>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
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
        <div
          className={
            styles.modalOverlay
          }
        >
          <div className={styles.modal}>
            <div
              className={styles.modalIcon}
            >
              ❤️
            </div>

            <h2>Time's Up!</h2>

            <p>
              Want another chance to
              continue Level {level}?
            </p>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={handleRevive}
            >
              Revive
            </button>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
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