import type { LocationFilter, LocationId, MapLocation } from '../domain/location';
import { matchesFilter } from '../domain/location';
import type { LocationKind } from '../domain/location-kind';
import type { District, Region } from '../domain/region';
import type { AtlasReferenceData, LocationRepository } from '../domain/repositories';

/** Read-only atlas held in memory. Fine for ~10k pins; swap for SQLite if it grows a lot. */
export class InMemoryLocationRepository implements LocationRepository {
  private readonly locations: readonly MapLocation[];
  private readonly byId: ReadonlyMap<LocationId, MapLocation>;

  constructor(locations: readonly MapLocation[]) {
    this.locations = locations;
    this.byId = new Map(locations.map((l) => [l.id, l]));
  }

  async findAll(filter?: LocationFilter) {
    if (!filter) return this.locations;
    return this.locations.filter((l) => matchesFilter(l, filter));
  }

  async findById(id: LocationId) {
    return this.byId.get(id);
  }
}

export class InMemoryAtlasReferenceData implements AtlasReferenceData {
  private readonly data: {
    readonly regions: readonly Region[];
    readonly districts: readonly District[];
    readonly kinds: readonly LocationKind[];
  };

  constructor(data: InMemoryAtlasReferenceData['data']) {
    this.data = data;
  }

  async regions() {
    return this.data.regions;
  }
  async districts() {
    return this.data.districts;
  }
  async kinds() {
    return this.data.kinds;
  }
}
