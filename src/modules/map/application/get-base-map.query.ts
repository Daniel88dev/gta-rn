import type { Query, QueryHandler } from '../../../shared/cqrs';
import type { BaseMap } from '../domain/base-map';

export type GetBaseMapQuery = Query<'map/get-base-map', BaseMap>;

/** The base map is picked in the composition root, so swapping imagery never touches the UI. */
export const getBaseMapHandler =
  (baseMap: BaseMap): QueryHandler<GetBaseMapQuery> =>
  async () =>
    baseMap;
