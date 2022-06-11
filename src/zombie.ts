import { BehaviorSubject, map, Observable, withLatestFrom } from "rxjs";
import { CoordsString, GameState, GameStateLamda } from "./constants";
import {
  coordsToKey,
  getCoordsFromKey,
  isOccupied,
  moveRandom,
  outOfBounds,
} from "./utils";

export const zombies = (
  sState: BehaviorSubject<GameState>,
  sTime: Observable<number>
) => {
  const sChange = sTime.pipe(
    withLatestFrom(sState),
    map(([, state]): GameStateLamda[] => {
      return Object.keys(state.zombies).map((key) => {
        return (state) => {
          const coordKey = key as CoordsString;
          const coords = getCoordsFromKey(coordKey);
          let newCoords = moveRandom(coords);
          let attemps = 0;
          while (
            outOfBounds(newCoords.x, newCoords.y) ||
            isOccupied(state, newCoords)
          ) {
            newCoords = moveRandom(coords);
            attemps += 1;
            if (attemps > 4) {
              return {
                ...state,
                zombies: {
                  ...state.zombies,
                  [coordKey]: { lastCoords: coordKey },
                },
              };
            }
          }

          const newZombiesMap: GameState["zombies"] = {
            ...state.zombies,
            [coordsToKey(newCoords)]: { lastCoords: coordKey },
          };
          delete newZombiesMap[coordKey];

          return { ...state, zombies: newZombiesMap };
        };
      });
    })
  );

  return { sChange };
};
