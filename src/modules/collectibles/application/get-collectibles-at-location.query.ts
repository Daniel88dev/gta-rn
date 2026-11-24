import type { Query, QueryHandler } from '../../../shared/cqrs';
import type { CollectibleId } from '../domain/collectible';
import { isFound } from '../domain/collection-progress';
import type { CollectibleCatalog, CollectionProgressStore } from '../domain/repositories';

export interface CollectibleAtLocation {
  readonly id: CollectibleId;
  readonly name: string;
  readonly setName: string;
  readonly group?: string;
  readonly description?: string;
  readonly found: boolean;
}

/** Used by the map's details panel: "what can I collect here, and have I got it?" */
export interface GetCollectiblesAtLocationQuery extends Query<
  'collectibles/get-at-location',
  readonly CollectibleAtLocation[]
> {
  readonly locationId: string;
}

export const getCollectiblesAtLocationHandler =
  (
    catalog: CollectibleCatalog,
    store: CollectionProgressStore,
  ): QueryHandler<GetCollectiblesAtLocationQuery> =>
  async ({ locationId }) => {
    const [items, sets, progress] = await Promise.all([
      catalog.findByLocation(locationId),
      catalog.sets(),
      store.get(),
    ]);
    return items.map((c) => ({
      id: c.id,
      name: c.name,
      setName: sets.find((s) => s.id === c.setId)?.name ?? c.setId,
      group: c.group,
      description: c.description,
      found: isFound(progress, c.id),
    }));
  };
