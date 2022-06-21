import { BehaviorSubject, merge } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { GameStateLamda, initialGameBoard } from "./constants";
import { eggs } from "./egg";
import { player } from "./player";
import { createBoard, renderGameBoard, sTryAgain } from "./rendering";
import { boxes } from "./boxes";

const sState = new BehaviorSubject(initialGameBoard);

const { sTime, sGameOver, sChange: sPlayerChange } = player(sState);
const { sChange: sBoxessChange } = boxes(sState, sTime);
const { sAdd: sChangeEggAdd, sUpdate: sChangeEggUpdate } = eggs(sState, sTime);

merge(
  sPlayerChange.pipe(
    withLatestFrom(
      sTime,
      sState,
      sBoxessChange,
      sChangeEggAdd,
      sChangeEggUpdate,
      sGameOver
    ),
    map(([playerL, time, state, boxLs, eggAddLs, eggUpdateLs, gameOverL]) => {
      if (state.gameOver) {
        return state;
      }
      const allLamdas: GameStateLamda[] = [
        playerL,
        ...boxLs,
        ...eggAddLs,
        ...eggUpdateLs,
        gameOverL,
      ];
      return {
        ...allLamdas.reduce((state, lamda) => {
          return lamda(state);
        }, state),
        score: time,
      };
    })
  ),
  sTryAgain.pipe(map(() => initialGameBoard))
).subscribe((state) => sState.next(state));

sState.subscribe((state) => renderGameBoard(state));
