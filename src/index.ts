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
import { renderGameBoard } from "./rendering";

export const GAME_BOARD_WIDTH = 10;
export const GAME_BOARD_HEIGHT = 8;

export type GameState = {
  player: { x: number; y: number };
};

export const blankCells = () =>
  Array.from({ length: GAME_BOARD_HEIGHT }).map(() =>
    Array.from({ length: GAME_BOARD_WIDTH }).map(() => "")
  );

const initialGameBoard: GameState = {
  player: {
    x: 4,
    y: 4,
  },
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

const sGameBoard = sPlayerMove.pipe(
  scan((lastBoard, { x, y }) => {
    const newX = lastBoard.player.x + (x || 0);
    const newY = lastBoard.player.y + (y || 0);
    if (
      !(
        newX >= 0 &&
        newY >= 0 &&
        newX < GAME_BOARD_WIDTH &&
        newY < GAME_BOARD_HEIGHT
      )
    ) {
      return lastBoard;
    }

    return {
      ...lastBoard,
      player: {
        x: newX,
        y: newY,
      },
    };
  }, initialGameBoard)
);

sGameBoard.subscribe(renderGameBoard);
