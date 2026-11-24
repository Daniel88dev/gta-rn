import { describe, expect, it } from 'vitest';
import { boundsOf, centroid, isAtLeast, isVisibleAt, slugify } from '.';

describe('shared kernel', () => {
  it('computes bounds and centroid', () => {
    const pts = [
      { x: -1, y: 2 },
      { x: 3, y: -4 },
    ];
    expect(boundsOf(pts)).toEqual({ minX: -1, minY: -4, maxX: 3, maxY: 2 });
    expect(boundsOf([])).toBeNull();
    expect(centroid(pts)).toEqual({ x: 1, y: -1 });
  });

  it('orders confidence and spoiler levels', () => {
    expect(isAtLeast('official', 'community')).toBe(true);
    expect(isAtLeast('unconfirmed', 'community')).toBe(false);
    expect(isVisibleAt('minor', 'major')).toBe(true);
    expect(isVisibleAt('major', 'none')).toBe(false);
  });

  it('slugifies names', () => {
    expect(slugify('Vice City')).toBe('vice-city');
    expect(slugify("Pay'n'Spray Café")).toBe('paynspray-cafe');
  });
});
