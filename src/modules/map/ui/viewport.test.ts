import { describe, expect, it } from 'vitest';
import { fitWorld, nearest, screenToWorld, zoomAround } from './viewport';

const world = { minX: 0, minY: 0, maxX: 1000, maxY: 2000 };
const view = { width: 500, height: 500 };

describe('mobile map viewport', () => {
  it('fits the world like SVG meet', () => {
    expect(fitWorld(world, view)).toEqual({ base: 0.25, offsetX: 125, offsetY: 0 });
  });

  it('maps the screen back to world coordinates, north up', () => {
    const id = { scale: 1, tx: 0, ty: 0 };
    expect(screenToWorld({ x: 125, y: 0 }, id, world, view)).toEqual({ x: 0, y: 2000 });
    expect(screenToWorld({ x: 250, y: 250 }, id, world, view)).toEqual({ x: 500, y: 1000 });
    // Zoomed 2x around the centre, the centre stays put.
    expect(screenToWorld({ x: 250, y: 250 }, { scale: 2, tx: 0, ty: 0 }, world, view)).toEqual({
      x: 500,
      y: 1000,
    });
  });

  it('keeps the focal point fixed while zooming', () => {
    const start = { scale: 1, tx: 0, ty: 0 };
    const focal = { x: 100, y: 100 };
    const before = screenToWorld(focal, start, world, view);
    const after = screenToWorld(focal, zoomAround(start, focal, focal, 3, view), world, view);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('finds the nearest pin within reach', () => {
    const pins = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 10, y: 0 },
    ];
    expect(nearest(pins, { x: 8, y: 0 }, 5)?.id).toBe('b');
    expect(nearest(pins, { x: 50, y: 0 }, 5)).toBeUndefined();
  });
});
