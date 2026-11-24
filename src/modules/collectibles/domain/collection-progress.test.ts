import { describe, expect, it } from 'vitest';
import { asId } from '../../../shared/domain';
import { EMPTY_COLLECTION, isFound, markFound, markNotFound } from './collection-progress';

const card = asId<'Collectible'>('card-1');

describe('collection progress', () => {
  it('marks found once and can undo', () => {
    const r = markFound(EMPTY_COLLECTION, card, true);
    expect(r.ok && isFound(r.value, card)).toBe(true);
    const again = r.ok ? markFound(r.value, card, true) : r;
    expect(again.ok && again.value.foundIds).toEqual([card]);
    expect(r.ok && isFound(markNotFound(r.value, card), card)).toBe(false);
  });

  it('rejects collectibles that are not in the catalogue', () => {
    expect(markFound(EMPTY_COLLECTION, card, false).ok).toBe(false);
  });
});
