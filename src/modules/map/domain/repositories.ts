import type { LocationFilter, LocationId, MapLocation } from './location';
import type { LocationKind } from './location-kind';
import type { District, Region } from './region';

/** Port: the domain says what it needs, infrastructure decides where the data lives. */
export interface LocationRepository {
  findAll(filter?: LocationFilter): Promise<readonly MapLocation[]>;
  findById(id: LocationId): Promise<MapLocation | undefined>;
}

/** Reference data that rarely changes: regions, districts and the layer taxonomy. */
export interface AtlasReferenceData {
  regions(): Promise<readonly Region[]>;
  districts(): Promise<readonly District[]>;
  kinds(): Promise<readonly LocationKind[]>;
}
