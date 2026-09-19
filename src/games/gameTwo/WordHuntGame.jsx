import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiArrowLeft, FiClock, FiRotateCcw } from "react-icons/fi";

import { useGameCoin } from "../../context/GameCoinContext";
import styles from "./WordHuntGame.module.css";

const TOTAL_LEVELS = 20;

/* =========================================================
   LETTERS + DIRECTIONS
========================================================= */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

const MASTER_WORD_POOL = [
  "CAT",
  "SUN",
  "DOG",
  "MAP",
  "BOX",
  "RED",
  "HAT",
  "PEN",
  "CUP",
  "JOY",
  "FOX",
  "JAM",
  "SKY",
  "ICE",
  "BUS",
  "KEY",
  "BEE",
  "CAR",
  "OAK",
  "PIG",
  "ANT",
  "FUN",
  "LIP",
  "LOVE",
  "WORD",
  "HUNT",
  "PLAY",
  "SCORE",
  "WIN",
  "BONUS",
  "LEVEL",
  "POWER",
  "GAME",
  "STAR",
  "FIRE",
  "BLUE",
  "BIRD",
  "TREE",
  "WIND",
  "MOON",
  "FISH",
  "GOLD",
  "RAIN",
  "BOOK",
  "HOME",
  "FROG",
  "WOLF",
  "APPLE",
  "TIGER",
  "QUEEN",
  "ROBOT",
  "TRAIN",
  "MAGIC",
  "OCEAN",
  "CROWN",
  "DREAM",
  "NIGHT",
  "SWEET",
  "WORLD",
  "BRAVE",
  "SHINE",
  "ROYAL",
  "FRUIT",
  "EARTH",
  "FLOWER",
  "MONEY",
  "PEARL",
  "PHONE",
  "PARTY",
  "ENERGY",
  "FUTURE",
  "PLANET",
  "GALAXY",
  "LEGEND",
  "MYSTIC",
  "NATURE",
  "DIGITAL",
  "PASSION",
  "FREEDOM",
  "BALANCE",
  "SPIRIT",
  "VISION",
  "TRAVEL",
  "PUZZLE",
  "TARGET",
  "GROWTH",
  "BRIGHT",
  "CRYSTAL",
  "RAINBOW",
  "ROCKET",
  "REWARD",
  "SUNSET",
  "KINGDOM",
  "TREASURE",
  "ADVENTURE",
  "VICTORY",
  "SUNRISE",
  "FANTASY",
  "SPARKLE",
  "CHALLENGE",
  "MYSTERY",
  "JOURNEY",
  "DATING",
  "BRIDE",
  "GROOM",
  "HEART",
  "ADORE",
  "SMILE",
  "HAPPY",
  "KISS",
  "HUG",
  "ROSE",
];

/* =========================================================
   LEVEL-SPECIFIC WORD POOLS
========================================================= */

const LEVEL_WORD_POOLS = {
  1: ["CAT", "SUN", "DOG", "MAP", "BOX", "RED"],
  2: ["FOX", "JAM", "SKY", "PEN", "HAT", "ICE"],
  3: ["BEE", "CAR", "KEY", "OAK", "PIG", "BUS"],
  4: ["CUP", "ANT", "BAT", "FUN", "JOY", "LIP"],

  5: ["FIRE", "BLUE", "BIRD", "TREE", "WIND", "STAR"],
  6: ["MOON", "FISH", "GOLD", "RAIN", "BOOK", "HOME"],
  7: ["FROG", "WOLF", "RAIN", "STAR", "MOON", "GOLD"],
  8: ["FISH", "HOME", "BLUE", "FIRE", "TREE", "WIND"],

  9: ["APPLE", "TIGER", "QUEEN", "ROBOT", "TRAIN", "MAGIC"],
  10: ["OCEAN", "POWER", "CROWN", "DREAM", "NIGHT", "SWEET"],
  11: ["WORLD", "SCORE", "BRAVE", "SHINE", "ROYAL", "FRUIT"],
  12: ["EARTH", "FLOWER", "MONEY", "PEARL", "PHONE", "PARTY"],

  13: ["ENERGY", "FUTURE", "PLANET", "GALAXY", "LEGEND", "MYSTIC"],
  14: ["NATURE", "DIGITAL", "PASSION", "FREEDOM", "BALANCE", "SPIRIT"],
  15: ["CRYSTAL", "RAINBOW", "ROCKET", "REWARD", "SUNSET", "KINGDOM"],
  16: ["VISION", "TRAVEL", "PUZZLE", "TARGET", "GROWTH", "BRIGHT"],

  17: [
    "TREASURE",
    "ADVENTURE",
    "VICTORY",
    "SUNRISE",
    "KINGDOM",
    "FANTASY",
    "SPARK",
  ],
  18: [
    "CHALLENGE",
    "MYSTERY",
    "CRYSTAL",
    "JOURNEY",
    "BALANCE",
    "LEGEND",
    "FREEDOM",
  ],
  19: [
    "FANTASY",
    "RAINBOW",
    "DIGITAL",
    "PASSION",
    "ENERGY",
    "TREASURE",
    "VICTORY",
  ],
  20: [
    "ADVENTURE",
    "CHALLENGE",
    "SPARKLE",
    "SUNRISE",
    "VICTORY",
    "KINGDOM",
    "TREASURE",
  ],
};

/* =========================================================
   LEVEL SETTINGS
========================================================= */

function getGridSize(level) {
  if (level <= 2) return 5;
  if (level <= 5) return 6;
  if (level <= 8) return 7;
  if (level <= 11) return 8;
  if (level <= 15) return 9;
  if (level <= 18) return 10;
  if (level === 19) return 11;
  return 12;
}

function getGridRows(level) {
  return getGridSize(level);
}

function getGridCols(level) {
  return getGridSize(level);
}

function getWordCount(level) {
  if (level <= 2) return 3;
  if (level <= 4) return 4;
  if (level <= 7) return 5;
  if (level <= 10) return 6;
  if (level <= 13) return 7;
  if (level <= 16) return 8;
  if (level <= 18) return 9;
  if (level === 19) return 10;
  return 12;
}

function getGameTime(level) {
  if (level === 1) return 90;
  if (level === 2) return 85;
  if (level <= 4) return 80;
  if (level <= 6) return 75;
  if (level <= 8) return 70;
  if (level <= 10) return 65;
  if (level <= 13) return 60;
  if (level <= 15) return 55;
  if (level <= 17) return 50;
  if (level <= 19) return 45;
  return 40;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function getWordLengthRange(level) {
  if (level <= 2) return { min: 3, max: 4 };
  if (level <= 4) return { min: 3, max: 5 };
  if (level <= 7) return { min: 3, max: 6 };
  if (level <= 10) return { min: 4, max: 7 };
  if (level <= 13) return { min: 4, max: 8 };
  if (level <= 16) return { min: 5, max: 9 };
  if (level <= 18) return { min: 5, max: 10 };
  if (level === 19) return { min: 6, max: 11 };
  return { min: 6, max: 12 };
}

/* =========================================================
   HELPERS
========================================================= */

function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function isInside(row, col, rows, cols) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function getCellKey(row, col) {
  return `${row}-${col}`;
}

/* =========================================================
   PLACE ONE WORD
========================================================= */

function placeWord(grid, word, rows, cols) {
  const possiblePlacements = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      for (const direction of DIRECTIONS) {
        possiblePlacements.push({ row, col, direction });
      }
    }
  }

  for (const placement of shuffle(possiblePlacements)) {
    const { row, col, direction } = placement;
    const cells = [];
    let valid = true;

    for (let index = 0; index < word.length; index += 1) {
      const nextRow = row + direction[0] * index;
      const nextCol = col + direction[1] * index;

      if (!isInside(nextRow, nextCol, rows, cols)) {
        valid = false;
        break;
      }

      const current = grid[nextRow][nextCol];
      if (current && current !== word[index]) {
        valid = false;
        break;
      }

      cells.push({ row: nextRow, col: nextCol });
    }

    if (!valid) continue;

    cells.forEach(({ row: cellRow, col: cellCol }, index) => {
      grid[cellRow][cellCol] = word[index];
    });

    return cells;
  }

  return null;
}

/* =========================================================
   BUILD PUZZLE — FIXED REFERENCE GRID: 12 ROWS × 9 COLS
========================================================= */

function generatePuzzle(level) {
  const rows = getGridRows(level);
  const cols = getGridCols(level);
  const wordCount = getWordCount(level);
  const { min, max } = getWordLengthRange(level);

  const themePools = [
    [
      "LOVE",
      "HEART",
      "ADORE",
      "SMILE",
      "DATING",
      "BRIDE",
      "GROOM",
      "HUG",
      "ROSE",
      "HAPPY",
      "JOY",
      "KISS",
    ],
    [
      "WORD",
      "HUNT",
      "PLAY",
      "SCORE",
      "WIN",
      "BONUS",
      "FUN",
      "LEVEL",
      "POWER",
      "REWARD",
      "GAME",
      "STAR",
    ],
    [
      "CAT",
      "TIGER",
      "LION",
      "HORSE",
      "BEAR",
      "WOLF",
      "PANDA",
      "ZEBRA",
      "EAGLE",
      "SHARK",
      "FROG",
      "BIRD",
    ],
    [
      "SUN",
      "MOON",
      "STAR",
      "SKY",
      "RAIN",
      "CLOUD",
      "LIGHT",
      "SPACE",
      "EARTH",
      "OCEAN",
      "WAVE",
      "WIND",
    ],
  ];

  const themePool = themePools[(level - 1) % themePools.length];

  const filteredThemeWords = themePool.filter(
    (word) => word.length >= min && word.length <= Math.min(max, rows, cols),
  );

  const filteredMasterWords = MASTER_WORD_POOL.filter(
    (word) => word.length >= min && word.length <= Math.min(max, rows, cols),
  );

  const usableWords = [
    ...new Set([...filteredThemeWords, ...filteredMasterWords]),
  ];

  for (let attempt = 0; attempt < 600; attempt += 1) {
    const selectedWords = shuffle(usableWords).slice(0, wordCount);

    if (selectedWords.length !== wordCount) {
      continue;
    }

    const grid = Array.from({ length: rows }, () => Array(cols).fill(""));

    const placements = {};
    let failed = false;

    // Longer words first makes dense boards much more reliable.
    const wordsToPlace = [...selectedWords].sort((a, b) => b.length - a.length);

    for (const word of wordsToPlace) {
      const cells = placeWord(grid, word, rows, cols);

      if (!cells) {
        failed = true;
        break;
      }

      placements[word] = cells;
    }

    if (failed) {
      continue;
    }

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (!grid[row][col]) {
          grid[row][col] =
            ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
      }
    }

    return {
      rows,
      cols,
      words: selectedWords,
      grid,
      placements,
    };
  }

  // Guaranteed fallback: place each word horizontally.
  const fallbackWords = shuffle(usableWords).slice(0, wordCount);

  const grid = Array.from({ length: rows }, () => Array(cols).fill(""));

  const placements = {};

  fallbackWords.forEach((word, wordIndex) => {
    const row = wordIndex % rows;
    const safeWord = word.slice(0, cols);
    const cells = [];

    for (let index = 0; index < safeWord.length; index += 1) {
      grid[row][index] = safeWord[index];

      cells.push({
        row,
        col: index,
      });
    }

    placements[word] = cells;
  });

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!grid[row][col]) {
        grid[row][col] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return {
    rows,
    cols,
    words: fallbackWords,
    grid,
    placements,
  };
}

/* =========================================================
   REWARD
========================================================= */

function getReward(level, score) {
  return 5 + level * 2 + Math.floor(score / 50);
}

/* =========================================================
   COMPONENT
========================================================= */

function WordHuntGame() {
  const navigate = useNavigate();

  const { addGameCoins, gameCoins } = useGameCoin();

  const [level, setLevel] = useState(1);

  const [puzzle, setPuzzle] = useState(() => generatePuzzle(1));

  const [timeLeft, setTimeLeft] = useState(getGameTime(1));

  const [score, setScore] = useState(0);

  const [foundWords, setFoundWords] = useState([]);

  const [foundCells, setFoundCells] = useState([]);

  // Maps each completed word to a neon palette index.
  const [foundWordColors, setFoundWordColors] = useState({});

  const [revealedCells, setRevealedCells] = useState([]);

  const [selectedCells, setSelectedCells] = useState([]);

  const [isSelecting, setIsSelecting] = useState(false);

  const [showGuide, setShowGuide] = useState(true);

  const [levelComplete, setLevelComplete] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  const [showRevive, setShowRevive] = useState(false);

  const [revived, setRevived] = useState(false);

  const [finalComplete, setFinalComplete] = useState(false);

  const [earnedCoins, setEarnedCoins] = useState(0);

  const gridRef = useRef(null);

  const earnedCoinsRef = useRef(0);

  const rewardBankedRef = useRef(false);

  const finishHandledRef = useRef(false);

  const isSelectingRef = useRef(false);

  const selectedCellsRef = useRef([]);

  // Direction is locked after the first meaningful drag.
  // Allowed: horizontal, vertical, and all four diagonals.
  const selectionDirectionRef = useRef(null);

  const puzzleRef = useRef(puzzle);

  const foundWordsRef = useRef(foundWords);

  const revivedRef = useRef(revived);

  const levelCompleteRef = useRef(levelComplete);

  const gameOverRef = useRef(gameOver);

  useEffect(() => {
    puzzleRef.current = puzzle;
  }, [puzzle]);

  useEffect(() => {
    foundWordsRef.current = foundWords;
  }, [foundWords]);

  useEffect(() => {
    revivedRef.current = revived;
  }, [revived]);

  useEffect(() => {
    levelCompleteRef.current = levelComplete;
  }, [levelComplete]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  const currentWords = useMemo(() => puzzle.words, [puzzle.words]);

  const missedWords = useMemo(
    () => currentWords.filter((word) => !foundWords.includes(word)),
    [currentWords, foundWords],
  );

  const progress = currentWords.length
    ? Math.round((foundWords.length / currentWords.length) * 100)
    : 0;

  const currentReward = getReward(level, score);

  /* =========================================================
     REVEAL MISSED WORDS
========================================================= */

  const revealMissedWords = useCallback(() => {
    const currentPuzzle = puzzleRef.current;

    const currentFound = foundWordsRef.current;

    const missed = currentPuzzle.words.filter(
      (word) => !currentFound.includes(word),
    );

    const revealSet = new Set();

    missed.forEach((word) => {
      const placement = currentPuzzle.placements[word];

      if (!placement) {
        return;
      }

      placement.forEach(({ row, col }) => {
        revealSet.add(getCellKey(row, col));
      });
    });

    setRevealedCells([...revealSet]);
  }, []);

  /* =========================================================
     TIMER
========================================================= */

  useEffect(() => {
    if (showGuide || levelComplete || gameOver || finalComplete) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timerId);

          revealMissedWords();

          setGameOver(true);

          if (!revivedRef.current) {
            setShowRevive(true);
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [showGuide, levelComplete, gameOver, finalComplete, revealMissedWords]);

  /* =========================================================
     LEVEL COMPLETE
========================================================= */

  useEffect(() => {
    if (currentWords.length === 0) {
      return;
    }

    if (
      foundWords.length === currentWords.length &&
      !levelComplete &&
      !gameOver
    ) {
      const reward = getReward(level, score);

      if (!rewardBankedRef.current) {
        rewardBankedRef.current = true;

        earnedCoinsRef.current += reward;

        setEarnedCoins(earnedCoinsRef.current);
      }

      setLevelComplete(true);
    }
  }, [foundWords, currentWords.length, level, score, levelComplete, gameOver]);

  /* =========================================================
     FIND CELL FROM POINTER
========================================================= */

  const getCellFromPoint = useCallback((clientX, clientY) => {
    const grid = gridRef.current;

    if (!grid) {
      return null;
    }

    const rect = grid.getBoundingClientRect();

    const rows = puzzleRef.current.rows;
    const cols = puzzleRef.current.cols;

    const cellWidth = rect.width / cols;
    const cellHeight = rect.height / rows;

    const col = Math.floor((clientX - rect.left) / cellWidth);

    const row = Math.floor((clientY - rect.top) / cellHeight);

    if (!isInside(row, col, rows, cols)) {
      return null;
    }

    return {
      row,
      col,
    };
  }, []);

  /* =========================================================
     SELECTION WORD
========================================================= */

  const getSelectionWord = useCallback((cells) => {
    const currentPuzzle = puzzleRef.current;

    return cells.map(({ row, col }) => currentPuzzle.grid[row][col]).join("");
  }, []);

  /* =========================================================
     START SELECTION
========================================================= */

  const handlePointerDown = (event, row, col) => {
    if (showGuide || levelComplete || gameOver || finalComplete) {
      return;
    }

    event.preventDefault();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Safe fallback for browsers
      // that do not support capture.
    }

    const initialCell = {
      row,
      col,
    };

    // Every new drag starts with no direction.
    // The first meaningful movement chooses one of the
    // 8 straight directions and that direction stays locked.
    selectionDirectionRef.current = null;

    isSelectingRef.current = true;

    selectedCellsRef.current = [initialCell];

    setIsSelecting(true);
    setSelectedCells([initialCell]);
  };

  /* =========================================================
     STRAIGHT-LINE SELECTION

     The selection is always one continuous line.

     Allowed directions:
       ←  ↖  ↑  ↗
       →  ↙  ↓  ↘

     Once the direction is chosen from the first meaningful
     pointer movement, it is LOCKED for the rest of the drag.
     This makes diagonal dragging forgiving while guaranteeing
     that an L-shape / bend / zig-zag can never be selected.
  ========================================================= */

  const getClosestDirection = useCallback((rowDiff, colDiff) => {
    if (rowDiff === 0 && colDiff === 0) {
      return null;
    }

    const length = Math.hypot(rowDiff, colDiff);
    const unitRow = rowDiff / length;
    const unitCol = colDiff / length;

    const directions = [
      { rowStep: -1, colStep: -1 }, // ↖
      { rowStep: -1, colStep: 0 }, // ↑
      { rowStep: -1, colStep: 1 }, // ↗
      { rowStep: 0, colStep: -1 }, // ←
      { rowStep: 0, colStep: 1 }, // →
      { rowStep: 1, colStep: -1 }, // ↙
      { rowStep: 1, colStep: 0 }, // ↓
      { rowStep: 1, colStep: 1 }, // ↘
    ];

    let best = directions[0];
    let bestScore = -Infinity;

    directions.forEach((direction) => {
      const directionLength = Math.hypot(direction.rowStep, direction.colStep);

      const score =
        (unitRow * direction.rowStep + unitCol * direction.colStep) /
        directionLength;

      if (score > bestScore) {
        bestScore = score;
        best = direction;
      }
    });

    return best;
  }, []);

  const buildLockedStraightSelection = useCallback(
    (start, current, direction) => {
      if (!direction) {
        return [start];
      }

      const rowDiff = current.row - start.row;
      const colDiff = current.col - start.col;

      // Project the pointer movement onto the locked line.
      // For diagonals, divide by 2 because both row and col
      // contribute to the projection.
      const diagonal = direction.rowStep !== 0 && direction.colStep !== 0;

      let steps = diagonal
        ? Math.round(
            (rowDiff * direction.rowStep + colDiff * direction.colStep) / 2,
          )
        : direction.rowStep !== 0
          ? Math.round(rowDiff * direction.rowStep)
          : Math.round(colDiff * direction.colStep);

      // Never allow the pointer to make the selection reverse
      // after the direction has been locked.
      steps = Math.max(0, steps);

      const rows = puzzleRef.current.rows;
      const cols = puzzleRef.current.cols;

      // Stop at the board edge.
      const maxRowSteps =
        direction.rowStep > 0
          ? rows - 1 - start.row
          : direction.rowStep < 0
            ? start.row
            : Infinity;

      const maxColSteps =
        direction.colStep > 0
          ? cols - 1 - start.col
          : direction.colStep < 0
            ? start.col
            : Infinity;

      steps = Math.min(steps, maxRowSteps, maxColSteps);

      const cells = [];

      for (let index = 0; index <= steps; index += 1) {
        cells.push({
          row: start.row + direction.rowStep * index,
          col: start.col + direction.colStep * index,
        });
      }

      return cells;
    },
    [],
  );

  const isStraightContinuation = useCallback((cells) => {
    if (!cells || cells.length <= 2) {
      return true;
    }

    const firstStep = {
      row: cells[1].row - cells[0].row,
      col: cells[1].col - cells[0].col,
    };

    for (let index = 2; index < cells.length; index += 1) {
      const step = {
        row: cells[index].row - cells[index - 1].row,
        col: cells[index].col - cells[index - 1].col,
      };

      if (step.row !== firstStep.row || step.col !== firstStep.col) {
        return false;
      }
    }

    return (
      Math.abs(firstStep.row) <= 1 &&
      Math.abs(firstStep.col) <= 1 &&
      (firstStep.row !== 0 || firstStep.col !== 0)
    );
  }, []);

  /* =========================================================
     MOVE SELECTION
  ========================================================= */

  const handlePointerMove = (event) => {
    if (!isSelectingRef.current) {
      return;
    }

    event.preventDefault();

    const currentCell = getCellFromPoint(event.clientX, event.clientY);

    if (!currentCell) {
      return;
    }

    const start = selectedCellsRef.current[0];

    if (!start) {
      return;
    }

    const rowDiff = currentCell.row - start.row;

    const colDiff = currentCell.col - start.col;

    // Choose the direction exactly once.
    if (!selectionDirectionRef.current) {
      if (rowDiff === 0 && colDiff === 0) {
        return;
      }

      selectionDirectionRef.current = getClosestDirection(rowDiff, colDiff);
    }

    const nextCells = buildLockedStraightSelection(
      start,
      currentCell,
      selectionDirectionRef.current,
    );

    if (!isStraightContinuation(nextCells)) {
      return;
    }

    selectedCellsRef.current = nextCells;
    setSelectedCells(nextCells);
  };

  /* =========================================================
     FINISH SELECTION
========================================================= */

  const finishSelection = () => {
    if (!isSelectingRef.current) {
      return;
    }

    isSelectingRef.current = false;

    setIsSelecting(false);

    const selection = selectedCellsRef.current;

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    if (!selection.length) {
      setSelectedCells([]);
      return;
    }

    /*
      Defensive validation:
      every consecutive cell must continue with
      the exact same one-cell step.
    */
    if (!isStraightContinuation(selection)) {
      selectionDirectionRef.current = null;
      setSelectedCells([]);
      return;
    }

    const selectedWord = getSelectionWord(selection);

    const reversedWord = selectedWord.split("").reverse().join("");

    const matchedWord = puzzleRef.current.words.find(
      (word) =>
        !foundWordsRef.current.includes(word) &&
        (word === selectedWord || word === reversedWord),
    );

    if (matchedWord) {
      const colorIndex = foundWordsRef.current.length % 10;

      setFoundWordColors((previous) => ({
        ...previous,
        [matchedWord]: colorIndex,
      }));

      setFoundWords((previous) => {
        if (previous.includes(matchedWord)) {
          return previous;
        }

        const next = [...previous, matchedWord];

        foundWordsRef.current = next;

        return next;
      });

      setFoundCells((previous) => {
        const next = [...previous];

        selection.forEach(({ row, col }) => {
          const key = getCellKey(row, col);

          if (!next.includes(key)) {
            next.push(key);
          }
        });

        return next;
      });

      setScore((previous) => previous + 10 + matchedWord.length * 2);
    }

    setSelectedCells([]);
  };

  /* =========================================================
     RESTART
========================================================= */

  const restartGame = () => {
    const freshPuzzle = generatePuzzle(level);

    setPuzzle(freshPuzzle);

    setTimeLeft(getGameTime(level));

    setScore(0);

    setFoundWords([]);

    foundWordsRef.current = [];

    setFoundCells([]);
    setFoundWordColors({});

    setRevealedCells([]);

    setSelectedCells([]);

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    isSelectingRef.current = false;

    setIsSelecting(false);

    setLevelComplete(false);

    setGameOver(false);

    setShowRevive(false);

    setRevived(false);

    revivedRef.current = false;

    setFinalComplete(false);

    rewardBankedRef.current = false;

    finishHandledRef.current = false;

    setShowGuide(true);
    setHintsLeft(2);
  };

  /* =========================================================
     NEXT LEVEL
========================================================= */

  const handleNextLevel = () => {
    if (level >= TOTAL_LEVELS) {
      setLevelComplete(false);
      setFinalComplete(true);
      setGameOver(false);
      return;
    }

    const nextLevel = level + 1;

    const nextPuzzle = generatePuzzle(nextLevel);

    setLevel(nextLevel);

    setPuzzle(nextPuzzle);

    setTimeLeft(getGameTime(nextLevel));

    setScore(0);

    setFoundWords([]);

    foundWordsRef.current = [];

    setFoundCells([]);
    setFoundWordColors({});

    setRevealedCells([]);

    setSelectedCells([]);

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    isSelectingRef.current = false;

    setIsSelecting(false);

    setLevelComplete(false);

    setGameOver(false);

    setShowRevive(false);

    setRevived(false);

    revivedRef.current = false;

    rewardBankedRef.current = false;

    finishHandledRef.current = false;

    setFinalComplete(false);

    setShowGuide(false);
    setHintsLeft(2);
  };

  /* =========================================================
     REVIVE
========================================================= */

  const handleRevive = () => {
    setShowRevive(false);

    setGameOver(false);

    setRevived(true);

    revivedRef.current = true;

    /*
      The user gets a second chance,
      so hide the answer reveal again.
    */
    setRevealedCells([]);

    setTimeLeft(25);

    setSelectedCells([]);

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    isSelectingRef.current = false;

    setIsSelecting(false);
  };

  const handleNoThanks = () => {
    setShowRevive(false);

    /*
      Keep the revealed answers visible.
    */
    revealMissedWords();

    setGameOver(true);
  };

  /* =========================================================
     FINISH GAME
========================================================= */

  const finishGame = () => {
    if (finishHandledRef.current) {
      return;
    }

    finishHandledRef.current = true;

    let reward = earnedCoinsRef.current;

    if (!rewardBankedRef.current) {
      reward += currentReward;
    }

    if (reward > 0) {
      addGameCoins(reward);
    }

    navigate("/game/8");
  };

  const [hintsLeft, setHintsLeft] = useState(2);

  const useHint = () => {
    if (hintsLeft <= 0 || levelComplete || gameOver) return;
    const missed = currentWords.find((word) => !foundWords.includes(word));
    const placement = missed ? puzzleRef.current.placements[missed] : null;
    if (!placement || !placement.length) return;
    const target = placement[0];
    const key = getCellKey(target.row, target.col);
    setRevealedCells((previous) =>
      previous.includes(key) ? previous : [...previous, key],
    );
    setHintsLeft((previous) => Math.max(0, previous - 1));
  };

  const addTime = () => {
    if (gameOver || levelComplete || finalComplete) return;
    setTimeLeft((previous) => previous + 30);
  };

  const shuffleBoard = () => {
    if (gameOver || levelComplete || finalComplete) return;
    const freshPuzzle = generatePuzzle(level);
    setPuzzle(freshPuzzle);
    setFoundWords([]);
    foundWordsRef.current = [];
    setFoundCells([]);
    setFoundWordColors({});
    setRevealedCells([]);
    setSelectedCells([]);
    selectedCellsRef.current = [];
    isSelectingRef.current = false;
    setIsSelecting(false);
  };

  /* =========================================================
     RENDER — PREMIUM VELOOP WORD HUNT REFERENCE UI
  ========================================================= */

  const activeWordCount = currentWords.length;

  return (
    <div className={styles.page}>
      <header className={styles.topHeader}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>∞</div>
          <div>
            <strong>VELOOP</strong>
            <span>REWARDS</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/game/8")}
        >
          <FiArrowLeft />
          <span>Back to Games</span>
        </button>

        <div className={styles.headerActions}>
          <div className={styles.coinBalance}>
            <span className={styles.coinIcon}>🪙</span>
            <strong>{Number(gameCoins || 0).toLocaleString()}</strong>
            <button type="button" onClick={() => navigate("/redeem")}>
              Redeem
            </button>
          </div>
          <button
            type="button"
            className={styles.settingsButton}
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <section className={styles.heroBanner}>
        <div className={styles.heroOrb} />
        <div className={styles.floatingLetter}>A</div>
        <div className={`${styles.floatingLetter} ${styles.floatB}`}>B</div>
        <div className={`${styles.floatingLetter} ${styles.floatC}`}>C</div>

        <div className={styles.heroContent}>
          <div className={styles.heroCrown}>♛</div>
          <h1>WORD HUNT</h1>
          <div className={styles.heroSubline}>
            FIND <i /> SWIPE <i /> SCORE <i /> WIN
          </div>
          <div className={styles.heroTag}>WORD SEARCH, BIGGER REWARDS</div>
        </div>
      </section>

      <section className={styles.gameStats}>
        <div className={styles.statBlock}>
          <span className={styles.statIcon}>▥</span>
          <div>
            <strong>LEVEL {level}</strong>
            <small>
              {getGridRows(level)}×{getGridCols(level)} GRID
            </small>
          </div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBlock}>
          <span className={styles.statIcon}>⏱</span>
          <div>
            <strong>{formatTime(timeLeft)}</strong>
            <small>TIME LEFT</small>
          </div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBlock}>
          <span className={styles.statIcon}>★</span>
          <div>
            <strong>{score}</strong>
            <small>SCORE</small>
          </div>
        </div>
        <button
          type="button"
          className={styles.hintTopButton}
          onClick={useHint}
        >
          <span>💡</span> Hint ({hintsLeft})
        </button>
      </section>

      <main className={styles.gameLayout}>
        <aside className={styles.leftPanel}>
          <div className={styles.panelTitle}>
            <span>◉</span> FIND THESE WORDS
          </div>
          <div className={styles.wordList}>
            {currentWords.map((word) => {
              const found = foundWords.includes(word);
              return (
                <div
                  key={word}
                  className={`${styles.wordItem} ${
                    found
                      ? `${styles.wordFound} ${
                          styles[`wordColor${foundWordColors[word] ?? 0}`]
                        }`
                      : ""
                  }`}
                >
                  <span>{word}</span>
                  <b>{found ? "✓" : "○"}</b>
                </div>
              );
            })}
          </div>
          <div className={styles.foundCounter}>
            <strong>
              {foundWords.length} / {activeWordCount}
            </strong>
            <span>WORDS FOUND</span>
            <div className={styles.miniProgress}>
              <i style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>

        <section className={styles.centerGame}>
          <div className={styles.boardShell}>
            <div className={styles.boardGlow} />
            <div
              ref={gridRef}
              className={styles.grid}
              onContextMenu={(event) => event.preventDefault()}
              style={{
                gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${puzzle.rows}, minmax(0, 1fr))`,
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={finishSelection}
              onPointerCancel={finishSelection}
              onLostPointerCapture={finishSelection}
              onPointerLeave={(event) => {
                if (isSelectingRef.current) handlePointerMove(event);
              }}
            >
              {puzzle.grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const key = getCellKey(rowIndex, colIndex);
                  const isSelected = selectedCells.some(
                    (cell) => cell.row === rowIndex && cell.col === colIndex,
                  );
                  const isFound = foundCells.includes(key);

                  const foundWordForCell = foundWords.find((word) =>
                    puzzle.placements[word]?.some(
                      (cell) => getCellKey(cell.row, cell.col) === key,
                    ),
                  );

                  const foundColorIndex = foundWordForCell
                    ? (foundWordColors[foundWordForCell] ?? 0)
                    : 0;

                  const isRevealed = revealedCells.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.cell} ${
                        isSelected ? styles.selectedCell : ""
                      } ${
                        isFound
                          ? `${styles.foundCell} ${
                              styles[`foundColor${foundColorIndex}`]
                            }`
                          : ""
                      } ${isRevealed && !isFound ? styles.revealedCell : ""}`}
                      onPointerDown={(event) =>
                        handlePointerDown(event, rowIndex, colIndex)
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

          <button
            type="button"
            className={styles.submitButton}
            onClick={finishSelection}
          >
            SUBMIT WORD
          </button>

          <div className={styles.bottomNav}>
            <span>PLAY</span>
            <i /> <span>EARN</span>
            <i /> <span>REDEEM</span>
            <i /> <span>REPEAT</span>
          </div>
        </section>

        <aside className={styles.rightPanel}>
          <div className={styles.panelTitle}>
            <span>🎮</span> HOW TO PLAY
          </div>
          <p className={styles.instruction}>
            Swipe to select letters in a <strong>straight line</strong> —
            Horizontal, Vertical or Diagonal.
          </p>
          <div className={styles.straightBadge}>
            ✓{" "}
            <span>
              Only straight lines
              <br />
              <small>No bends or turns</small>
            </span>
          </div>

          <div className={styles.powerTitle}>POWER-UPS</div>
          <button
            type="button"
            className={styles.powerButton}
            onClick={useHint}
            disabled={hintsLeft <= 0}
          >
            <span>💡</span>
            <div>
              <strong>Hint</strong>
              <small>Reveal a letter</small>
            </div>
            <b>{hintsLeft}</b>
          </button>
          <button
            type="button"
            className={styles.powerButton}
            onClick={addTime}
          >
            <span>⏱</span>
            <div>
              <strong>Time +30s</strong>
              <small>Get more time</small>
            </div>
            <b>1</b>
          </button>
          <button
            type="button"
            className={styles.powerButton}
            onClick={shuffleBoard}
          >
            <span>🔀</span>
            <div>
              <strong>Shuffle</strong>
              <small>Shuffle the board</small>
            </div>
            <b>1</b>
          </button>
        </aside>
      </main>

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={styles.restartButton}
          onClick={restartGame}
        >
          <FiRotateCcw /> Restart
        </button>
        <span className={styles.rewardPreview}>
          🪙 +{currentReward} <small>possible reward</small>
        </span>
      </div>

      {showGuide && (
        <div className={styles.modalOverlay}>
          <div className={styles.guideModal}>
            <span className={styles.modalBadge}>WORD HUNT</span>
            <h2>Find the hidden words</h2>
            <p>
              Swipe across letters in one straight line to find every hidden
              word.
            </p>
            <div className={styles.guideSteps}>
              <div>
                <b>01</b>
                <span>Find a hidden word.</span>
              </div>
              <div>
                <b>02</b>
                <span>Swipe across connected letters.</span>
              </div>
              <div>
                <b>03</b>
                <span>Horizontal, vertical or diagonal.</span>
              </div>
              <div>
                <b>04</b>
                <span>No bends or turns.</span>
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

      {levelComplete && (
        <div className={styles.modalOverlay}>
          <div className={styles.resultModal}>
            <div className={styles.successIcon}>✓</div>
            <span className={styles.modalBadge}>LEVEL COMPLETE</span>
            <h2>Great work!</h2>
            <div className={styles.resultStats}>
              <div>
                <small>SCORE</small>
                <strong>{score}</strong>
              </div>
              <div>
                <small>REWARD</small>
                <strong>🪙 +{getReward(level, score)}</strong>
              </div>
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleNextLevel}
            >
              {level >= TOTAL_LEVELS ? "VIEW RESULTS" : "NEXT LEVEL →"}
            </button>
          </div>
        </div>
      )}

      {finalComplete && (
        <div className={styles.modalOverlay}>
          <div className={styles.resultModal}>
            <div className={styles.successIcon}>★</div>
            <span className={styles.modalBadge}>ALL LEVELS COMPLETE</span>
            <h2>Word Hunt Master!</h2>
            <p>You completed all {TOTAL_LEVELS} levels.</p>
            <div className={styles.finalReward}>
              <span>GAME COINS EARNED</span>
              <strong>🪙 {earnedCoins}</strong>
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={finishGame}
            >
              COLLECT REWARD
            </button>
          </div>
        </div>
      )}

      {showRevive && (
        <div className={styles.modalOverlay}>
          <div className={styles.reviveModal}>
            <div className={styles.reviveIcon}>⏱</div>
            <span className={styles.modalBadge}>TIME'S UP</span>
            <h2>Keep playing?</h2>
            <p>
              The remaining hidden words have been revealed. Revive once and get
              25 more seconds.
            </p>
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
          </div>
        </div>
      )}

      {gameOver && !showRevive && !levelComplete && !finalComplete && (
        <div className={styles.modalOverlay}>
          <div className={styles.resultModal}>
            <div className={styles.failIcon}>!</div>
            <span className={styles.modalBadge}>TIME'S UP</span>
            <h2>Time's Up!</h2>
            <p>
              You found <strong>{foundWords.length}</strong> of{" "}
              <strong>{currentWords.length}</strong> hidden words.
            </p>
            <div className={styles.resultStats}>
              <div>
                <small>SCORE</small>
                <strong>{score}</strong>
              </div>
              <div>
                <small>REWARD</small>
                <strong>🪙 +{earnedCoins}</strong>
              </div>
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={finishGame}
            >
              COLLECT & EXIT
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={restartGame}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WordHuntGame;
