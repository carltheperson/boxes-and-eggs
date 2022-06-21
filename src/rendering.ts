import { fromEvent } from "rxjs";
import {
  CoordsString,
  GameState,
  GAME_BOARD_HEIGHT,
  GAME_BOARD_WIDTH,
  HATCH_TIME,
  moves,
} from "./constants";
import { coordsToKey } from "./utils";

// I know this code sucks but don't hate it's IO

export const createBoard = (...outerClass: string[]) => {
  const divs: Record<CoordsString, HTMLDivElement> = {};
  const outerDiv = document.createElement("div");
  outerDiv.classList.add(...outerClass);
  for (let i = 0; i < GAME_BOARD_HEIGHT; i++) {
    const rowDiv = document.createElement("div");
    outerDiv.append(rowDiv);
    rowDiv.classList.add("row");
    for (let j = 0; j < GAME_BOARD_WIDTH; j++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      divs[coordsToKey({ x: j, y: i })] = cellDiv;
      rowDiv.append(cellDiv);
    }
  }
  document.querySelector(".board-container")!.append(outerDiv);
  return divs;
};

const divs = createBoard("outer", "main");
const backgroundDivs = createBoard("outer", "background");

// Prevent arrow keys moving page donw
document.addEventListener("keydown", (e) => {
  if (Object.keys(moves).includes(e.key)) {
    e.preventDefault();
  }
});

const clearBoard = (divs: Record<`${number}-${number}`, HTMLDivElement>) => {
  Object.entries(divs).forEach(([, div]) => {
    div.className = "cell";
  });
};

const applyChars = (
  chars: Record<
    string,
    {
      classes: string[];
      meta?: string | undefined;
    }
  >,
  divs: Record<`${number}-${number}`, HTMLDivElement>
) => {
  Object.entries(chars).forEach(([key, { classes, meta }]) => {
    const div = divs[key as CoordsString];
    div.classList.add(...classes);
    if (meta) {
      div.dataset.meta = meta;
    }
  });
};

const highScoreEl = document.querySelector<HTMLHeadingElement>(".high-score")!;
const scoreEl = document.querySelector<HTMLHeadingElement>(".score")!;

let highScore = parseInt(localStorage["high-score"]) || 0;
highScoreEl.innerText = "High score: " + highScore;

const updateHighScore = (score: number) => {
  if (score > highScore) {
    highScoreEl.innerText = "High score: " + score;
    localStorage["high-score"] = score;
    highScore = score;
  }
};
const updateScore = (score: number) => {
  scoreEl.innerText = "Score: " + score;
};

const gameOverButton = document.createElement("button");
gameOverButton.innerText = "Game Over. Try again?";
gameOverButton.style.display = "none";
document.querySelector(".score-container")?.before(gameOverButton);
export const sTryAgain = fromEvent(gameOverButton, "click");

export const renderGameBoard = (state: GameState) => {
  console.log(JSON.stringify(state));
  const chars = {
    [state.player.coords]: {
      classes: [
        "player",
        ...(state.player.lastCoords
          ? [coordsToDirection(state.player.coords, state.player.lastCoords)]
          : []),
      ],
    },
    ...Object.entries(state.boxes).reduce(
      (map, [key, { lastCoords, newHatchling }]) => {
        return {
          ...map,
          [key]: {
            classes: [
              "box",
              ...(lastCoords ? [coordsToDirection(key, lastCoords)] : []),
              ...(newHatchling ? ["new-hatchling"] : []),
            ],
          },
        };
      },
      {}
    ),
  } as Record<string, { classes: string[]; meta?: string }>;

  const backgroundChars = {
    ...Object.keys(state.eggs).reduce((map, key) => {
      return {
        ...map,
        [key]: {
          classes: ["egg"],
          meta: HATCH_TIME - state.eggs[key as CoordsString].hatchTime + 1,
        },
      };
    }, {}),
    ...Object.keys(state.boxes).reduce((map, key) => {
      if (state.boxes[key as CoordsString].newHatchling) {
        return {
          ...map,
          [key]: { classes: ["hide"] },
        };
      }
      return map;
    }, {}),
  };

  clearAnimations(divs);
  setTimeout(() => {
    clearBoard(divs);
    clearBoard(backgroundDivs);
    applyChars(backgroundChars, backgroundDivs);
    applyChars(chars, divs);
    if (state.gameOver) {
      gameOverButton.style.display = "block";
      document.body.classList.add("game-over");
    } else {
      document.body.classList.remove("game-over");
      gameOverButton.style.display = "none";
    }

    updateScore(state.score);
    updateHighScore(state.score);
  }, 5);
};

function coordsToDirection(current: string, past: string) {
  const [currentX, currentY] = current.split("-").map((v) => parseInt(v));
  const [pastX, pastY] = past.split("-").map((v) => parseInt(v));
  console.log(
    currentX !== pastX ? (currentX > pastX ? "right" : "left") : null,
    currentY !== pastY ? (currentY > pastY ? "down" : "up") : null,
    current,
    past
  );
  const values = [
    currentX !== pastX ? (currentX > pastX ? "right" : "left") : null,
    currentY !== pastY ? (currentY > pastY ? "down" : "up") : null,
  ];
  if (currentX !== pastX) {
    return currentX > pastX ? "right" : "left";
  }
  if (currentY !== pastY) {
    return currentY > pastY ? "down" : "up";
  }
  return "thing";
}

function clearAnimations(divs: Record<`${number}-${number}`, HTMLDivElement>) {
  Object.entries(divs).forEach(([, div]) => {
    div.classList.remove("up");
    div.classList.remove("down");
    div.classList.remove("left");
    div.classList.remove("right");
  });
}
