import type { Query, QueryHandler } from '../../../shared/cqrs';
import type { CollectibleSetId, ExpectedTotal } from '../domain/collectible';
import type { CollectibleCatalog, CollectionProgressStore } from '../domain/repositories';

export interface CollectionStats {
  readonly setId: CollectibleSetId;
  readonly name: string;
  readonly found: number;
  /** Items we have data for. Can be lower than the expected total while the community is still mapping. */
  readonly known: number;
  readonly expected?: ExpectedTotal;
}

export type GetCollectionStatsQuery = Query<'collectibles/get-stats', readonly CollectionStats[]>;

export const getCollectionStatsHandler =
  (catalog: CollectibleCatalog, store: CollectionProgressStore): QueryHandler<GetCollectionStatsQuery> =>
  async () => {
    const [sets, items, progress] = await Promise.all([catalog.sets(), catalog.findAll(), store.get()]);
    const found = new Set(progress.foundIds);
    return sets.map((set) => {
      const inSet = items.filter((i) => i.setId === set.id);
      return {
        setId: set.id,
        name: set.name,
        known: inSet.length,
        found: inSet.filter((i) => found.has(i.id)).length,
        expected: set.expected,
      };
    });
  };
