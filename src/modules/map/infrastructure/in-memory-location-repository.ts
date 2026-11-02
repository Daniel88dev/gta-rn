import { asId } from '../../../shared/domain';
import type { MapLocation } from '../domain/location';
import type { LocationRepository } from '../domain/location-repository';

/** Placeholder data until the real asset pipeline exists. */
const seed: MapLocation[] = [
  {
    id: asId('loc-vice-city-beach'),
    name: 'Vice Beach',
    category: 'activity',
    coordinates: { x: 0.72, y: 0.58 },
    regionId: 'vice-city',
  },
];

export class InMemoryLocationRepository implements LocationRepository {
  private readonly locations: MapLocation[];

  constructor(locations: MapLocation[] = seed) {
    this.locations = locations;
  }

  async findAll(filter?: { categories?: readonly MapLocation['category'][] }) {
    const categories = filter?.categories;
    if (!categories?.length) return this.locations;
    return this.locations.filter((l) => categories.includes(l.category));
  }
}
