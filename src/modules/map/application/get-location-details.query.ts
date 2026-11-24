import type { Query, QueryHandler } from '../../../shared/cqrs';
import { locationLabel, type LocationId, type MapLocation } from '../domain/location';
import type { AtlasReferenceData, LocationRepository } from '../domain/repositories';

export interface LocationDetails extends MapLocation {
  readonly label: string;
  readonly kindLabel: string;
  readonly regionName?: string;
  readonly districtName?: string;
}

export interface GetLocationDetailsQuery extends Query<'map/get-location-details', LocationDetails | null> {
  readonly id: LocationId;
}

export const getLocationDetailsHandler =
  (locations: LocationRepository, reference: AtlasReferenceData): QueryHandler<GetLocationDetailsQuery> =>
  async ({ id }) => {
    const location = await locations.findById(id);
    if (!location) return null;
    const [kinds, regions, districts] = await Promise.all([
      reference.kinds(),
      reference.regions(),
      reference.districts(),
    ]);
    const kindLabel = kinds.find((k) => k.key === location.kind)?.label ?? location.kind;
    return {
      ...location,
      label: locationLabel(location, kindLabel),
      kindLabel,
      regionName: regions.find((r) => r.id === location.regionId)?.name,
      districtName: districts.find((d) => d.id === location.districtId)?.name,
    };
  };
