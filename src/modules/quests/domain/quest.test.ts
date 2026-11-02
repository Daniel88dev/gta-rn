import { describe, expect, it } from 'vitest';
import { asId } from '../../../shared/domain';
import { completeStep, isQuestComplete, type Quest } from './quest';

const quest: Quest = {
  id: asId('q1'),
  title: 'Q',
  summary: '',
  steps: [
    { id: asId('s1'), title: 'one' },
    { id: asId('s2'), title: 'two' },
  ],
};

describe('completeStep', () => {
  it('marks a step done and detects completion', () => {
    const progress = { questId: quest.id, completedStepIds: [] };
    const r1 = completeStep(quest, progress, asId('s1'));
    const r2 = r1.ok ? completeStep(quest, r1.value, asId('s2')) : r1;
    expect(r2.ok && isQuestComplete(quest, r2.value)).toBe(true);
  });

  it('rejects unknown steps', () => {
    const r = completeStep(quest, { questId: quest.id, completedStepIds: [] }, asId('nope'));
    expect(r.ok).toBe(false);
  });
});
