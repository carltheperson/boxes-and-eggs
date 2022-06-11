export const GAME_BOARD_WIDTH = 15;
export const GAME_BOARD_HEIGHT = 10;
export const HATCH_TIME = 7;
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
};

export type GameStateLamda = (currentState: GameState) => GameState;

export const initialGameBoard: GameState = {
  player: { coords: "4-4" },
  zombies: {
    "2-2": {},
  },
  eggs: {},
  gameOver: false,
};
