import type { Query, QueryHandler } from '../../../shared/cqrs';
import { boundsOf, type Bounds, type Confidence } from '../../../shared/domain';
import { locationLabel, type LocationFilter, type LocationId } from '../domain/location';
import type { KindKey, LocationCategory } from '../domain/location-kind';
import type { AtlasReferenceData, LocationRepository } from '../domain/repositories';

/** Slim read model for drawing thousands of pins. Coordinates are in-game metres. */
export interface MapMarker {
  readonly id: LocationId;
  readonly label: string;
  readonly kind: KindKey;
  readonly category: LocationCategory;
  readonly x: number;
  readonly y: number;
  readonly confidence: Confidence;
}

export interface MarkerSet {
  readonly markers: readonly MapMarker[];
  /** Bounds of the returned markers, or null when there are none. */
  readonly bounds: Bounds | null;
}

export interface GetMarkersQuery extends Query<'map/get-markers', MarkerSet> {
  readonly filter?: Omit<LocationFilter, 'onlyPositioned'>;
}

export const getMarkersHandler =
  (locations: LocationRepository, reference: AtlasReferenceData): QueryHandler<GetMarkersQuery> =>
  async ({ filter }) => {
    const [found, kinds] = await Promise.all([
      locations.findAll({ ...filter, onlyPositioned: true }),
      reference.kinds(),
    ]);
    const kindLabels = new Map(kinds.map((k) => [k.key, k.label]));
    const markers: MapMarker[] = [];
    for (const l of found) {
      if (!l.coordinate) continue;
      markers.push({
        id: l.id,
        label: locationLabel(l, kindLabels.get(l.kind)),
        kind: l.kind,
        category: l.category,
        x: l.coordinate.x,
        y: l.coordinate.y,
        confidence: l.provenance.confidence,
      });
    }
    return { markers, bounds: boundsOf(markers) };
  };
