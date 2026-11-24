/**
 * Pure maths for the mobile map: fitting the world into the view, and turning a screen tap back into
 * in-game metres. Kept free of React Native so it is unit-tested.
 *
 * The SVG draws the world with x to the right and -y down (north up). The view is then transformed with
 * translate(tx, ty) and scale(s) around its centre, as React Native transforms do.
 */
import type { Bounds, GameCoordinate } from '../../../shared/domain';

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Fit {
  /** Pixels per metre at zoom 1. */
  readonly base: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

export interface Transform {
  readonly scale: number;
  readonly tx: number;
  readonly ty: number;
}

/** Same as SVG preserveAspectRatio="xMidYMid meet". */
export const fitWorld = (world: Bounds, view: Size): Fit => {
  const w = world.maxX - world.minX;
  const h = world.maxY - world.minY;
  const base = Math.min(view.width / w, view.height / h);
  return { base, offsetX: (view.width - w * base) / 2, offsetY: (view.height - h * base) / 2 };
};

export const screenToWorld = (
  point: { readonly x: number; readonly y: number },
  t: Transform,
  world: Bounds,
  view: Size,
): GameCoordinate => {
  const fit = fitWorld(world, view);
  const cx = view.width / 2;
  const cy = view.height / 2;
  const qx = cx + (point.x - t.tx - cx) / t.scale;
  const qy = cy + (point.y - t.ty - cy) / t.scale;
  return { x: world.minX + (qx - fit.offsetX) / fit.base, y: world.maxY - (qy - fit.offsetY) / fit.base };
};

/** New translation that keeps the pinch focal point under the fingers. */
export const zoomAround = (
  start: Transform,
  focalStart: { x: number; y: number },
  focalNow: { x: number; y: number },
  scale: number,
  view: Size,
): Transform => {
  'worklet';
  const cx = view.width / 2;
  const cy = view.height / 2;
  const dx = (focalStart.x - cx - start.tx) / start.scale;
  const dy = (focalStart.y - cy - start.ty) / start.scale;
  return { scale, tx: focalNow.x - cx - dx * scale, ty: focalNow.y - cy - dy * scale };
};

export const nearest = <T extends { readonly x: number; readonly y: number }>(
  items: readonly T[],
  at: GameCoordinate,
  maxDistance: number,
): T | undefined => {
  let best: T | undefined;
  let bestD = maxDistance;
  for (const item of items) {
    const d = Math.hypot(item.x - at.x, item.y - at.y);
    if (d <= bestD) {
      best = item;
      bestD = d;
    }
  }
  return best;
};
