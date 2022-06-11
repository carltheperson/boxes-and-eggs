import { BehaviorSubject } from "rxjs";
import { map, withLatestFrom, tap } from "rxjs/operators";
import { GameStateLamda, initialGameBoard } from "./constants";
import { eggs } from "./egg";
import { player } from "./player";
import { createBoard, renderGameBoard } from "./rendering";
import { zombies } from "./zombie";

createBoard();

const sState = new BehaviorSubject(initialGameBoard);

const { sTime, sGameOver, sChange: sPlayerChange } = player(sState);
const { sChange: sZombiesChange } = zombies(sState, sTime);
const { sAdd: sChangeEggAdd, sUpdate: sChangeEggUpdate } = eggs(sState, sTime);

sPlayerChange
  .pipe(
    withLatestFrom(
      sState,
      sZombiesChange,
      sChangeEggAdd,
      sChangeEggUpdate,
      sGameOver
    ),
    map(([playerL, state, zombieLs, eggAddLs, eggUpdateLs, gameOverL]) => {
      const allLamdas: GameStateLamda[] = [
        playerL,
        ...zombieLs,
        ...eggAddLs,
        ...eggUpdateLs,
        gameOverL,
      ];
      return allLamdas.reduce((state, lamda) => {
        return lamda(state);
      }, state);
    }),
    tap((state) => {
      if (state.gameOver) {
        setTimeout(() => {
          alert("Game over");
        }, 10);
      }
    })
  )
  .subscribe((state) => sState.next(state));

sState.subscribe((state) => renderGameBoard(state));
