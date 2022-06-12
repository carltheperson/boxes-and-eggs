import { BehaviorSubject, map, Observable, withLatestFrom } from "rxjs";
import { CoordsString, GameState, GameStateLamda } from "./constants";
import {
  coordsToKey,
  getCoordsFromKey,
  isOccupied,
  moveRandom,
  outOfBounds,
} from "./utils";

export const boxes = (
  sState: BehaviorSubject<GameState>,
  sTime: Observable<number>
) => {
  const sChange = sTime.pipe(
    withLatestFrom(sState),
    map(([, state]): GameStateLamda[] => {
      return Object.keys(state.boxes).map((key) => {
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
                boxes: {
                  ...state.boxes,
                  [coordKey]: { lastCoords: coordKey },
                },
              };
            }
          }

          const newBoxesMap: GameState["boxes"] = {
            ...state.boxes,
            [coordsToKey(newCoords)]: { lastCoords: coordKey },
          };
          delete newBoxesMap[coordKey];

          return { ...state, boxes: newBoxesMap };
        };
      });
    })
  );

  return { sChange };
};
