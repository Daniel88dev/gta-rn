import type { Query, QueryHandler } from '../../../shared/cqrs';
import type { LocationCategory, MapLocation } from '../domain/location';
import type { LocationRepository } from '../domain/location-repository';

export interface GetLocationsQuery extends Query<'map/get-locations', readonly MapLocation[]> {
  readonly categories?: readonly LocationCategory[];
}

export const getLocationsHandler =
  (repo: LocationRepository): QueryHandler<GetLocationsQuery> =>
  (query) =>
    repo.findAll({ categories: query.categories });
