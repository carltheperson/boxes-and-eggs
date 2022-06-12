export const GAME_BOARD_WIDTH = 12;
export const GAME_BOARD_HEIGHT = 12;
export const HATCH_TIME = 10;
export const HATCH_CHANCE = 0.1;

export const moves = {
  ArrowUp: { y: -1 },
  ArrowDown: { y: 1 },
  ArrowLeft: { x: -1 },
  ArrowRight: { x: 1 },
} as const;

export type CoordsString = `${number}-${number}`;

export type GameState = {
  player: { coords: CoordsString };
  zombies: Record<CoordsString, { lastCoords?: CoordsString }>;
  eggs: Record<CoordsString, { hatchTime: number }>;
  gameOver: boolean;
  score: number;
};

export type GameStateLamda = (currentState: GameState) => GameState;

export const initialGameBoard: GameState = {
  player: { coords: "3-3" },
  zombies: {
    "2-2": {},
    "4-4": {},
  },
  eggs: {},
  gameOver: false,
  score: 0,
};
