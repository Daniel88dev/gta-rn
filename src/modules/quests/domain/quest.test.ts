import { describe, expect, it } from 'vitest';
import { asId } from '../../../shared/domain';
import {
  completeQuest,
  completeStep,
  emptyProgress,
  isQuestComplete,
  isQuestUnlocked,
  reopenQuest,
  type Quest,
} from './quest';

const quest: Quest = {
  id: asId('q1'),
  title: 'Q',
  kind: 'story',
  prerequisiteIds: [asId('q0')],
  steps: [
    { id: asId('s1'), title: 'one' },
    { id: asId('s2'), title: 'two' },
  ],
  spoilerLevel: 'none',
  provenance: { sourceId: asId('test'), confidence: 'community' },
};

describe('quest progress', () => {
  it('marks steps done and detects completion', () => {
    const r1 = completeStep(quest, emptyProgress(quest.id), asId('s1'));
    const r2 = r1.ok ? completeStep(quest, r1.value, asId('s2')) : r1;
    expect(r2.ok && r2.value.completed).toBe(true);
    expect(r2.ok && isQuestComplete(quest, r2.value)).toBe(true);
  });

  it('rejects unknown steps', () => {
    expect(completeStep(quest, emptyProgress(quest.id), asId('nope')).ok).toBe(false);
  });

  it('completes and reopens a mission without steps', () => {
    const bare: Quest = { ...quest, steps: [] };
    const done = completeQuest(bare, emptyProgress(bare.id));
    expect(isQuestComplete(bare, done)).toBe(true);
    expect(isQuestComplete(bare, reopenQuest(done))).toBe(false);
    expect(isQuestComplete(bare, emptyProgress(bare.id))).toBe(false);
  });

  it('unlocks once prerequisites are done', () => {
    expect(isQuestUnlocked(quest, new Set())).toBe(false);
    expect(isQuestUnlocked(quest, new Set([asId<'Quest'>('q0')]))).toBe(true);
  });
});
