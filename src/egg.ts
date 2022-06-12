import { BehaviorSubject, concat, map, Observable, withLatestFrom } from "rxjs";
import {
  CoordsString,
  GameState,
  GameStateLamda,
  HATCH_CHANCE,
  HATCH_TIME,
} from "./constants";
import { coordsToKey, getCoordsFromKey, isOccupied } from "./utils";

export const eggs = (
  sState: BehaviorSubject<GameState>,
  sTime: Observable<number>
) => {
  const sAdd = sTime.pipe(
    withLatestFrom(sState),
    map(([_, state]) => {
      return Object.keys(state.zombies)
        .map((_, i) => {
          return Math.random() < 1 - HATCH_CHANCE
            ? null
            : (state: GameState) => {
                const zombieCoords = Object.keys(state.zombies)[
                  i
                ] as CoordsString;
                const eggCoords = state.zombies[zombieCoords].lastCoords;

                if (
                  !eggCoords ||
                  state.zombies[eggCoords] ||
                  state.player.coords === eggCoords
                ) {
                  return state;
                }

                return {
                  ...state,
                  eggs: {
                    ...state.eggs,
                    [eggCoords]: { hatchTime: 0 },
                  },
                };
              };
        })
        .filter(Boolean) as GameStateLamda[];
    })
  );

  const sUpdate = sTime.pipe(
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

          if (hatchTime == HATCH_TIME) {
            delete state.eggs[coordKey];
            return {
              ...state,
              zombies: {
                ...state.zombies,
                [coordKey]: {},
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

  return { sAdd, sUpdate };
};
