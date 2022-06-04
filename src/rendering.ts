import { blankCells, GameState, GAME_BOARD_WIDTH } from ".";

let savedCellDivs: HTMLDivElement[][] | null = null;

// Ah beautiful stateful code

export const renderGameBoard = ({ player }: GameState) => {
  const cells = blankCells();
  cells[player.y][player.x] = "player";
  console.log("HEare");
  if (savedCellDivs) {
    savedCellDivs.forEach((row, y) =>
      row.forEach((cell, x) => (cell.className = "cell " + cells[y][x] || ""))
    );
    return;
  }
  savedCellDivs = blankCells() as unknown as HTMLDivElement[][];
  const outerDiv = document.createElement("div");
  outerDiv.classList.add("outer");
  const rows = cells.map((row, y) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    const cellDivs = row.map((val, x) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (val) {
        cell.classList.add(val);
      }
      savedCellDivs[y][x] = cell;
      return cell;
    });
    rowDiv.append(...cellDivs);
    return rowDiv;
  });
  outerDiv.append(...rows);
  document.body.replaceChildren(outerDiv);
};
