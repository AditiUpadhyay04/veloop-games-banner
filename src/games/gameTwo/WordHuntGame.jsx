import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiArrowLeft,
  FiClock,
  FiRotateCcw,
  FiGift,
  FiSettings,
  FiZap,
  FiShuffle,
  FiTarget,
  FiCheckCircle,
  FiMonitor,
  FiAward,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

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

  17: ["TREASURE", "ADVENTURE", "VICTORY", "SUNRISE", "KINGDOM", "FANTASY", "SPARK"],
  18: ["CHALLENGE", "MYSTERY", "CRYSTAL", "JOURNEY", "BALANCE", "LEGEND", "FREEDOM"],
  19: ["FANTASY", "RAINBOW", "DIGITAL", "PASSION", "ENERGY", "TREASURE", "VICTORY"],
  20: ["ADVENTURE", "CHALLENGE", "SPARKLE", "SUNRISE", "VICTORY", "KINGDOM", "TREASURE"],
};

/* =========================================================
   LEVEL SETTINGS
========================================================= */

function getGridSize(level) {
  // Keep the opening levels spacious like a real word-search game.
  // Difficulty increases through grid size + word count instead of
  // making the first board so small that it looks almost empty.
  if (level <= 4) return 5;
  if (level <= 8) return 6;
  if (level <= 12) return 6;
  if (level <= 16) return 7;
  return 8;
}

function getWordCount(level) {
  if (level <= 4) return 3;
  if (level <= 8) return 4;
  if (level <= 12) return 5;
  if (level <= 16) return 6;
  return 7;
}

function getGameTime(level) {
  if (level <= 4) return 60;
  if (level <= 8) return 55;
  if (level <= 12) return 50;
  if (level <= 16) return 45;

  return 40;
}

/* =========================================================
   HELPERS
========================================================= */

function shuffle(array) {
  const copy = [...array];

  for (
    let index = copy.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [copy[index], copy[randomIndex]] = [
      copy[randomIndex],
      copy[index],
    ];
  }

  return copy;
}

function isInside(row, col, size) {
  return (
    row >= 0 &&
    row < size &&
    col >= 0 &&
    col < size
  );
}

function getCellKey(row, col) {
  return `${row}-${col}`;
}

/* =========================================================
   PLACE ONE WORD
========================================================= */

function placeWord(grid, word, size) {
  const possiblePlacements = [];

  for (
    let row = 0;
    row < size;
    row += 1
  ) {
    for (
      let col = 0;
      col < size;
      col += 1
    ) {
      for (const direction of DIRECTIONS) {
        possiblePlacements.push({
          row,
          col,
          direction,
        });
      }
    }
  }

  for (
    const placement of shuffle(
      possiblePlacements
    )
  ) {
    const {
      row,
      col,
      direction,
    } = placement;

    const cells = [];
    let valid = true;

    for (
      let index = 0;
      index < word.length;
      index += 1
    ) {
      const nextRow =
        row +
        direction[0] *
          index;

      const nextCol =
        col +
        direction[1] *
          index;

      if (
        !isInside(
          nextRow,
          nextCol,
          size
        )
      ) {
        valid = false;
        break;
      }

      const current =
        grid[nextRow][nextCol];

      if (
        current &&
        current !== word[index]
      ) {
        valid = false;
        break;
      }

      cells.push({
        row: nextRow,
        col: nextCol,
      });
    }

    if (!valid) {
      continue;
    }

    cells.forEach(
      ({ row: cellRow, col: cellCol }, index) => {
        grid[cellRow][cellCol] =
          word[index];
      }
    );

    return cells;
  }

  return null;
}

/* =========================================================
   BUILD PUZZLE
========================================================= */

function generatePuzzle(level) {
  const size = getGridSize(level);
  const wordCount = getWordCount(level);

  const availableWords =
    (LEVEL_WORD_POOLS[level] || []).filter(
      (word) =>
        word.length <= size
    );

  for (
    let attempt = 0;
    attempt < 300;
    attempt += 1
  ) {
    const selectedWords =
      shuffle(
        availableWords
      ).slice(
        0,
        wordCount
      );

    if (
      selectedWords.length !==
      wordCount
    ) {
      continue;
    }

    const grid = Array.from(
      { length: size },
      () =>
        Array(size).fill("")
    );

    const placements = {};

    let failed = false;

    /*
      Place longer words first.
      This greatly improves generation
      reliability on small grids.
    */
    const wordsToPlace =
      [...selectedWords].sort(
        (a, b) =>
          b.length - a.length
      );

    for (const word of wordsToPlace) {
      const cells = placeWord(
        grid,
        word,
        size
      );

      if (!cells) {
        failed = true;
        break;
      }

      placements[word] = cells;
    }

    if (failed) {
      continue;
    }

    /* Fill remaining cells */

    for (
      let row = 0;
      row < size;
      row += 1
    ) {
      for (
        let col = 0;
        col < size;
        col += 1
      ) {
        if (!grid[row][col]) {
          grid[row][col] =
            ALPHABET[
              Math.floor(
                Math.random() *
                  ALPHABET.length
              )
            ];
        }
      }
    }

    return {
      size,
      words: selectedWords,
      grid,
      placements,
    };
  }

  /*
    Emergency fallback: keep retrying a deterministic straight-line
    placement instead of returning truncated/invalid target words.
  */
  const fallbackWords = availableWords.slice(0, wordCount);
  const fallbackGrid = Array.from(
    { length: size },
    () => Array(size).fill("")
  );
  const fallbackPlacements = {};
  let fallbackFailed = false;

  for (const word of [...fallbackWords].sort((a, b) => b.length - a.length)) {
    const cells = placeWord(fallbackGrid, word, size);
    if (!cells) {
      fallbackFailed = true;
      break;
    }
    fallbackPlacements[word] = cells;
  }

  if (!fallbackFailed) {
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (!fallbackGrid[row][col]) {
          fallbackGrid[row][col] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
      }
    }

    return {
      size,
      words: fallbackWords,
      grid: fallbackGrid,
      placements: fallbackPlacements,
    };
  }

  // This path should be practically unreachable with the configured levels.
  // Use a simple horizontal layout only when the board is too constrained.
  const safeWords = fallbackWords.filter((word) => word.length <= size);
  const safeGrid = Array.from({ length: size }, () => Array(size).fill(""));
  const safePlacements = {};

  safeWords.forEach((word, index) => {
    const row = index % size;
    const startCol = Math.min(index % 2, Math.max(0, size - word.length));
    const cells = [];
    for (let i = 0; i < word.length; i += 1) {
      safeGrid[row][startCol + i] = word[i];
      cells.push({ row, col: startCol + i });
    }
    safePlacements[word] = cells;
  });

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!safeGrid[row][col]) {
        safeGrid[row][col] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return {
    size,
    words: safeWords,
    grid: safeGrid,
    placements: safePlacements,
  };
}

/* =========================================================
   REWARD
========================================================= */

function getReward(
  level,
  score
) {
  return (
    5 +
    level * 2 +
    Math.floor(
      score / 50
    )
  );
}

/* =========================================================
   COMPONENT
========================================================= */


const getCellCenterPercent = (cell, size) => ({
  x: ((cell.col + 0.5) / size) * 100,
  y: ((cell.row + 0.5) / size) * 100,
});

const WORD_PATH_COLORS = [
  "#00e5ff",
  "#3cff9b",
  "#ff39d0",
  "#ffd34d",
  "#9b63ff",
  "#ff607d",
];

function WordHuntGame() {
  const navigate = useNavigate();

  const { addGameCoins, gameCoins } =
    useGameCoin();

  const [level, setLevel] =
    useState(1);

  const [puzzle, setPuzzle] =
    useState(() =>
      generatePuzzle(1)
    );

  const [timeLeft, setTimeLeft] =
    useState(
      getGameTime(1)
    );

  const [score, setScore] =
    useState(0);

  const [foundWords, setFoundWords] =
    useState([]);

  const [foundCells, setFoundCells] =
    useState([]);

  const [revealedCells, setRevealedCells] =
    useState([]);

  const [selectedCells, setSelectedCells] =
    useState([]);

  const [isSelecting, setIsSelecting] =
    useState(false);

  const [showGuide, setShowGuide] =
    useState(true);

  const [levelComplete, setLevelComplete] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [showRevive, setShowRevive] =
    useState(false);

  const [revived, setRevived] =
    useState(false);

  const [finalComplete, setFinalComplete] =
    useState(false);

  const [earnedCoins, setEarnedCoins] =
    useState(0);

  const [hintsLeft, setHintsLeft] =
    useState(2);

  const [timeBoostsLeft, setTimeBoostsLeft] =
    useState(1);

  const [shuffleLeft, setShuffleLeft] =
    useState(1);

  const [hintCell, setHintCell] =
    useState(null);

  const [toast, setToast] =
    useState("");

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [selectionFeedback, setSelectionFeedback] =
    useState(null);

  const [foundCellColors, setFoundCellColors] =
    useState({});

  const toastTimerRef =
    useRef(null);

  const selectionFeedbackTimerRef =
    useRef(null);

  const gridRef =
    useRef(null);

  const earnedCoinsRef =
    useRef(0);

  const rewardBankedRef =
    useRef(false);

  const finishHandledRef =
    useRef(false);

  const isSelectingRef =
    useRef(false);

  const selectedCellsRef =
    useRef([]);

  const selectionDirectionRef =
    useRef(null);

  const puzzleRef =
    useRef(puzzle);

  const foundWordsRef =
    useRef(foundWords);

  const revivedRef =
    useRef(revived);

  const levelCompleteRef =
    useRef(levelComplete);

  const gameOverRef =
    useRef(gameOver);

  useEffect(() => {
    puzzleRef.current = puzzle;
  }, [puzzle]);

  useEffect(() => {
    foundWordsRef.current =
      foundWords;
  }, [foundWords]);

  useEffect(() => {
    revivedRef.current =
      revived;
  }, [revived]);

  useEffect(() => {
    levelCompleteRef.current =
      levelComplete;
  }, [levelComplete]);

  useEffect(() => {
    gameOverRef.current =
      gameOver;
  }, [gameOver]);

  const currentWords = useMemo(
    () => puzzle.words,
    [puzzle.words]
  );

  const missedWords = useMemo(
    () =>
      currentWords.filter(
        (word) =>
          !foundWords.includes(
            word
          )
      ),
    [
      currentWords,
      foundWords,
    ]
  );

  const progress =
    currentWords.length
      ? Math.round(
          (foundWords.length /
            currentWords.length) *
            100
        )
      : 0;

  const currentReward =
    getReward(
      level,
      score
    );

  /* =========================================================
     REVEAL MISSED WORDS
========================================================= */

  const revealMissedWords = useCallback(() => {
    const currentPuzzle =
      puzzleRef.current;

    const currentFound =
      foundWordsRef.current;

    const missed =
      currentPuzzle.words.filter(
        (word) =>
          !currentFound.includes(
            word
          )
      );

    const revealSet =
      new Set();

    missed.forEach(
      (word) => {
        const placement =
          currentPuzzle
            .placements[word];

        if (!placement) {
          return;
        }

        placement.forEach(
          ({ row, col }) => {
            revealSet.add(
              getCellKey(
                row,
                col
              )
            );
          }
        );
      }
    );

    setRevealedCells(
      [...revealSet]
    );
  }, []);

  /* =========================================================
     TIMER
========================================================= */

  useEffect(() => {
    if (
      showGuide ||
      levelComplete ||
      gameOver ||
      finalComplete
    ) {
      return undefined;
    }

    const timerId =
      window.setInterval(() => {
        setTimeLeft(
          (previous) => {
            if (previous <= 1) {
              window.clearInterval(
                timerId
              );

              revealMissedWords();

              setGameOver(true);

              if (
                !revivedRef.current
              ) {
                setShowRevive(true);
              }

              return 0;
            }

            return previous - 1;
          }
        );
      }, 1000);

    return () =>
      window.clearInterval(
        timerId
      );
  }, [
    showGuide,
    levelComplete,
    gameOver,
    finalComplete,
    revealMissedWords,
  ]);

  /* =========================================================
     LEVEL COMPLETE
========================================================= */

  useEffect(() => {
    if (
      currentWords.length === 0
    ) {
      return;
    }

    if (
      foundWords.length ===
        currentWords.length &&
      !levelComplete &&
      !gameOver
    ) {
      const reward =
        getReward(
          level,
          score
        );

      if (
        !rewardBankedRef.current
      ) {
        rewardBankedRef.current =
          true;

        earnedCoinsRef.current +=
          reward;

        setEarnedCoins(
          earnedCoinsRef.current
        );
      }

      setLevelComplete(
        true
      );
    }
  }, [
    foundWords,
    currentWords.length,
    level,
    score,
    levelComplete,
    gameOver,
  ]);

  /* =========================================================
     FIND CELL FROM POINTER
========================================================= */

  const getCellFromPoint = useCallback(
    (
      clientX,
      clientY
    ) => {
      const grid =
        gridRef.current;

      if (!grid) {
        return null;
      }

      const rect = grid.getBoundingClientRect();
      const computed = window.getComputedStyle(grid);
      const paddingLeft = parseFloat(computed.paddingLeft) || 0;
      const paddingRight = parseFloat(computed.paddingRight) || 0;
      const paddingTop = parseFloat(computed.paddingTop) || 0;
      const paddingBottom = parseFloat(computed.paddingBottom) || 0;

      const size = puzzleRef.current.size;
      const innerLeft = rect.left + paddingLeft;
      const innerTop = rect.top + paddingTop;
      const innerWidth = Math.max(1, rect.width - paddingLeft - paddingRight);
      const innerHeight = Math.max(1, rect.height - paddingTop - paddingBottom);
      const cellWidth = innerWidth / size;
      const cellHeight = innerHeight / size;

      const col = Math.floor((clientX - innerLeft) / cellWidth);
      const row = Math.floor((clientY - innerTop) / cellHeight);

      if (
        !isInside(
          row,
          col,
          size
        )
      ) {
        return null;
      }

      return {
        row,
        col,
      };
    },
    []
  );

  /* =========================================================
     SELECTION WORD
========================================================= */

  const getSelectionWord =
    useCallback(
      (cells) => {
        const currentPuzzle =
          puzzleRef.current;

        return cells
          .map(
            ({
              row,
              col,
            }) =>
              currentPuzzle
                .grid[row][col]
          )
          .join("");
      },
      []
    );

  /* =========================================================
     START SELECTION
========================================================= */

  const handlePointerDown = (
    event,
    row,
    col
  ) => {
    if (
      showGuide ||
      levelComplete ||
      gameOver ||
      finalComplete
    ) {
      return;
    }

    event.preventDefault();

    // Capture the pointer on the GRID, not the individual
    // letter button. This keeps diagonal dragging reliable
    // even when the pointer moves across several cells.
    try {
      gridRef.current?.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture is only a reliability enhancement.
    }

    const initialCell = { row, col };

    isSelectingRef.current = true;
    selectedCellsRef.current = [initialCell];
    selectionDirectionRef.current = null;

    setIsSelecting(true);
    setSelectedCells([initialCell]);
  };

  /* =========================================================
     BUILD STRAIGHT SELECTION

     The first cell is the anchor. As soon as the pointer reaches
     another cell, we choose exactly ONE of the 8 legal directions:

       →  ↘  ↓  ↙  ←  ↖  ↑  ↗

     The chosen direction is locked until pointer-up.

     IMPORTANT:
     The actual selected cells are always generated mathematically
     from the first cell + one fixed step. Therefore a selection
     can NEVER bend, turn, zig-zag, or mix directions.
  ========================================================= */

  const getNearestDirection = useCallback(
    (start, end) => {
      const rowDiff = end.row - start.row;
      const colDiff = end.col - start.col;

      if (rowDiff === 0 && colDiff === 0) {
        return null;
      }

      // Prefer the dominant axis for horizontal/vertical drags.
      // Use diagonal only when the two movements are close enough
      // to represent a diagonal.
      const absRow = Math.abs(rowDiff);
      const absCol = Math.abs(colDiff);

      if (absRow === 0) {
        return { rowStep: 0, colStep: Math.sign(colDiff) };
      }

      if (absCol === 0) {
        return { rowStep: Math.sign(rowDiff), colStep: 0 };
      }

      if (absRow === absCol) {
        return {
          rowStep: Math.sign(rowDiff),
          colStep: Math.sign(colDiff),
        };
      }

      // Forgiving diagonal snapping:
      // if the two axes differ by only one cell, treat it as diagonal.
      if (Math.abs(absRow - absCol) <= 1) {
        return {
          rowStep: Math.sign(rowDiff),
          colStep: Math.sign(colDiff),
        };
      }

      // Otherwise use the dominant axis.
      if (absCol > absRow) {
        return { rowStep: 0, colStep: Math.sign(colDiff) };
      }

      return { rowStep: Math.sign(rowDiff), colStep: 0 };
    },
    []
  );

  const buildStraightSelection = useCallback(
    (start, end, direction) => {
      if (!direction) {
        return [start];
      }

      const size = puzzleRef.current.size;

      const rowDistance = Math.abs(end.row - start.row);
      const colDistance = Math.abs(end.col - start.col);

      let distance;

      if (direction.rowStep === 0) {
        distance = colDistance;
      } else if (direction.colStep === 0) {
        distance = rowDistance;
      } else {
        // For a diagonal, use the smaller axis distance so that
        // every returned cell remains on the same 45° line.
        distance = Math.min(rowDistance, colDistance);
      }

      if (distance < 1) {
        return [start];
      }

      const maxRowDistance =
        direction.rowStep > 0
          ? size - 1 - start.row
          : direction.rowStep < 0
            ? start.row
            : Infinity;

      const maxColDistance =
        direction.colStep > 0
          ? size - 1 - start.col
          : direction.colStep < 0
            ? start.col
            : Infinity;

      distance = Math.min(
        distance,
        maxRowDistance,
        maxColDistance
      );

      if (distance < 1) {
        return [start];
      }

      return Array.from(
        { length: distance + 1 },
        (_, index) => ({
          row:
            start.row +
            direction.rowStep * index,
          col:
            start.col +
            direction.colStep * index,
        })
      );
    },
    []
  );

  /* =========================================================
     MOVE SELECTION
  ========================================================= */

  const handlePointerMove = (event) => {
    if (!isSelectingRef.current) {
      return;
    }

    event.preventDefault();

    const start = selectedCellsRef.current[0];
    if (!start) {
      return;
    }

    const currentCell = getCellFromPoint(
      event.clientX,
      event.clientY
    );

    if (!currentCell) {
      return;
    }

    // Lock the direction only once.
    if (!selectionDirectionRef.current) {
      const direction = getNearestDirection(
        start,
        currentCell
      );

      if (!direction) {
        return;
      }

      selectionDirectionRef.current = direction;
    }

    const nextCells = buildStraightSelection(
      start,
      currentCell,
      selectionDirectionRef.current
    );

    selectedCellsRef.current = nextCells;
    setSelectedCells(nextCells);
  };

  /* =========================================================
     FINISH SELECTION
========================================================= */

  const finishSelection = () => {
    const selection = selectedCellsRef.current;

    if (!selection.length) {
      setSelectedCells([]);
      showToast("Swipe across a word first");
      return;
    }

    isSelectingRef.current = false;
    setIsSelecting(false);

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    /* Defensive validation: selection must remain one straight line. */
    if (selection.length >= 2) {
      const firstStep = {
        row: selection[1].row - selection[0].row,
        col: selection[1].col - selection[0].col,
      };

      const isStraight = selection.every((cell, index) => {
        if (index === 0) return true;
        return (
          cell.row === selection[0].row + firstStep.row * index &&
          cell.col === selection[0].col + firstStep.col * index
        );
      });

      const isAllowedDirection =
        (firstStep.row === 0 && firstStep.col !== 0) ||
        (firstStep.col === 0 && firstStep.row !== 0) ||
        (Math.abs(firstStep.row) === 1 && Math.abs(firstStep.col) === 1);

      if (!isStraight || !isAllowedDirection) {
        setSelectionFeedback({ type: "wrong", text: "Only straight lines" });
        setSelectedCells([]);
        showToast("Only straight lines are allowed");
        return;
      }
    }

    const selectedWord = getSelectionWord(selection);
    const reversedWord = selectedWord.split("").reverse().join("");

    const matchedWord = puzzleRef.current.words.find(
      (word) =>
        !foundWordsRef.current.includes(word) &&
        (word === selectedWord || word === reversedWord)
    );

    if (matchedWord) {
      const wordIndex = puzzleRef.current.words.indexOf(matchedWord);
      const colorClass = `foundColor${(wordIndex % 6) + 1}`;

      setFoundWords((previous) => {
        if (previous.includes(matchedWord)) return previous;
        const next = [...previous, matchedWord];
        foundWordsRef.current = next;
        return next;
      });

      setFoundCells((previous) => {
        const next = [...previous];
        selection.forEach(({ row, col }) => {
          const key = getCellKey(row, col);
          if (!next.includes(key)) next.push(key);
        });
        return next;
      });

      setFoundCellColors((previous) => {
        const next = { ...previous };
        selection.forEach(({ row, col }) => {
          next[getCellKey(row, col)] = colorClass;
        });
        return next;
      });

      const points = 10 + matchedWord.length * 2;
      setScore((previous) => previous + points);
      setSelectionFeedback({
        type: "correct",
        text: `GREAT! +${points} · ${matchedWord} found`,
      });
      showToast(`✓ ${matchedWord} found · +${points}`);

      // Small native haptic on supported mobile browsers.
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([18, 30, 18]);
        }
      } catch {
        // Haptics are optional and must never affect gameplay.
      }
    } else {
      setSelectionFeedback({
        type: "wrong",
        text: selectedWord.length > 1 ? "WRONG WORD · Try again" : "SELECT MORE LETTERS",
      });
      showToast("✕ That is not a target word");

      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(55);
        }
      } catch {
        // Haptics are optional.
      }
    }

    setSelectedCells(selection);

    if (selectionFeedbackTimerRef.current) {
      window.clearTimeout(selectionFeedbackTimerRef.current);
    }

    selectionFeedbackTimerRef.current = window.setTimeout(() => {
      setSelectedCells([]);
      setSelectionFeedback(null);
    }, matchedWord ? 700 : 450);
  };

  /* =========================================================
     RESTART
========================================================= */

  const restartGame = () => {
    const freshPuzzle =
      generatePuzzle(level);

    setPuzzle(freshPuzzle);

    setTimeLeft(
      getGameTime(level)
    );

    setScore(0);

    setFoundWords([]);

    foundWordsRef.current = [];

    setFoundCells([]);
    setFoundCellColors({});

    setRevealedCells([]);

    setSelectedCells([]);

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    isSelectingRef.current =
      false;

    setIsSelecting(false);

    setLevelComplete(false);

    setGameOver(false);

    setShowRevive(false);

    setRevived(false);

    revivedRef.current = false;

    setFinalComplete(false);
    setSelectionFeedback(null);

    rewardBankedRef.current =
      false;

    finishHandledRef.current =
      false;

    setShowGuide(true);
  };

  /* =========================================================
     NEXT LEVEL
========================================================= */

  const handleNextLevel = () => {
    if (
      level >= TOTAL_LEVELS
    ) {
      setLevelComplete(false);
      setFinalComplete(true);
      setGameOver(false);
      return;
    }

    const nextLevel =
      level + 1;

    const nextPuzzle =
      generatePuzzle(
        nextLevel
      );

    setLevel(nextLevel);

    setPuzzle(nextPuzzle);

    setTimeLeft(
      getGameTime(
        nextLevel
      )
    );

    setScore(0);

    setFoundWords([]);

    foundWordsRef.current = [];

    setFoundCells([]);
    setFoundCellColors({});

    setRevealedCells([]);

    setSelectedCells([]);

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    isSelectingRef.current =
      false;

    setIsSelecting(false);

    setLevelComplete(false);

    setGameOver(false);

    setShowRevive(false);

    setRevived(false);

    revivedRef.current = false;

    rewardBankedRef.current =
      false;

    finishHandledRef.current =
      false;

    setFinalComplete(false);

    setShowGuide(false);
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

    isSelectingRef.current =
      false;

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
     NEON HUD ACTIONS
  ========================================================= */

  const showToast = useCallback((message) => {
    setToast(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 1800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (selectionFeedbackTimerRef.current) {
        window.clearTimeout(selectionFeedbackTimerRef.current);
      }
    };
  }, []);

  const handleHint = () => {
    if (hintsLeft <= 0 || levelComplete || gameOver) {
      showToast(
        hintsLeft <= 0
          ? "No hints left"
          : "Finish the current level first"
      );
      return;
    }

    const remainingWords =
      currentWords.filter(
        (word) => !foundWords.includes(word)
      );

    if (!remainingWords.length) {
      showToast("All words found!");
      return;
    }

    const word =
      remainingWords[
        Math.floor(
          Math.random() * remainingWords.length
        )
      ];

    const placement =
      puzzleRef.current.placements[word];

    if (!placement?.length) {
      showToast("Hint unavailable");
      return;
    }

    const randomCell =
      placement[
        Math.floor(
          Math.random() * placement.length
        )
      ];

    setHintCell(
      getCellKey(
        randomCell.row,
        randomCell.col
      )
    );

    setHintsLeft(
      (previous) => previous - 1
    );

    showToast(`Hint: ${word[0]} is highlighted`);

    window.setTimeout(() => {
      setHintCell(null);
    }, 1600);
  };

  const handleTimeBoost = () => {
    if (timeBoostsLeft <= 0 || levelComplete || finalComplete) {
      showToast(
        timeBoostsLeft <= 0
          ? "Time boost already used"
          : "Time boost is unavailable"
      );
      return;
    }

    setTimeLeft(
      (previous) => previous + 30
    );

    setTimeBoostsLeft(
      (previous) => previous - 1
    );

    showToast("+30 seconds added");
  };

  const handleShuffle = () => {
    if (shuffleLeft <= 0 || levelComplete || gameOver) {
      showToast(
        shuffleLeft <= 0
          ? "Shuffle already used"
          : "Shuffle is unavailable"
      );
      return;
    }

    const freshPuzzle =
      generatePuzzle(level);

    setPuzzle(freshPuzzle);
    puzzleRef.current = freshPuzzle;

    setFoundWords([]);
    foundWordsRef.current = [];

    setFoundCells([]);
    setFoundCellColors({});
    setRevealedCells([]);
    setSelectedCells([]);

    selectedCellsRef.current = [];
    selectionDirectionRef.current = null;

    isSelectingRef.current = false;
    setIsSelecting(false);

    setHintCell(null);

    setShuffleLeft(
      (previous) => previous - 1
    );

    showToast("Board shuffled");
  };

  const handlePointerUp = (event) => {
    if (!isSelectingRef.current) return;

    // A normal word-search game validates the swipe as soon as the
    // finger/mouse is released. The player should NOT have to press
    // a second Submit button after every word.
    finishSelection();

    try {
      if (gridRef.current?.hasPointerCapture?.(event.pointerId)) {
        gridRef.current.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture release is best-effort.
    }
  };

  // Keep the button as a fallback for mouse users/accessibility, but
  // it is no longer required for the normal swipe flow.
  const handleSubmitWord = () => {
    if (!selectedCellsRef.current.length) return;
    finishSelection();
  };

  const handleSettings = () => {
    setSettingsOpen(true);
  };

  /* =========================================================
     FINISH GAME
========================================================= */

  const finishGame = () => {
    if (
      finishHandledRef.current
    ) {
      return;
    }

    finishHandledRef.current =
      true;

    let reward =
      earnedCoinsRef.current;

    if (
      !rewardBankedRef.current
    ) {
      reward += currentReward;
    }

    if (reward > 0) {
      addGameCoins(reward);
    }

    navigate("/game/8");
  };

  /* =========================================================
     RENDER — PREMIUM NEON WORD HUNT ARENA
  ========================================================= */

  return (
    <div className={styles.page}>
      <div className={styles.ambientGlow} />
      <div className={styles.starField} aria-hidden="true">
        {Array.from({ length: 28 }).map((_, index) => (
          <span
            key={index}
            className={styles.star}
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 61) % 100}%`,
              animationDelay: `${(index % 7) * 0.45}s`,
            }}
          />
        ))}
      </div>

      {/* ================= TOP BAR ================= */}

      <header className={styles.topBar}>
        <motion.button
          type="button"
          className={styles.backButton}
          whileHover={{ scale: 1.04, x: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/game/8")}
          aria-label="Back to games"
        >
          <FiArrowLeft />
          <span>Back to Games</span>
        </motion.button>

        <div className={styles.brand}>
          <div className={styles.brandMark}>∞</div>
          <div>
            <strong>VELOOP</strong>
            <span>REWARDS</span>
          </div>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.coinBalance}
            onClick={() => navigate("/redeem")}
          >
            <span className={styles.coinIcon}>🪙</span>
            <strong>{Number(gameCoins || 0).toLocaleString()}</strong>
            <span className={styles.redeemText}>Redeem</span>
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={handleSettings}
            aria-label="Settings"
          >
            <FiSettings />
          </button>
        </div>
      </header>

      <main className={styles.arena}>
        {/* ================= HERO TITLE ================= */}

        <section className={styles.hero}>
          <div className={styles.floatingLetter + " " + styles.letterA}>A</div>
          <div className={styles.floatingLetter + " " + styles.letterB}>B</div>
          <div className={styles.floatingLetter + " " + styles.letterC}>C</div>

          <div className={styles.crown}>♛</div>

          <motion.h1
            className={styles.gameTitle}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span>WORD</span> <b>HUNT</b>
          </motion.h1>

          <div className={styles.titleSub}>
            <span>FIND</span>
            <i>◆</i>
            <span>SWIPE</span>
            <i>◆</i>
            <span>SCORE</span>
            <i>◆</i>
            <span>WIN</span>
          </div>

          <div className={styles.titleRibbon}>
            WORD SEARCH <b>•</b> BIGGER REWARDS
          </div>
        </section>

        {/* ================= HUD ================= */}

        <section className={styles.hud}>
          <div className={styles.hudItem}>
            <FiTarget />
            <div>
              <span>LEVEL {level}</span>
              <strong>WORD CHALLENGE</strong>
            </div>
          </div>

          <div className={styles.hudDivider} />

          <div className={styles.hudItem}>
            <FiClock className={styles.timerIcon} />
            <div>
              <span className={timeLeft <= 10 ? styles.dangerText : ""}>
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                {String(timeLeft % 60).padStart(2, "0")}
              </span>
              <strong>TIME LEFT</strong>
            </div>
          </div>

          <div className={styles.hudDivider} />

          <div className={styles.hudItem}>
            <span className={styles.scoreStar}>★</span>
            <div>
              <span>{score}</span>
              <strong>SCORE</strong>
            </div>
          </div>

          <button
            type="button"
            className={styles.hintHud}
            onClick={handleHint}
          >
            <FiZap />
            <span>Hint ({hintsLeft})</span>
          </button>
        </section>

        {/* ================= THREE COLUMN GAME ================= */}

        <section className={styles.gameLayout}>
          {/* LEFT */}
          <aside className={styles.sidePanel}>
            <div className={styles.panelTitle}>
              <FiTarget />
              <span>FIND THESE WORDS</span>
            </div>

            <div className={styles.wordList}>
              {currentWords.map((word) => {
                const found =
                  foundWords.includes(word);

                return (
                  <motion.div
                    key={word}
                    className={`${styles.targetWord} ${
                      found ? styles.wordFound : ""
                    }`}
                    animate={
                      found
                        ? { opacity: [0.75, 1], x: [0, 4, 0] }
                        : {}
                    }
                  >
                    <span>{word}</span>
                    <span className={styles.wordStatus}>
                      {found ? <FiCheckCircle /> : "○"}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className={styles.wordsProgress}>
              <div className={styles.progressNumbers}>
                <strong>
                  {foundWords.length}/{currentWords.length}
                </strong>
                <span>WORDS FOUND</span>
              </div>
              <div className={styles.progressTrack}>
                <motion.div
                  className={styles.progressFill}
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>
          </aside>

          {/* CENTER */}
          <div className={styles.boardColumn}>
            <div className={styles.boardFrame}>
              <div className={styles.boardGlow} />

              <div
                ref={gridRef}
                className={styles.grid}
                onContextMenu={(event) =>
                  event.preventDefault()
                }
                style={{
                  gridTemplateColumns:
                    `repeat(${puzzle.size}, minmax(0, 1fr))`,
                  gridTemplateRows:
                    `repeat(${puzzle.size}, minmax(0, 1fr))`,
                  "--grid-size": puzzle.size,
                  touchAction: "none",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={(event) => {
                  selectedCellsRef.current = [];
                  selectionDirectionRef.current = null;
                  isSelectingRef.current = false;
                  setIsSelecting(false);
                  setSelectedCells([]);

                  try {
                    if (gridRef.current?.hasPointerCapture?.(event.pointerId)) {
                      gridRef.current.releasePointerCapture(event.pointerId);
                    }
                  } catch {
                    // Best-effort cleanup.
                  }
                }}
                onLostPointerCapture={() => {
                  // Do not submit here. A lost capture can happen while
                  // the pointer is leaving the browser/window. The actual
                  // pointer-up handler owns validation.
                }}
              >
                {/* Connected neon paths make the swipe feel like a real word-search game. */}
                <svg
                  className={styles.selectionOverlay}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {foundWords.map((word, index) => {
                    const placement = puzzle.placements[word];
                    if (!placement?.length) return null;
                    const points = placement
                      .map((cell) => {
                        const point = getCellCenterPercent(cell, puzzle.size);
                        return `${point.x},${point.y}`;
                      })
                      .join(" ");
                    const stroke = WORD_PATH_COLORS[index % WORD_PATH_COLORS.length];
                    return (
                      <g key={`found-path-${word}`}>
                        <polyline
                          points={points}
                          fill="none"
                          stroke={stroke}
                          strokeWidth="5.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity=".18"
                          filter="url(#wordGlow)"
                        />
                        <polyline
                          points={points}
                          fill="none"
                          stroke={stroke}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity=".72"
                        />
                      </g>
                    );
                  })}

                  {selectedCells.length > 1 && (
                    <g className={selectionFeedback?.type === "wrong" ? styles.selectionPathWrong : styles.selectionPathLive}>
                      <defs>
                        <filter id="wordGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="1.8" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <polyline
                        points={selectedCells
                          .map((cell) => {
                            const point = getCellCenterPercent(cell, puzzle.size);
                            return `${point.x},${point.y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity=".2"
                        filter="url(#wordGlow)"
                      />
                      <polyline
                        points={selectedCells
                          .map((cell) => {
                            const point = getCellCenterPercent(cell, puzzle.size);
                            return `${point.x},${point.y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity=".95"
                      />
                    </g>
                  )}
                </svg>

                {puzzle.grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => {
                    const key = getCellKey(
                      rowIndex,
                      colIndex
                    );

                    const isSelected =
                      selectedCells.some(
                        (cell) =>
                          cell.row === rowIndex &&
                          cell.col === colIndex
                      );

                    const isFound =
                      foundCells.includes(key);

                    const isRevealed =
                      revealedCells.includes(key);

                    const isHint =
                      hintCell === key;

                    const foundColorClass =
                      foundCellColors[key]
                        ? styles[foundCellColors[key]]
                        : "";

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        className={`${styles.cell}
                          ${isSelected ? styles.selectedCell : ""}
                          ${isFound ? `${styles.foundCell} ${foundColorClass}` : ""}
                          ${isRevealed && !isFound ? styles.revealedCell : ""}
                          ${selectionFeedback?.type === "wrong" && isSelected ? styles.wrongSelection : ""}
                          ${isHint ? styles.hintCell : ""}
                        `}
                        whileTap={{ scale: 0.92 }}
                        onPointerDown={(event) =>
                          handlePointerDown(
                            event,
                            rowIndex,
                            colIndex
                          )
                        }
                        aria-label={`Letter ${letter}`}
                      >
                        {letter}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            <AnimatePresence>
              {selectionFeedback && (
                <motion.div
                  className={`${styles.selectionFeedback} ${
                    selectionFeedback.type === "correct"
                      ? styles.feedbackCorrect
                      : styles.feedbackWrong
                  }`}
                  initial={{ opacity: 0, y: 8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                >
                  {selectionFeedback.type === "correct" ? "✓" : "✕"}
                  <span>{selectionFeedback.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.boardRule}>
              <FiCheckCircle />
              <span>ONLY STRAIGHT LINES</span>
              <b>NO BENDS OR TURNS</b>
            </div>

            <motion.button
              type="button"
              className={styles.submitButton}
              whileHover={{
                scale: 1.025,
                boxShadow: "0 0 34px rgba(185, 55, 255, .65)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmitWord}
              disabled={!selectedCells.length}
            >
              SUBMIT WORD
              <FiChevronRight />
            </motion.button>
          </div>

          {/* RIGHT */}
          <aside className={styles.sidePanel}>
            <div className={styles.panelTitle}>
              <FiMonitor />
              <span>HOW TO PLAY</span>
            </div>

            <div className={styles.instructions}>
              <p>
                Swipe to select letters in a straight line
                (Horizontal, Vertical or Diagonal) to form words.
              </p>

              <div className={styles.ruleCard}>
                <FiCheckCircle />
                <div>
                  <strong>Only straight lines</strong>
                  <span>No bends or turns</span>
                </div>
              </div>
            </div>

            <div className={styles.panelTitle + " " + styles.powerTitle}>
              <FiZap />
              <span>POWER-UPS</span>
            </div>

            <button
              type="button"
              className={styles.powerCard}
              onClick={handleHint}
            >
              <span className={styles.powerIcon}>
                <FiZap />
              </span>
              <span className={styles.powerCopy}>
                <strong>Hint</strong>
                <small>Reveal a letter</small>
              </span>
              <b>{hintsLeft}</b>
            </button>

            <button
              type="button"
              className={styles.powerCard}
              onClick={handleTimeBoost}
            >
              <span className={styles.powerIcon}>
                <FiClock />
              </span>
              <span className={styles.powerCopy}>
                <strong>Time +30s</strong>
                <small>Get more time</small>
              </span>
              <b>{timeBoostsLeft}</b>
            </button>

            <button
              type="button"
              className={styles.powerCard}
              onClick={handleShuffle}
            >
              <span className={styles.powerIcon}>
                <FiShuffle />
              </span>
              <span className={styles.powerCopy}>
                <strong>Shuffle</strong>
                <small>Shuffle the board</small>
              </span>
              <b>{shuffleLeft}</b>
            </button>
          </aside>
        </section>

        {/* ================= BOTTOM GAME STRIP ================= */}

        <div className={styles.bottomStrip}>
          <div className={styles.miniReward}>
            <span>LEVEL REWARD</span>
            <strong>🪙 +{currentReward}</strong>
          </div>

          <button
            type="button"
            className={styles.restartButton}
            onClick={restartGame}
          >
            <FiRotateCcw />
            Restart
          </button>

          <div className={styles.bottomMessage}>
            <FiAward />
            <span>PLAY</span>
            <i>◆</i>
            <span>EARN</span>
            <i>◆</i>
            <span>REDEEM</span>
            <i>◆</i>
            <span>REPEAT</span>
          </div>
        </div>
      </main>

      {/* LIVE TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <FiZap />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SETTINGS */}
      {settingsOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSettingsOpen(false)}
        >
          <motion.div
            className={styles.settingsModal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
            >
              <FiX />
            </button>

            <div className={styles.modalBadge}>WORD HUNT</div>
            <FiSettings className={styles.modalBigIcon} />
            <h2>Game Settings</h2>
            <p>
              Premium neon mode is active. Your progress,
              rewards and controls are ready for play.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                setSettingsOpen(false);
                showToast("Settings saved");
              }}
            >
              DONE
            </button>
          </motion.div>
        </div>
      )}

      {/* ================= GUIDE ================= */}

      {showGuide && (
        <div
          className={
            styles.modalOverlay
          }
        >

          <div
            className={
              styles.guideModal
            }
          >

            <div
              className={
                styles.modalBadge
              }
            >
              WORD HUNT
            </div>

            <h2>
              Find the hidden words
            </h2>

            <p>
              Search the grid and discover
              the hidden words before the
              timer runs out.
            </p>

            <div
              className={
                styles.guideSteps
              }
            >

              <div>
                <b>01</b>

                <span>
                  Search the grid for hidden
                  words.
                </span>
              </div>

              <div>
                <b>02</b>

                <span>
                  Press and drag across
                  connected letters.
                </span>
              </div>

              <div>
                <b>03</b>

                <span>
                  Words can be horizontal,
                  vertical or diagonal.
                </span>
              </div>

              <div>
                <b>04</b>

                <span>
                  Find every hidden word
                  before time runs out.
                </span>
              </div>

            </div>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={() =>
                setShowGuide(false)
              }
            >
              START GAME
            </button>

          </div>

        </div>
      )}

      {/* ================= LEVEL COMPLETE ================= */}

      {levelComplete && (
        <div
          className={
            styles.modalOverlay
          }
        >

          <div
            className={
              `${styles.resultModal} ${styles.levelCompleteModal}`
            }
          >

            <div className={styles.successCelebration} aria-hidden="true">
              <div className={styles.starBurst}>
                {[0, 1, 2].map((star) => (
                  <span key={star} className={styles.rewardStar}>★</span>
                ))}
              </div>
              <div className={styles.confettiBurst}>
                {Array.from({ length: 28 }).map((_, index) => (
                  <span key={index} style={{ "--i": index }} />
                ))}
              </div>
              <div className={styles.successRing}>
                <span>✓</span>
              </div>
            </div>

            <span
              className={
                styles.modalBadge
              }
            >
              LEVEL COMPLETE
            </span>

            <h2>
              Great work!
            </h2>

            <div
              className={
                styles.resultStats
              }
            >

              <div>
                <small>
                  SCORE
                </small>

                <strong>
                  {score}
                </strong>
              </div>

              <div>
                <small>
                  REWARD
                </small>

                <strong>
                  🪙 +
                  {getReward(
                    level,
                    score
                  )}
                </strong>
              </div>

            </div>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                handleNextLevel
              }
            >
              {level >=
              TOTAL_LEVELS
                ? "VIEW RESULTS"
                : "NEXT LEVEL →"}
            </button>

          </div>

        </div>
      )}

      {/* ================= FINAL COMPLETE ================= */}

      {finalComplete && (
        <div
          className={
            styles.modalOverlay
          }
        >

          <div
            className={
              styles.resultModal
            }
          >

            <div
              className={
                styles.successIcon
              }
            >
              ★
            </div>

            <span
              className={
                styles.modalBadge
              }
            >
              ALL LEVELS COMPLETE
            </span>

            <h2>
              Word Hunt Master!
            </h2>

            <p>
              You completed all{" "}
              {TOTAL_LEVELS} levels.
            </p>

            <div
              className={
                styles.finalReward
              }
            >

              <span>
                GAME COINS EARNED
              </span>

              <strong>
                🪙 {earnedCoins}
              </strong>

            </div>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                finishGame
              }
            >
              COLLECT REWARD
            </button>

          </div>

        </div>
      )}

      {/* ================= REVIVE ================= */}

      {showRevive && (
        <div
          className={
            styles.modalOverlay
          }
        >

          <div
            className={
              styles.reviveModal
            }
          >

            <div
              className={
                styles.reviveIcon
              }
            >
              ⏱
            </div>

            <span
              className={
                styles.modalBadge
              }
            >
              TIME'S UP
            </span>

            <h2>
              Keep playing?
            </h2>

            <p>
              The remaining hidden words
              have been revealed. Revive
              once and get 25 more seconds.
            </p>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                handleRevive
              }
            >
              REVIVE
            </button>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={
                handleNoThanks
              }
            >
              NO THANKS
            </button>

          </div>

        </div>
      )}

      {/* ================= GAME OVER ================= */}

      {gameOver &&
        !showRevive &&
        !levelComplete &&
        !finalComplete && (
          <div
            className={
              styles.modalOverlay
            }
          >

            <div
              className={
                styles.resultModal
              }
            >

              <div
                className={
                  styles.failIcon
                }
              >
                !
              </div>

              <span
                className={
                  styles.modalBadge
                }
              >
                TIME'S UP
              </span>

              <h2>
                Time's Up!
              </h2>

              <p>
                You found{" "}
                <strong>
                  {foundWords.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {currentWords.length}
                </strong>{" "}
                hidden words.
              </p>

              {missedWords.length >
                0 && (
                <div
                  className={
                    styles.missedWordsBox
                  }
                >

                  <div
                    className={
                      styles.missedHeader
                    }
                  >
                    <span>
                      WORDS YOU MISSED
                    </span>

                    <strong>
                      {missedWords.length}
                    </strong>
                  </div>

                  <div
                    className={
                      styles.missedWordsList
                    }
                  >
                    {missedWords.map(
                      (word) => (
                        <span
                          key={word}
                          className={
                            styles.missedWord
                          }
                        >
                          {word}
                        </span>
                      )
                    )}
                  </div>

                </div>
              )}

              <div
                className={
                  styles.resultStats
                }
              >

                <div>
                  <small>
                    SCORE
                  </small>

                  <strong>
                    {score}
                  </strong>
                </div>

                <div>
                  <small>
                    BANKED COINS
                  </small>

                  <strong>
                    🪙 {earnedCoins}
                  </strong>
                </div>

              </div>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={
                  finishGame
                }
              >
                COLLECT & EXIT
              </button>

              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={
                  restartGame
                }
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