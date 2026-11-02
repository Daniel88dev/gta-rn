import type { Command, CommandHandler } from '../../../shared/cqrs';
import { err, ok } from '../../../shared/domain';
import { completeStep, type QuestId, type StepId } from '../domain/quest';
import type { QuestCatalog, QuestProgressStore } from '../domain/repositories';

export interface CompleteQuestStepCommand extends Command<'quests/complete-step'> {
  readonly questId: QuestId;
  readonly stepId: StepId;
}

export const completeQuestStepHandler =
  (catalog: QuestCatalog, store: QuestProgressStore): CommandHandler<CompleteQuestStepCommand> =>
  async ({ questId, stepId }) => {
    const quest = await catalog.findById(questId);
    if (!quest) return err({ code: 'QUEST_NOT_FOUND', message: `Quest ${questId} not found` });

    const result = completeStep(quest, await store.get(questId), stepId);
    if (!result.ok) return result;

    await store.save(result.value);
    return ok(undefined);
  };
