import {
  CoordsString,
  GameState,
  GAME_BOARD_HEIGHT,
  GAME_BOARD_WIDTH,
} from "./constants";
import { coordsToKey } from "./utils";

// Ah beautiful stateful code

const divs: Record<CoordsString, HTMLDivElement> = {};

const blankCells = () =>
  Array.from({ length: GAME_BOARD_HEIGHT }).map(() =>
    Array.from({ length: GAME_BOARD_WIDTH }).map(() => "")
  );

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
  document.body.replaceChildren(outerDiv);
};

const clearBoard = () => {
  Object.entries(divs).forEach(([, div]) => {
    div.className = "cell";
  });
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

  for (let i = 0; i < GAME_BOARD_HEIGHT; i++) {
    for (let j = 0; j < GAME_BOARD_WIDTH; j++) {
      const zombie = state.zombies[coordsToKey({ x: j, y: i })];
      const egg = state.eggs[coordsToKey({ x: j, y: i })];
      if (zombie && egg) {
        chars[coordsToKey({ x: j, y: i })] = ["both"];
      }
    }
  }

  clearBoard();
  Object.entries(chars).forEach(([coords, char]) => {
    const div = divs[coords as CoordsString];
    char.forEach((class_) => {
      div.classList.add(class_);
    });
  });

  console.log(
    "Zombies",
    Object.keys(state.zombies).length,
    "eggs",
    Object.keys(state.eggs).length
  );

  // const cells = blankCells();
  // cells[player.y][player.x] = "player";
  // zombies.forEach(({ x, y }) => {
  //   cells[x][y] = "zombie";
  // });

  // if (savedCellDivs) {
  //   savedCellDivs.forEach((row, y) =>
  //     row.forEach((cell, x) => (cell.className = "cell " + cells[y][x] || ""))
  //   );
  //   return;
  // }
  // savedCellDivs = blankCells() as unknown as HTMLDivElement[][];
  // const outerDiv = document.createElement("div");
  // outerDiv.classList.add("outer");
  // const rows = cells.map((row, y) => {
  //   const rowDiv = document.createElement("div");
  //   rowDiv.classList.add("row");
  //   const cellDivs = row.map((val, x) => {
  //     const cell = document.createElement("div");
  //     cell.classList.add("cell");
  //     if (val) {
  //       cell.classList.add(val);
  //     }
  //     savedCellDivs[y][x] = cell;
  //     return cell;
  //   });
  //   rowDiv.append(...cellDivs);
  //   return rowDiv;
  // });
  // outerDiv.append(...rows);
  // document.body.replaceChildren(outerDiv);
};
