import {
  BehaviorSubject,
  filter,
  fromEvent,
  map,
  Observable,
  scan,
  startWith,
  tap,
  withLatestFrom,
} from "rxjs";
import { GameState, GameStateLamda } from "./constants";
import { coordsToKey, getCoordsFromKey, outOfBounds } from "./utils";

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
  const sTime = sPlayerMovements.pipe(scan((lastTime) => lastTime + 1, 0));
  const sChange = sTime.pipe(
    withLatestFrom(sState, sPlayerMovements),
    map(([_, state, movement]): GameStateLamda => {
      return (currentState) => {
        const { x, y } = getCoordsFromKey(state.player.coords);
        const { x: xDiff, y: yDiff } = movement;
        const newX = x + (xDiff || 0);
        const newY = y + (yDiff || 0);
        const player = outOfBounds(newX, newY)
          ? { x, y }
          : { x: newX, y: newY };

        return {
          ...currentState,
          player: { coords: coordsToKey(player) },
        };
      };
    })
  );

  return { sTime, sChange };
};
