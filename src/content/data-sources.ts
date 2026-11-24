/**
 * Datasets the app ships content from, with the exact credit lines their licences require.
 * Source of truth for the credits screen. Keep in sync with research/data/ATTRIBUTION.md.
 */
import { asId } from '../shared/domain';
import type { DataSource } from '../modules/sources/domain/data-source';

export const GTADB = asId<'DataSource'>('gtadb');
export const OPEN_GTA6_MAP = asId<'DataSource'>('open-gta6-map');
export const AWESOME_GTA6 = asId<'DataSource'>('awesome-gta-6');

const CC_BY_4 = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };

export const DATA_SOURCES: readonly DataSource[] = [
  {
    id: OPEN_GTA6_MAP,
    name: 'Open GTA 6 Map',
    homepage: 'https://github.com/fbritoferreira/gta6',
    licence: CC_BY_4,
    credit:
      'Map data from Open GTA 6 Map (fbritoferreira), CC BY 4.0 — https://github.com/fbritoferreira/gta6',
    changes:
      'Modified: coordinates converted to in-game metres, places merged with gtadb landmarks, ' +
      'missing regions inferred from nearby landmarks, screenshots not included.',
    version: 'public/data @ d860901 (2026-11-24)',
  },
  {
    id: GTADB,
    name: 'gtadb.org',
    homepage: 'https://map.gtadb.org',
    licence: CC_BY_4,
    credit: 'GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org — gtadb.org and all contributors',
    changes:
      'Modified: reshaped into named fields, editor-only tags dropped, tags mapped to map layers, ' +
      'landmarks that duplicate Open GTA 6 Map places removed. Photos not included.',
    version: 'map/data/6 @ d406fea (2026-11-19)',
  },
  {
    id: AWESOME_GTA6,
    name: 'awesome-gta-6 mission list',
    homepage: 'https://github.com/teekamsuthar/awesome-gta-6',
    licence: { name: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
    credit: 'Mission list: awesome-gta-6 (CC0)',
    version: 'data/missions.json (2026-11-20)',
  },
];
