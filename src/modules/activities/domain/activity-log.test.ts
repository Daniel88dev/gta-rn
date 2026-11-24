import { describe, expect, it } from 'vitest';
import { asId } from '../../../shared/domain';
import { EMPTY_ACTIVITY_LOG, markDone, markNotDone } from './activity-log';

const jump = asId<'Activity'>('stunt-1');

describe('activity log', () => {
  it('records and clears done activities', () => {
    const r = markDone(EMPTY_ACTIVITY_LOG, jump, true);
    expect(r.ok && r.value.doneIds).toEqual([jump]);
    expect(r.ok && markNotDone(r.value, jump).doneIds).toEqual([]);
    expect(markDone(EMPTY_ACTIVITY_LOG, jump, false).ok).toBe(false);
  });
});
