import { slugify, type GameCoordinate } from '../shared/domain';

/** Upstream spellings that are typos or variants of the same region. */
const REGION_ALIASES: Record<string, string> = {
  'vice city': 'Vice City',
  'stafish island': 'Starfish Island',
  'port gellhorn international raceway': 'Gellhorn International Raceway',
};

export const normaliseRegionName = (name: string | null | undefined): string | undefined => {
  const trimmed = name?.trim();
  if (!trimmed || trimmed === '?') return undefined;
  return REGION_ALIASES[trimmed.toLowerCase()] ?? trimmed;
};

export const regionId = (name: string): string => slugify(name);
export const districtId = (region: string, district: string): string =>
  `${regionId(region)}/${slugify(district)}`;

/**
 * Finds the region of the nearest point that has one, within maxDistance metres.
 * Uses a grid so ~5k lookups against ~4k points stay fast.
 */
export class RegionLocator {
  private readonly cells = new Map<string, { readonly at: GameCoordinate; readonly region: string }[]>();
  private readonly cellSize: number;

  constructor(points: readonly { readonly at: GameCoordinate; readonly region: string }[], cellSize = 500) {
    this.cellSize = cellSize;
    for (const p of points) {
      const key = this.key(Math.floor(p.at.x / cellSize), Math.floor(p.at.y / cellSize));
      const list = this.cells.get(key) ?? [];
      list.push(p);
      this.cells.set(key, list);
    }
  }

  private key(cx: number, cy: number) {
    return `${cx}:${cy}`;
  }

  nearest(at: GameCoordinate, maxDistance: number): string | undefined {
    const cx = Math.floor(at.x / this.cellSize);
    const cy = Math.floor(at.y / this.cellSize);
    const reach = Math.ceil(maxDistance / this.cellSize);
    let best: { region: string; d: number } | undefined;
    for (let dx = -reach; dx <= reach; dx++) {
      for (let dy = -reach; dy <= reach; dy++) {
        for (const p of this.cells.get(this.key(cx + dx, cy + dy)) ?? []) {
          const d = Math.hypot(p.at.x - at.x, p.at.y - at.y);
          if (d <= maxDistance && (!best || d < best.d)) best = { region: p.region, d };
        }
      }
    }
    return best?.region;
  }
}
