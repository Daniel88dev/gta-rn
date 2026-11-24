import type { Query, QueryHandler } from '../../../shared/cqrs';
import type { ActivityId } from '../domain/activity';
import type { ActivityCatalog, ActivityLogStore } from '../domain/repositories';

export interface ActivityAtLocation {
  readonly id: ActivityId;
  readonly name: string;
  readonly kindName: string;
  readonly description?: string;
  readonly done: boolean;
}

export interface GetActivitiesAtLocationQuery extends Query<
  'activities/get-at-location',
  readonly ActivityAtLocation[]
> {
  readonly locationId: string;
}

export const getActivitiesAtLocationHandler =
  (catalog: ActivityCatalog, store: ActivityLogStore): QueryHandler<GetActivitiesAtLocationQuery> =>
  async ({ locationId }) => {
    const [items, kinds, log] = await Promise.all([
      catalog.findByLocation(locationId),
      catalog.kinds(),
      store.get(),
    ]);
    return items.map((a) => ({
      id: a.id,
      name: a.name,
      kindName: kinds.find((k) => k.id === a.kindId)?.name ?? a.kindId,
      description: a.description,
      done: log.doneIds.includes(a.id),
    }));
  };
