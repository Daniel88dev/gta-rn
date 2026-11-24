import type { Id } from '../../../shared/domain';

/** Top-level layer groups on the map. */
export const LOCATION_CATEGORIES = ['collectible', 'activity', 'crime', 'place', 'other'] as const;
export type LocationCategory = (typeof LOCATION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<LocationCategory, string> = {
  collectible: 'Collectibles',
  activity: 'Activities',
  crime: 'Crime',
  place: 'Places',
  other: 'Other',
};

/** Key of a kind of pin, such as "card", "stunt" or "shop". */
export type KindKey = Id<'LocationKind'>;

/** A map layer the user can toggle, such as "Collectible cards". */
export interface LocationKind {
  readonly key: KindKey;
  readonly label: string;
  readonly category: LocationCategory;
  /** Suggested marker colour as #rrggbb. */
  readonly colour: string;
}
