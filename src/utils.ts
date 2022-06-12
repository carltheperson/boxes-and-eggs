import {
  CoordsString,
  GameState,
  GAME_BOARD_HEIGHT,
  GAME_BOARD_WIDTH,
  moves,
} from "./constants";

export const outOfBounds = (x: number, y: number) => {
  return !(x >= 0 && y >= 0 && x < GAME_BOARD_WIDTH && y < GAME_BOARD_HEIGHT);
};

export const isOccupied = (
  state: GameState,
  coords: {
    x: number;
    y: number;
  }
) => {
  const key = coordsToKey(coords);
  if (state.player.coords === key || state.eggs[key] || state.boxes[key]) {
    return true;
  }
  return false;
};

export const isSurrondedByBoxes = (
  state: GameState,
  coords: {
    x: number;
    y: number;
  }
) => {
  const diffs = Object.entries(moves).map(([, diff]) => diff);
  return diffs.every((diff) => {
    const newCoords = applyMovement(coords, diff);
    const coordsKey = coordsToKey(newCoords);
    return state.boxes[coordsKey] || outOfBounds(newCoords.x, newCoords.y);
  });
};

export const applyMovement = (
  coords: {
    x: number;
    y: number;
  },
  diff: {
    x?: number | undefined;
    y?: number | undefined;
  }
) => {
  const newX = coords.x + (diff.x || 0);
  const newY = coords.y + (diff.y || 0);
  return { x: newX, y: newY };
};

export const getCoordsFromKey = (coords: CoordsString) => {
  const [x, y] = coords.split("-");
  return { x: parseInt(x), y: parseInt(y) };
};

export const coordsToKey = ({
  x,
  y,
}: {
  x: number;
  y: number;
}): CoordsString => {
  return `${x}-${y}`;
};

export const moveRandom = (coords: { x: number; y: number }) => {
  const moveAxies = Math.random() > 0.5 ? "x" : "y";
  const diff = Math.random() > 0.5 ? 1 : -1;
  return {
    ...coords,
    [moveAxies]: coords[moveAxies] + diff,
  };
};
