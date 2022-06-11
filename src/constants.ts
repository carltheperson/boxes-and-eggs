export const GAME_BOARD_WIDTH = 15;
export const GAME_BOARD_HEIGHT = 10;

export type CoordsString = `${number}-${number}`;

export type GameState = {
  player: { coords: CoordsString };
  zombies: Record<CoordsString, true>;
  eggs: Record<CoordsString, { hatchTime: number }>;
  gameOver: boolean;
};

export type GameStateLamda = (currentState: GameState) => GameState;

export const initialGameBoard: GameState = {
  player: { coords: "4-4" },
  zombies: {
    "2-2": true,
  },
  eggs: {},
  gameOver: false,
};
