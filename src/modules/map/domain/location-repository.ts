import type { LocationCategory, MapLocation } from './location';

/** Port: the domain says what it needs, infrastructure decides where the data lives. */
export interface LocationRepository {
  findAll(filter?: { categories?: readonly LocationCategory[] }): Promise<readonly MapLocation[]>;
}
