import { err, ok, type Id, type Provenance, type Result, type SpoilerLevel } from '../../../shared/domain';

export type QuestId = Id<'Quest'>;
export type StepId = Id<'QuestStep'>;

export const QUEST_KINDS = ['story', 'side', 'stranger', 'other'] as const;
export type QuestKind = (typeof QUEST_KINDS)[number];

export interface Chapter {
  readonly number: number;
  readonly title: string;
}

export interface QuestStep {
  readonly id: StepId;
  readonly title: string;
  readonly hint?: string;
  /** Optional link to a map location in the map context (by id only, no direct import). */
  readonly locationId?: string;
}

/** A mission from the guide catalogue. Text we write ourselves goes in summary and steps. */
export interface Quest {
  readonly id: QuestId;
  readonly title: string;
  readonly kind: QuestKind;
  readonly chapter?: Chapter;
  /** Position in the overall story order. */
  readonly order?: number;
  readonly summary?: string;
  /** Who gives the mission, by name until there is a characters context. */
  readonly giver?: string;
  /** Missions that must be completed first. */
  readonly prerequisiteIds: readonly QuestId[];
  /** Where it starts, as a map location id. */
  readonly startLocationId?: string;
  /** Optional walkthrough. Many missions are tracked as a whole without steps. */
  readonly steps: readonly QuestStep[];
  readonly spoilerLevel: SpoilerLevel;
  readonly provenance: Provenance;
}

/** Aggregate: the player's progress on one quest. Invariants live here, not in the UI. */
export interface QuestProgress {
  readonly questId: QuestId;
  readonly completedStepIds: readonly StepId[];
  /** Set when the whole mission is marked done, with or without steps. */
  readonly completed: boolean;
}

export const emptyProgress = (questId: QuestId): QuestProgress => ({
  questId,
  completedStepIds: [],
  completed: false,
});

export const completeStep = (
  quest: Quest,
  progress: QuestProgress,
  stepId: StepId,
): Result<QuestProgress> => {
  if (!quest.steps.some((s) => s.id === stepId)) {
    return err({ code: 'UNKNOWN_STEP', message: `Step ${stepId} is not part of quest ${quest.id}` });
  }
  if (progress.completedStepIds.includes(stepId)) return ok(progress);
  const completedStepIds = [...progress.completedStepIds, stepId];
  const allDone = quest.steps.every((s) => completedStepIds.includes(s.id));
  return ok({ ...progress, completedStepIds, completed: progress.completed || allDone });
};

/** Marks the whole mission done, which also ticks every step. */
export const completeQuest = (quest: Quest, progress: QuestProgress): QuestProgress => ({
  ...progress,
  completed: true,
  completedStepIds: quest.steps.map((s) => s.id),
});

/** Undo for a mis-tap: clears the mission and its steps. */
export const reopenQuest = (progress: QuestProgress): QuestProgress => ({
  ...progress,
  completed: false,
  completedStepIds: [],
});

export const isQuestComplete = (quest: Quest, progress: QuestProgress): boolean =>
  progress.completed ||
  (quest.steps.length > 0 && quest.steps.every((s) => progress.completedStepIds.includes(s.id)));

/** A quest is unlocked when all its prerequisites are complete. */
export const isQuestUnlocked = (quest: Quest, completedQuestIds: ReadonlySet<QuestId>): boolean =>
  quest.prerequisiteIds.every((id) => completedQuestIds.has(id));
