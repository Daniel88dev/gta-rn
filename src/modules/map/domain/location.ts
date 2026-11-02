import type { Id } from '../../../shared/domain';

export type LocationId = Id<'Location'>;

/** Position in map space, normalised to 0..1 on both axes so it is independent of tile resolution. */
export interface Coordinates {
  readonly x: number;
  readonly y: number;
}

export type LocationCategory = 'mission' | 'collectible' | 'shop' | 'safehouse' | 'activity' | 'other';

export interface MapLocation {
  readonly id: LocationId;
  readonly name: string;
  readonly category: LocationCategory;
  readonly coordinates: Coordinates;
  readonly regionId: string;
  readonly description?: string;
}

export const isWithinMap = ({ x, y }: Coordinates): boolean => x >= 0 && x <= 1 && y >= 0 && y <= 1;
