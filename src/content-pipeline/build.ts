/**
 * Merges all upstream datasets into the app's content files. Pure function: no file access,
 * so it is unit-tested and the CLI in scripts/ only does I/O.
 */
import type {
  AtlasContent,
  GuideContent,
  GuideItemRecord,
  GuideKindRecord,
  KindRecord,
  LocationRecord,
} from '../content/format';
import { SCHEMA_VERSION } from '../content/format';
import { EXPECTED_TOTALS } from './expected-totals';
import { fromGtadb, type GtadbFile } from './gtadb';
import { fromMissions, type MissionsFile } from './missions';
import {
  OGM_SOURCE,
  ogmKindToRecord,
  ogmToGame,
  type OgmCategories,
  type OgmLocation,
} from './open-gta6-map';
import { normaliseRegionName, regionId, RegionLocator } from './regions';

export interface PipelineInput {
  readonly gtadb: GtadbFile;
  readonly ogmCategories: OgmCategories;
  readonly ogmLocations: readonly OgmLocation[];
  readonly missions: MissionsFile;
  readonly generatedAt: string;
}

export interface PipelineReport {
  readonly locations: number;
  readonly unpositioned: number;
  readonly gtadbMergedIntoOgm: number;
  readonly regionsInferred: number;
  readonly collectibles: number;
  readonly activities: number;
  readonly missions: number;
}

/** Max distance (metres) for a gtadb landmark and an Open GTA 6 Map place with the same name to count as one. */
const DUPLICATE_RADIUS = 75;
/** Max distance (metres) to borrow a region from the nearest landmark when upstream has none. */
const REGION_RADIUS = 600;

const normaliseName = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const nonEmpty = (s: string | undefined) => (s && s.trim() ? s.trim() : undefined);
const groupOf = (o: OgmLocation) => nonEmpty(o.type.replace(/\s+card$/i, ''));

export const buildContent = (
  input: PipelineInput,
): { atlas: AtlasContent; guide: GuideContent; report: PipelineReport } => {
  const kinds: KindRecord[] = input.ogmCategories.kinds.map(ogmKindToRecord);
  const kindByKey = new Map(kinds.map((k) => [k.key, k]));

  const regionNames = new Map<string, string>();
  const districts = new Map<string, { id: string; regionId: string; name: string }>();

  // 1. gtadb landmarks become places.
  const gtadb = input.gtadb.landmarks.map((l) => {
    const c = fromGtadb(l);
    if (c.regionName) regionNames.set(regionId(c.regionName), c.regionName);
    if (c.record.district && c.record.region && c.districtName) {
      districts.set(c.record.district, {
        id: c.record.district,
        regionId: c.record.region,
        name: c.districtName,
      });
    }
    return c.record;
  });

  const locator = new RegionLocator(
    gtadb.flatMap((r) =>
      r.region && r.x !== undefined && r.y !== undefined
        ? [{ at: { x: r.x, y: r.y }, region: r.region }]
        : [],
    ),
  );

  // 2. Open GTA 6 Map pins. Collectible, activity and crime pins also become guide items.
  let regionsInferred = 0;
  const collectibles: GuideItemRecord[] = [];
  const activities: GuideItemRecord[] = [];
  const ogm: LocationRecord[] = input.ogmLocations.map((o) => {
    const at = ogmToGame(o.x, o.y);
    const areaName = normaliseRegionName(o.area);
    if (areaName) regionNames.set(regionId(areaName), areaName);
    let region = areaName ? regionId(areaName) : undefined;
    if (!region) {
      region = locator.nearest(at, REGION_RADIUS);
      if (region) regionsInferred++;
    }
    const kind = kindByKey.get(o.kind);
    const id = `ogm:${o.id}`;
    const description = nonEmpty(o.description);
    const confidence = o.confidence === 'community' || !o.confidence ? undefined : 'community';

    if (
      kind &&
      (kind.category === 'collectible' || kind.category === 'activity' || kind.category === 'crime')
    ) {
      const item: GuideItemRecord = {
        id,
        kind: o.kind,
        name: o.name.trim(),
        group: groupOf(o),
        description,
        locationId: id,
        source: OGM_SOURCE,
        sourceRef: o.id,
        confidence,
      };
      (kind.category === 'collectible' ? collectibles : activities).push(item);
    }

    return {
      id,
      name: nonEmpty(o.name) ?? null,
      kind: kind ? o.kind : 'other',
      x: at.x,
      y: at.y,
      region,
      description,
      realWorld: o.real_life ? { address: o.real_life } : undefined,
      source: OGM_SOURCE,
      sourceRef: o.id,
      confidence,
    };
  });

  // 3. Merge duplicates: an Open GTA 6 Map place and a gtadb landmark with the same name close together.
  //    Keep the newer post-launch pin and enrich it with gtadb's address, district and real-world counterpart.
  const ogmPlacesByName = new Map<string, LocationRecord[]>();
  for (const r of ogm) {
    if (kindByKey.get(r.kind)?.category !== 'place' || !r.name) continue;
    const key = normaliseName(r.name);
    ogmPlacesByName.set(key, [...(ogmPlacesByName.get(key) ?? []), r]);
  }
  const enriched = new Map<string, LocationRecord>();
  const keptGtadb = gtadb.filter((g) => {
    if (!g.name || g.x === undefined || g.y === undefined) return true;
    const match = ogmPlacesByName
      .get(normaliseName(g.name))
      ?.find((o) => Math.hypot((o.x ?? Infinity) - g.x!, (o.y ?? Infinity) - g.y!) <= DUPLICATE_RADIUS);
    if (!match || enriched.has(match.id)) return true;
    enriched.set(match.id, {
      ...match,
      region: match.region ?? g.region,
      district: g.district,
      address: g.address,
      nameConfirmed: g.nameConfirmed,
      enterable: g.enterable,
      tags: g.tags,
      realWorld: match.realWorld ?? g.realWorld,
    });
    return false;
  });

  const locations = [...ogm.map((r) => enriched.get(r.id) ?? r), ...keptGtadb].map(stripUndefined);

  const guideKinds = (
    category: KindRecord['category'],
    group?: GuideKindRecord['group'],
  ): GuideKindRecord[] =>
    kinds
      .filter((k) => k.category === category)
      .map((k) => stripUndefined({ key: k.key, label: k.label, group, totals: EXPECTED_TOTALS[k.key] }));

  const missions = fromMissions(input.missions);

  return {
    atlas: {
      schemaVersion: SCHEMA_VERSION,
      generatedAt: input.generatedAt,
      regions: [...regionNames]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      districts: [...districts.values()].sort((a, b) => a.id.localeCompare(b.id)),
      kinds,
      locations,
    },
    guide: {
      schemaVersion: SCHEMA_VERSION,
      generatedAt: input.generatedAt,
      collectibleSets: guideKinds('collectible'),
      collectibles: collectibles.map(stripUndefined),
      activityKinds: [...guideKinds('activity', 'activity'), ...guideKinds('crime', 'crime')],
      activities: activities.map(stripUndefined),
      missions,
      missionNote: input.missions.count_note,
    },
    report: {
      locations: locations.length,
      unpositioned: locations.filter((l) => l.x === undefined).length,
      gtadbMergedIntoOgm: enriched.size,
      regionsInferred,
      collectibles: collectibles.length,
      activities: activities.length,
      missions: missions.length,
    },
  };
};

/** Drop undefined fields so the JSON stays small and diffs stay readable. */
const stripUndefined = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
