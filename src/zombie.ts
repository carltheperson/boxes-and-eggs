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
    map(([_, state]): GameStateLamda[] => {
      return Object.keys(state.zombies).map((key) => {
        return (state) => {
          const coordKey = key as CoordsString;
          const coords = getCoordsFromKey(coordKey);
          const newCoords = moveRandom(coords);

          if (
            outOfBounds(newCoords.x, newCoords.y) ||
            isOccupied(state, newCoords)
          ) {
            return state;
          }

          const newZombiesMap: GameState["zombies"] = {
            ...state.zombies,
            [coordsToKey(newCoords)]: true,
          };
          delete newZombiesMap[coordKey];

          return { ...state, zombies: newZombiesMap };
        };
      });
    })
  );

  return { sChange };
};
