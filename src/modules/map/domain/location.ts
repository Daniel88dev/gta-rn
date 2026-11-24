import {
  isAtLeast,
  type Confidence,
  type GameCoordinate,
  type Id,
  type Provenance,
} from '../../../shared/domain';
import type { KindKey, LocationCategory } from './location-kind';
import type { DistrictId, RegionId } from './region';

export type LocationId = Id<'Location'>;

export type LocationStatus = 'open' | 'closed' | 'demolished' | 'under-construction';

export interface RealWorldCounterpart {
  readonly address: string;
  readonly lat?: number;
  readonly lng?: number;
}

/**
 * A pin on the map. Guide content (collectibles, activities, missions) points at a location by id,
 * so the map stays the single owner of "where".
 */
export interface MapLocation {
  readonly id: LocationId;
  /** Null when the place has no known in-game name yet. */
  readonly name: string | null;
  readonly nameConfirmed: boolean;
  readonly kind: KindKey;
  /** Denormalised from the kind so filters don't need a lookup. */
  readonly category: LocationCategory;
  /** Missing when the place is known but its position isn't. Such places are listed but not drawn. */
  readonly coordinate?: GameCoordinate;
  readonly regionId?: RegionId;
  readonly districtId?: DistrictId;
  /** In-game street address, if known. */
  readonly address?: string;
  readonly description?: string;
  readonly status: LocationStatus;
  /** The player can go inside. */
  readonly enterable: boolean;
  /** Free-form, lower-case tags kept for search and future filters. */
  readonly tags: readonly string[];
  readonly realWorld?: RealWorldCounterpart;
  readonly provenance: Provenance;
}

/** Name to show for a place, falling back to its address and then to its kind. */
export const locationLabel = (l: Pick<MapLocation, 'name' | 'address'>, kindLabel = 'place'): string => {
  if (l.name) return l.name;
  const street = l.address?.split(',')[0]?.trim();
  if (street && street !== '?') return street;
  return `Unnamed ${kindLabel.toLowerCase()}`;
};

/** Specification used by repositories and tests alike, so filtering rules live in one place. */
export interface LocationFilter {
  readonly categories?: readonly LocationCategory[];
  readonly kinds?: readonly KindKey[];
  readonly regionIds?: readonly RegionId[];
  readonly minConfidence?: Confidence;
  /** Hide demolished and closed places. */
  readonly onlyOpen?: boolean;
  /** Only places with a known position. */
  readonly onlyPositioned?: boolean;
  /** Case-insensitive match on name, address, description and tags. */
  readonly text?: string;
}

export const matchesFilter = (l: MapLocation, f: LocationFilter): boolean => {
  if (f.categories && !f.categories.includes(l.category)) return false;
  if (f.kinds && !f.kinds.includes(l.kind)) return false;
  if (f.regionIds && (!l.regionId || !f.regionIds.includes(l.regionId))) return false;
  if (f.minConfidence && !isAtLeast(l.provenance.confidence, f.minConfidence)) return false;
  if (f.onlyOpen && l.status !== 'open') return false;
  if (f.onlyPositioned && !l.coordinate) return false;
  const text = f.text?.trim().toLowerCase();
  if (text) {
    const haystack = [l.name ?? '', l.address ?? '', l.description ?? '', ...l.tags].join(' ').toLowerCase();
    if (!haystack.includes(text)) return false;
  }
  return true;
};
