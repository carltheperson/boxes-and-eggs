// RxJS v6+
import {
  BehaviorSubject,
  EMPTY,
  from,
  fromEvent,
  generate,
  interval,
  merge,
  noop,
  of,
} from "rxjs";
import {
  map,
  pluck,
  scan,
  sequenceEqual,
  switchMap,
  take,
  tap,
  startWith,
  combineLatestWith,
  throttleTime,
  debounce,
  filter,
} from "rxjs/operators";

const GAME_BOARD_WIDTH = 10;
const GAME_BOARD_HEIGHT = 10;

type GameState = {
  player: { x: number; y: number };
};

const blankCells = () =>
  Array.from({ length: GAME_BOARD_WIDTH }).map(() =>
    Array.from({ length: GAME_BOARD_HEIGHT }).map(() => "")
  );

const gameBoard: GameState = {
  player: {
    x: 5,
    y: 5,
  },
};

const renderGameBoard = ({ player }: GameState) => {
  const cells = blankCells();
  cells[player.y][player.x] = "player";
  const outerDiv = document.createElement("div");
  outerDiv.classList.add("outer");
  const rows = cells.map((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    const cellDivs = row.map((val) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (val) {
        cell.classList.add(val);
      }
      return cell;
    });
    rowDiv.append(...cellDivs);
    return rowDiv;
  });
  outerDiv.append(...rows);
  document.body.replaceChildren(outerDiv);
};

const moves = {
  ArrowUp: { y: -1 },
  ArrowDown: { y: 1 },
  ArrowLeft: { x: -1 },
  ArrowRight: { x: 1 },
} as const;

const sKeydown = fromEvent<KeyboardEvent>(document, "keydown");
const sPlayerMove = sKeydown.pipe(
  map(({ key }) => moves[key] as { x?: number; y?: number }),
  filter((res) => Boolean(res)),
  startWith({ x: 0, y: 0 })
);
const sGameBoard = of(gameBoard).pipe(
  combineLatestWith(sPlayerMove),
  map(([board, moves]) => {
    console.log(moves);
    board.player.x += moves.x || 0;
    board.player.y += moves.y || 0;
    return board;
  })
);

sGameBoard.subscribe(renderGameBoard);
