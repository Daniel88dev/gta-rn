import type { Command, CommandHandler } from '../../../shared/cqrs';
import { ok } from '../../../shared/domain';
import type { CollectibleId } from '../domain/collectible';
import { markFound, markNotFound } from '../domain/collection-progress';
import type { CollectibleCatalog, CollectionProgressStore } from '../domain/repositories';

export interface SetCollectibleFoundCommand extends Command<'collectibles/set-found'> {
  readonly collectibleId: CollectibleId;
  readonly found: boolean;
}

export const setCollectibleFoundHandler =
  (catalog: CollectibleCatalog, store: CollectionProgressStore): CommandHandler<SetCollectibleFoundCommand> =>
  async ({ collectibleId, found }) => {
    const progress = await store.get();
    if (!found) {
      await store.save(markNotFound(progress, collectibleId));
      return ok(undefined);
    }
    const result = markFound(progress, collectibleId, !!(await catalog.findById(collectibleId)));
    if (!result.ok) return result;
    await store.save(result.value);
    return ok(undefined);
  };
