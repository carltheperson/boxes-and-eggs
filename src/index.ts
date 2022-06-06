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
  Observable,
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
  delay,
  combineLatestWith,
  mergeWith,
  throttleTime,
  withLatestFrom,
  debounce,
  filter,
} from "rxjs/operators";
import { renderGameBoard } from "./rendering";

export const GAME_BOARD_WIDTH = 15;
export const GAME_BOARD_HEIGHT = 10;

export type GameState = {
  player: { x: number; y: number };
  zombies: { x: number; y: number }[];
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
  zombies: [
    {
      x: 2,
      y: 2,
    },
  ],
};

const outOfBounds = (x: number, y: number) => {
  return !(x >= 0 && y >= 0 && x < GAME_BOARD_WIDTH && y < GAME_BOARD_HEIGHT);
};

const moves = {
  ArrowUp: { y: -1 },
  ArrowDown: { y: 1 },
  ArrowLeft: { x: -1 },
  ArrowRight: { x: 1 },
} as const;

type Coords = { x: number; y: number };
type PCoords = Partial<Coords>;

const sKeydown = fromEvent<KeyboardEvent>(document, "keydown");
const sPlayerMovements: Observable<PCoords> = sKeydown.pipe(
  map(({ key }) => moves[key]),
  filter((res) => Boolean(res)),
  startWith({ x: 0, y: 0 })
);

const sPlayerCoords = sPlayerMovements.pipe(
  scan<PCoords, Coords>(({ x, y }, { x: xDiff, y: yDiff }) => {
    const newX = x + (xDiff || 0);
    const newY = y + (yDiff || 0);
    return outOfBounds(newX, newY) ? { x, y } : { x: newX, y: newY };
  }, initialGameBoard.player)
);

const zombieCoords = sPlayerCoords.pipe(
  scan(({ x, y }, { x: pX, y: pY }) => {
    const coords = {
      x: x + (Math.random() > 0.25 ? 1 : -1),
      y: y + (Math.random() > 0.25 ? 1 : -1),
    };
    return outOfBounds(coords.x, coords.y) ? { x, y } : coords;
  }, initialGameBoard.zombies[0])
);

// zombie coords combines with player coords

const sGameBoard = sPlayerCoords.pipe(
  withLatestFrom(zombieCoords),
  map(([player, zombie]) => {
    return {
      player,
      zombies: [zombie],
    };
  })
);

sGameBoard.subscribe(renderGameBoard);
// sGameBoard.subscribe(renderGameBoard);
