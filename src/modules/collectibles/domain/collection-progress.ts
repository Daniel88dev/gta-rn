import { err, ok, type Result } from '../../../shared/domain';
import type { CollectibleId } from './collectible';

/** Aggregate: which collectibles the player has found. One per player profile. */
export interface CollectionProgress {
  readonly foundIds: readonly CollectibleId[];
}

export const EMPTY_COLLECTION: CollectionProgress = { foundIds: [] };

export const markFound = (
  progress: CollectionProgress,
  id: CollectibleId,
  exists: boolean,
): Result<CollectionProgress> => {
  if (!exists) return err({ code: 'COLLECTIBLE_NOT_FOUND', message: `Collectible ${id} does not exist` });
  if (progress.foundIds.includes(id)) return ok(progress);
  return ok({ foundIds: [...progress.foundIds, id] });
};

export const markNotFound = (progress: CollectionProgress, id: CollectibleId): CollectionProgress =>
  progress.foundIds.includes(id) ? { foundIds: progress.foundIds.filter((f) => f !== id) } : progress;

export const isFound = (progress: CollectionProgress, id: CollectibleId): boolean =>
  progress.foundIds.includes(id);
