import { CoordsString, GameState } from "./constants";

let savedCellDivs: HTMLDivElement[][] | null = null;

// Ah beautiful stateful code

export const renderGameBoard = (state: GameState) => {
  const chars = {
    [state.player.coords]: "player",
    ...Object.keys(state.zombies).reduce((map, key) => {
      return {
        ...map,
        [key]: "zombie",
      };
    }, {}),
    ...Object.keys(state.eggs).reduce((map, key) => {
      return {
        ...map,
        [key]: "egg e-time-" + state.eggs[key as CoordsString].hatchTime,
      };
    }, {}),
  };
  console.log(chars);
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
