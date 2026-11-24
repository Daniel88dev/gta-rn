/**
 * A position in the game world, in in-game metres.
 * x grows to the east, y grows to the north. This is the single source of truth for positions;
 * how a coordinate is projected onto a screen is a UI concern.
 */
export interface GameCoordinate {
  readonly x: number;
  readonly y: number;
}

export interface Bounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export const isFiniteCoordinate = (c: GameCoordinate): boolean =>
  Number.isFinite(c.x) && Number.isFinite(c.y);

export const distance = (a: GameCoordinate, b: GameCoordinate): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Smallest box around all coordinates, or null when there are none. */
export const boundsOf = (coords: Iterable<GameCoordinate>): Bounds | null => {
  let b: Bounds | null = null;
  for (const { x, y } of coords) {
    b = b
      ? {
          minX: Math.min(b.minX, x),
          minY: Math.min(b.minY, y),
          maxX: Math.max(b.maxX, x),
          maxY: Math.max(b.maxY, y),
        }
      : { minX: x, minY: y, maxX: x, maxY: y };
  }
  return b;
};

export const padBounds = (b: Bounds, ratio: number): Bounds => {
  const dx = (b.maxX - b.minX) * ratio;
  const dy = (b.maxY - b.minY) * ratio;
  return { minX: b.minX - dx, minY: b.minY - dy, maxX: b.maxX + dx, maxY: b.maxY + dy };
};

export const centroid = (coords: readonly GameCoordinate[]): GameCoordinate | null => {
  if (coords.length === 0) return null;
  const sum = coords.reduce((acc, c) => ({ x: acc.x + c.x, y: acc.y + c.y }), { x: 0, y: 0 });
  return { x: sum.x / coords.length, y: sum.y / coords.length };
};
