/** gtadb.org landmarks (normalised file from research/data). Field meanings per research/data/ATTRIBUTION.md. */
import type { LocationRecord } from '../content/format';
import { districtId, normaliseRegionName, regionId } from './regions';

export const GTADB_SOURCE = 'gtadb';

export interface GtadbLandmark {
  readonly id: string;
  readonly inGameAddress: string | null;
  readonly name: string | null;
  readonly nameConfirmed: boolean;
  readonly area: string | null;
  readonly district: string | null;
  readonly inGameXY: readonly [number, number] | null;
  readonly realWorldAddress: string | null;
  readonly realWorldLatLng: readonly [number, number] | null;
  readonly tags: readonly string[];
}

export interface GtadbFile {
  readonly meta: { readonly count: number; readonly upstreamCommit?: string };
  readonly landmarks: readonly GtadbLandmark[];
}

/** First matching rule wins. Keys are Open GTA 6 Map place kinds, so both sources share one set of layers. */
const KIND_RULES: readonly (readonly [kind: string, tags: readonly string[]])[] = [
  ['safehouse', ['#safehouse']],
  ['civic', ['#police', '#hospital', '#jail', '#airbase', 'government', 'public', 'utilities']],
  ['food', ['#nightclub', '#stripclub', '#bar', '#drinks', '#food', '#fastfood', 'restaurant']],
  ['hotel', ['hotel']],
  [
    'transport',
    ['transportation', '#bus', '#train', '#metro', '#metromover', '#airport', '#marina', '#blimp'],
  ],
  [
    'shop',
    [
      'retail',
      'supermarket',
      '#supermarket',
      '#gas',
      '#clothes',
      '#guns',
      '#hair',
      '#tattoos',
      '#modshop',
      "#pay'n'spray",
      '#electronics',
      '#liquor',
      '#bikeshop',
      '#carwash',
      '#vendor',
      '#fence',
      'service',
    ],
  ],
  ['leisure', ['leisure', 'events', '#tennis', '#golf', '#racetrack', '#ferriswheel']],
  ['nature', ['natural']],
];

export const gtadbKind = (tags: readonly string[]): string =>
  KIND_RULES.find(([, match]) => match.some((t) => tags.includes(t)))?.[0] ?? 'building';

export const gtadbStatus = (tags: readonly string[]): LocationRecord['status'] => {
  if (tags.includes('demolished')) return 'demolished';
  if (tags.includes('closed')) return 'closed';
  if (tags.includes('construction')) return 'under-construction';
  return undefined;
};

/** Tags worth keeping for search: drop level markers (l1..l8) and the "#" prefix. */
const cleanTags = (tags: readonly string[]) => [
  ...new Set(tags.filter((t) => !/^l\d$/.test(t)).map((t) => t.replace(/^#/, '').toLowerCase())),
];

export interface GtadbConversion {
  readonly record: LocationRecord;
  readonly regionName?: string;
  readonly districtName?: string;
}

export const fromGtadb = (l: GtadbLandmark): GtadbConversion => {
  const regionName = normaliseRegionName(l.area);
  const districtName = regionName ? normaliseRegionName(l.district) : undefined;
  const tags = cleanTags(l.tags);
  const record: LocationRecord = {
    id: `gtadb:${l.id}`,
    name: l.name?.trim() || null,
    nameConfirmed: l.nameConfirmed || undefined,
    kind: gtadbKind(l.tags),
    x: l.inGameXY ? round(l.inGameXY[0]) : undefined,
    y: l.inGameXY ? round(l.inGameXY[1]) : undefined,
    region: regionName ? regionId(regionName) : undefined,
    district: regionName && districtName ? districtId(regionName, districtName) : undefined,
    address: l.inGameAddress ?? undefined,
    status: gtadbStatus(l.tags),
    enterable: l.tags.includes('enterable') || undefined,
    tags: tags.length ? tags : undefined,
    realWorld: l.realWorldAddress
      ? { address: l.realWorldAddress, lat: l.realWorldLatLng?.[0], lng: l.realWorldLatLng?.[1] }
      : undefined,
    source: GTADB_SOURCE,
    sourceRef: l.id,
    confidence: l.tags.includes('unconfirmed') ? 'unconfirmed' : undefined,
  };
  return { record, regionName, districtName };
};

/** Positions to one decimal: 10 cm is plenty and keeps the bundle small. */
export const round = (n: number) => Math.round(n * 10) / 10;
