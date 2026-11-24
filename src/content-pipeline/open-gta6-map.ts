/** Open GTA 6 Map (github.com/fbritoferreira/gta6, public/data). See research/data/ATTRIBUTION.md. */
import type { GameCoordinate } from '../shared/domain';
import type { KindRecord } from '../content/format';
import { round } from './gtadb';

export const OGM_SOURCE = 'open-gta6-map';

export interface OgmKind {
  readonly key: string;
  readonly name: string;
  readonly colour: string;
  readonly group: 'Collectibles' | 'Activities' | 'Crime' | 'Places' | 'Other';
}

export interface OgmCategories {
  readonly kinds: readonly OgmKind[];
}

export interface OgmLocation {
  readonly id: string;
  readonly kind: string;
  readonly x: number;
  readonly y: number;
  readonly name: string;
  readonly type: string;
  readonly description: string;
  /** In-game screenshot: Rockstar's copyright. Never imported. */
  readonly screenshot?: string;
  readonly area?: string;
  readonly region?: string;
  readonly confidence?: string;
  readonly real_life?: string;
}

const GROUP_TO_CATEGORY: Record<OgmKind['group'], KindRecord['category']> = {
  Collectibles: 'collectible',
  Activities: 'activity',
  Crime: 'crime',
  Places: 'place',
  Other: 'other',
};

export const ogmKindToRecord = (k: OgmKind): KindRecord => ({
  key: k.key,
  label: k.name,
  category: GROUP_TO_CATEGORY[k.group] ?? 'other',
  colour: k.colour,
});

/**
 * Upstream map units (zoom-0 Leaflet CRS.Simple, 1024 wide) to in-game metres:
 * x = (gx + 16384) / 32 and y = (16384 - gy) / 32, so gx = 32x - 16384 and gy = 16384 - 32y.
 */
export const ogmToGame = (x: number, y: number): GameCoordinate => ({
  x: round(x * 32 - 16384),
  y: round(16384 - y * 32),
});
