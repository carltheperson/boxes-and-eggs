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

// Ah beautiful stateful code

const divs: Record<CoordsString, HTMLDivElement> = {};
let outerDiv: HTMLDivElement | null = null;

export const createBoard = () => {
  outerDiv = document.createElement("div");
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

const gameOverButton = document.createElement("button");
gameOverButton.innerText = "Game Over. Try again?";
gameOverButton.style.display = "none";
document.querySelector(".score-container")?.before(gameOverButton);
export const sTryAgain = fromEvent(gameOverButton, "click");

export const renderGameBoard = (state: GameState) => {
  const chars = {
    [state.player.coords]: ["player"],
    ...Object.keys(state.boxes).reduce((map, key) => {
      return {
        ...map,
        [key]: ["box"],
      };
    }, {}),
    ...Object.keys(state.eggs).reduce((map, key) => {
      return {
        ...map,
        [key]: [
          "egg",
          HATCH_TIME - state.eggs[key as CoordsString].hatchTime + 1,
        ],
      };
    }, {}),
  } as Record<string, [string, string]>;

  clearBoard();
  Object.entries(chars).forEach(([coords, char]) => {
    const div = divs[coords as CoordsString];
    div.classList.add(char[0]);
    if (char.length > 1) {
      div.dataset.meta = char[1];
    }
  });

  if (state.gameOver) {
    gameOverButton.style.display = "block";
    document.body.classList.add("game-over");
  } else {
    document.body.classList.remove("game-over");
    gameOverButton.style.display = "none";
  }

  updateScore(state.score);
  updateHighScore(state.score);
};
