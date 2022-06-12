import {
  BehaviorSubject,
  concatMap,
  EMPTY,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  scan,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs";
import { GameState, GameStateLamda } from "./constants";
import { sTryAgain } from "./rendering";
import {
  applyMovement,
  coordsToKey,
  getCoordsFromKey,
  isOccupied,
  isSurrondedByBoxes,
  outOfBounds,
} from "./utils";

const moves = {
  ArrowUp: { y: -1 },
  ArrowDown: { y: 1 },
  ArrowLeft: { x: -1 },
  ArrowRight: { x: 1 },
} as const;

type Coords = { x: number; y: number };
type PCoords = Partial<Coords>;

export const player = (sState: BehaviorSubject<GameState>) => {
  const sKeydown = fromEvent<KeyboardEvent>(document, "keydown");
  const sPlayerMovements: Observable<PCoords> = sKeydown.pipe(
    map(({ key }) => moves[key as keyof typeof moves]),
    filter((res) => Boolean(res))
  );

  const sTime = sTryAgain
    .pipe(startWith(EMPTY))
    .pipe(
      switchMap(() =>
        sPlayerMovements.pipe(scan((lastTime) => lastTime + 1, 0))
      )
    );

  const sChange = sTime.pipe(
    withLatestFrom(sState, sPlayerMovements),
    map(([, , movement]): GameStateLamda => {
      return (state) => {
        const coords = getCoordsFromKey(state.player.coords);
        const { x: newX, y: newY } = applyMovement(coords, movement);
        const player =
          outOfBounds(newX, newY) ||
          state.boxes[coordsToKey({ x: newX, y: newY })]
            ? coords
            : { x: newX, y: newY };
        return {
          ...state,
          player: { coords: coordsToKey(player) },
        };
      };
    })
  );

  const sGameOver = sTime.pipe(
    withLatestFrom(sState),
    map((): GameStateLamda => {
      return (state) => {
        const coords = getCoordsFromKey(state.player.coords);
        if (isSurrondedByBoxes(state, coords)) {
          return {
            ...state,
            gameOver: true,
          };
        }
        return state;
      };
    })
  );

  return { sTime, sChange, sGameOver };
};
