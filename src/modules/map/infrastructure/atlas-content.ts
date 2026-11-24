/**
 * Turns the app's bundled atlas file (see src/content/format.ts) into domain objects.
 * The file is produced by `npm run content:import`; nothing here knows about upstream formats.
 */
import { asId } from '../../../shared/domain';
import type { AtlasContent, LocationRecord } from '../../../content/format';
import type { MapLocation } from '../domain/location';
import type { LocationKind } from '../domain/location-kind';

export const hydrateLocation = (
  r: LocationRecord,
  kinds: ReadonlyMap<string, LocationKind>,
): MapLocation => ({
  id: asId(r.id),
  name: r.name ?? null,
  nameConfirmed: r.nameConfirmed ?? false,
  kind: asId(r.kind),
  category: kinds.get(r.kind)?.category ?? 'other',
  coordinate: r.x !== undefined && r.y !== undefined ? { x: r.x, y: r.y } : undefined,
  regionId: r.region ? asId(r.region) : undefined,
  districtId: r.district ? asId(r.district) : undefined,
  address: r.address,
  description: r.description,
  status: r.status ?? 'open',
  enterable: r.enterable ?? false,
  tags: r.tags ?? [],
  realWorld: r.realWorld,
  provenance: { sourceId: asId(r.source), sourceRef: r.sourceRef, confidence: r.confidence ?? 'community' },
});

export const hydrateAtlas = (content: AtlasContent) => {
  const kinds = content.kinds.map((k) => ({ ...k, key: asId<'LocationKind'>(k.key) }));
  const kindByKey = new Map<string, LocationKind>(kinds.map((k) => [k.key, k]));
  return {
    kinds,
    regions: content.regions.map((r) => ({ id: asId<'Region'>(r.id), name: r.name })),
    districts: content.districts.map((d) => ({
      id: asId<'District'>(d.id),
      regionId: asId<'Region'>(d.regionId),
      name: d.name,
    })),
    locations: content.locations.map((r) => hydrateLocation(r, kindByKey)),
  };
};
