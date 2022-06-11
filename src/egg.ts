import { BehaviorSubject, concat, map, Observable, withLatestFrom } from "rxjs";
import { CoordsString, GameState, GameStateLamda } from "./constants";
import { coordsToKey, getCoordsFromKey, isOccupied } from "./utils";

export const eggs = (
  sState: BehaviorSubject<GameState>,
  sTime: Observable<number>
) => {
  const sAddEgg = sTime.pipe(
    withLatestFrom(sState),
    map(([_, state]) => {
      return Object.keys(state.zombies)
        .map((coordKey) => {
          return Math.random() < 0.8
            ? null
            : (state: GameState) => {
                const zombieCoords = coordKey as CoordsString;
                return {
                  ...state,
                  eggs: {
                    ...state.eggs,
                    [zombieCoords]: { hatchTime: 0 },
                  },
                };
              };
        })
        .filter(Boolean) as GameStateLamda[];
    })
  );

  const sUpdateEgg = sTime.pipe(
    withLatestFrom(sState),
    map(([_, state]): GameStateLamda[] => {
      return Object.keys(state.eggs).map((key) => {
        return (state) => {
          const coordKey = key as CoordsString;
          if (state.player.coords === coordKey) {
            delete state.eggs[coordKey];
            return state;
          }

          const { hatchTime } = state.eggs[coordKey];

          if (hatchTime == 3) {
            delete state.eggs[coordKey];
            return {
              ...state,
              zombies: {
                ...state.zombies,
                [coordKey]: true,
              },
            };
          }

          return {
            ...state,
            eggs: {
              ...state.eggs,
              [coordKey]: { hatchTime: hatchTime + 1 },
            },
          };
        };
      });
    })
  );

  const sChange = sAddEgg.pipe(
    withLatestFrom(sUpdateEgg),
    map(([changes1, changes2]) => {
      return [...changes1, ...changes2];
    })
  );

  return { sChange };
};
