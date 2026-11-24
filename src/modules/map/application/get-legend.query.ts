import type { Query, QueryHandler } from '../../../shared/cqrs';
import {
  CATEGORY_LABELS,
  LOCATION_CATEGORIES,
  type LocationCategory,
  type LocationKind,
} from '../domain/location-kind';
import type { AtlasReferenceData, LocationRepository } from '../domain/repositories';

export interface LegendKind extends LocationKind {
  /** Pins of this kind that can be drawn. */
  readonly count: number;
}

export interface LegendGroup {
  readonly category: LocationCategory;
  readonly label: string;
  readonly kinds: readonly LegendKind[];
}

/** Layers for the filter panel, grouped by category. Empty kinds are left out. */
export type GetLegendQuery = Query<'map/get-legend', readonly LegendGroup[]>;

export const getLegendHandler =
  (locations: LocationRepository, reference: AtlasReferenceData): QueryHandler<GetLegendQuery> =>
  async () => {
    const [all, kinds] = await Promise.all([locations.findAll({ onlyPositioned: true }), reference.kinds()]);
    const counts = new Map<string, number>();
    for (const l of all) counts.set(l.kind, (counts.get(l.kind) ?? 0) + 1);

    return LOCATION_CATEGORIES.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      kinds: kinds
        .filter((k) => k.category === category && (counts.get(k.key) ?? 0) > 0)
        .map((k) => ({ ...k, count: counts.get(k.key) ?? 0 }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    })).filter((g) => g.kinds.length > 0);
  };
