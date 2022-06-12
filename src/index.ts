import { BehaviorSubject, fromEvent, merge } from "rxjs";
import { map, withLatestFrom, tap } from "rxjs/operators";
import { GameStateLamda, initialGameBoard } from "./constants";
import { eggs } from "./egg";
import { player } from "./player";
import { createBoard, renderGameBoard, sTryAgain } from "./rendering";
import { zombies } from "./zombie";

createBoard();

const sState = new BehaviorSubject(initialGameBoard);

const { sTime, sGameOver, sChange: sPlayerChange } = player(sState);
const { sChange: sZombiesChange } = zombies(sState, sTime);
const { sAdd: sChangeEggAdd, sUpdate: sChangeEggUpdate } = eggs(sState, sTime);

merge(
  sPlayerChange.pipe(
    withLatestFrom(
      sTime,
      sState,
      sZombiesChange,
      sChangeEggAdd,
      sChangeEggUpdate,
      sGameOver
    ),
    map(
      ([playerL, time, state, zombieLs, eggAddLs, eggUpdateLs, gameOverL]) => {
        if (state.gameOver) {
          return state;
        }
        const allLamdas: GameStateLamda[] = [
          playerL,
          ...zombieLs,
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
      }
    )
  ),
  sTryAgain.pipe(map(() => initialGameBoard))
).subscribe((state) => sState.next(state));

sState.subscribe((state) => renderGameBoard(state));
