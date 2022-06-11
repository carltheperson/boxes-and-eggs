import {
  CoordsString,
  GameState,
  GAME_BOARD_HEIGHT,
  GAME_BOARD_WIDTH,
  moves,
} from "./constants";
import { coordsToKey } from "./utils";

// Ah beautiful stateful code

const divs: Record<CoordsString, HTMLDivElement> = {};

export const createBoard = () => {
  const outerDiv = document.createElement("div");
  outerDiv.classList.add("outer");
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
  document.querySelector(".container")!.append(outerDiv);
};

// Prevent arrow keys moving page donw
document.addEventListener("keydown", (e) => {
  if (Object.keys(moves).includes(e.key)) {
    e.preventDefault();
  }
});

const clearBoard = () => {
  Object.entries(divs).forEach(([, div]) => {
    div.className = "cell";
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

export const renderGameBoard = (state: GameState) => {
  const chars = {
    [state.player.coords]: ["player"],
    ...Object.keys(state.zombies).reduce((map, key) => {
      return {
        ...map,
        [key]: ["zombie"],
      };
    }, {}),
    ...Object.keys(state.eggs).reduce((map, key) => {
      return {
        ...map,
        [key]: ["egg", "e-time-" + state.eggs[key as CoordsString].hatchTime],
      };
    }, {}),
  } as Record<string, string[]>;

  clearBoard();
  Object.entries(chars).forEach(([coords, char]) => {
    const div = divs[coords as CoordsString];
    char.forEach((class_) => {
      div.classList.add(class_);
    });
  });

  if (state.gameOver) {
    (document.querySelector(".outer") as HTMLDivElement).style.backgroundColor =
      "red";
  }

  updateScore(state.score);
  updateHighScore(state.score);
};
