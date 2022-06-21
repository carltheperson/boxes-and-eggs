import { BehaviorSubject, concat, map, Observable, withLatestFrom } from "rxjs";
import {
  CoordsString,
  GameState,
  GameStateLamda,
  HIGHET_HATCH_CHANCE,
  HATCH_TIME,
  BOX_AMOUNT_FOR_LOWEST_HATCH_DELTA,
  HATCH_CHANCE_DELTA,
} from "./constants";

export const eggs = (
  sState: BehaviorSubject<GameState>,
  sTime: Observable<number>
) => {
  const sAdd = sTime.pipe(
    withLatestFrom(sState),
    map(([_, state]) => {
      return Object.keys(state.boxes)
        .map((_, i) => {
          const boxesAmount = Object.keys(state.boxes).length;
          const max = BOX_AMOUNT_FOR_LOWEST_HATCH_DELTA;
          const boxesAmountCapped = boxesAmount > max ? max : boxesAmount;
          const chance =
            HIGHET_HATCH_CHANCE -
            (boxesAmountCapped / max) * HATCH_CHANCE_DELTA;
          return Math.random() < 1 - chance
            ? null
            : (state: GameState) => {
                const boxCoords = Object.keys(state.boxes)[i] as CoordsString;
                const eggCoords = state.boxes[boxCoords].lastCoords;

                if (
                  !eggCoords ||
                  state.boxes[eggCoords] ||
                  state.player.coords === eggCoords
                ) {
                  return state;
                }

                return {
                  ...state,
                  eggs: {
                    ...state.eggs,
                    [eggCoords]: { hatchTime: 1 },
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
          const { hatchTime, crushNextRound } = state.eggs[coordKey];

          if (crushNextRound) {
            delete state.eggs[coordKey];
            return state;
          }

          if (state.player.coords === coordKey) {
            return {
              ...state,
              eggs: {
                ...state.eggs,
                [coordKey]: { hatchTime, crushNextRound: true },
              },
            };
          }

          if (hatchTime == HATCH_TIME) {
            delete state.eggs[coordKey];
            return {
              ...state,
              boxes: {
                ...state.boxes,
                [coordKey]: { newHatchling: true },
              },
            };
          }

          return {
            ...state,
            eggs: {
              ...state.eggs,
              [coordKey]: { hatchTime: hatchTime + 1, crushNextRound: false },
            },
          };
        };
      });
    })
  );

  return { sAdd, sUpdate };
};
