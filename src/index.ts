import { BehaviorSubject } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { GameStateLamda, initialGameBoard } from "./constants";
import { eggs } from "./egg";
import { player } from "./player";
import { renderGameBoard } from "./rendering";
import { zombies } from "./zombie";

const sState = new BehaviorSubject(initialGameBoard);

const { sTime, sChange: sPlayerChange } = player(sState);
const { sChange: sZombiesChange } = zombies(sState, sTime);
const { sChange: sEggChange } = eggs(sState, sTime);

sPlayerChange
  .pipe(
    withLatestFrom(sState, sZombiesChange, sEggChange),
    map(([playerL, state, zombieLs, eggLs]) => {
      const allLamdas: GameStateLamda[] = [playerL, ...eggLs, ...zombieLs];
      return allLamdas.reduce((state, lamda) => {
        return lamda(state);
      }, state);
    })
  )
  .subscribe((state) => sState.next(state));

sState.subscribe((state) => renderGameBoard(state));
