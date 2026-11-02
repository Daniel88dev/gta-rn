import { err, ok, type Id, type Result } from '../../../shared/domain';

export type QuestId = Id<'Quest'>;
export type StepId = Id<'QuestStep'>;

export interface QuestStep {
  readonly id: StepId;
  readonly title: string;
  readonly hint?: string;
  /** Optional link to a map location in the map context (by id only, no direct import). */
  readonly locationId?: string;
}

export interface Quest {
  readonly id: QuestId;
  readonly title: string;
  readonly summary: string;
  readonly steps: readonly QuestStep[];
}

/** Aggregate: the player's progress on one quest. Invariants live here, not in the UI. */
export interface QuestProgress {
  readonly questId: QuestId;
  readonly completedStepIds: readonly StepId[];
}

export const completeStep = (
  quest: Quest,
  progress: QuestProgress,
  stepId: StepId,
): Result<QuestProgress> => {
  if (!quest.steps.some((s) => s.id === stepId)) {
    return err({ code: 'UNKNOWN_STEP', message: `Step ${stepId} is not part of quest ${quest.id}` });
  }
  if (progress.completedStepIds.includes(stepId)) return ok(progress);
  return ok({ ...progress, completedStepIds: [...progress.completedStepIds, stepId] });
};

export const isQuestComplete = (quest: Quest, progress: QuestProgress): boolean =>
  quest.steps.every((s) => progress.completedStepIds.includes(s.id));
