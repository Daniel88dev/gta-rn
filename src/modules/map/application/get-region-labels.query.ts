import type { Query, QueryHandler } from '../../../shared/cqrs';
import { centroid, type GameCoordinate } from '../../../shared/domain';
import type { RegionId } from '../domain/region';
import type { AtlasReferenceData, LocationRepository } from '../domain/repositories';

export interface RegionLabel {
  readonly id: RegionId;
  readonly name: string;
  /** Average position of the region's pins: a cheap stand-in until we have region outlines. */
  readonly anchor: GameCoordinate;
  readonly locationCount: number;
}

export interface GetRegionLabelsQuery extends Query<'map/get-region-labels', readonly RegionLabel[]> {
  /** Leave out regions with fewer pins than this. Small ones are usually typos or single places. */
  readonly minLocations?: number;
}

export const getRegionLabelsHandler =
  (locations: LocationRepository, reference: AtlasReferenceData): QueryHandler<GetRegionLabelsQuery> =>
  async ({ minLocations = 1 }) => {
    const [all, regions] = await Promise.all([
      locations.findAll({ onlyPositioned: true }),
      reference.regions(),
    ]);
    const byRegion = new Map<string, GameCoordinate[]>();
    for (const l of all) {
      if (!l.regionId || !l.coordinate) continue;
      const list = byRegion.get(l.regionId) ?? [];
      list.push(l.coordinate);
      byRegion.set(l.regionId, list);
    }
    const labels: RegionLabel[] = [];
    for (const r of regions) {
      const coords = byRegion.get(r.id) ?? [];
      const anchor = centroid(coords);
      if (anchor && coords.length >= minLocations) {
        labels.push({ id: r.id, name: r.name, anchor, locationCount: coords.length });
      }
    }
    return labels;
  };
