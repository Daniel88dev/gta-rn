import { asId } from '../../../shared/domain';
import type { Quest, QuestId, QuestProgress } from '../domain/quest';
import type { QuestCatalog, QuestProgressStore } from '../domain/repositories';

const seed: Quest[] = [
  {
    id: asId('quest-example'),
    title: 'Example quest',
    summary: 'Placeholder until real quest data is collected.',
    steps: [
      { id: asId('step-1'), title: 'Meet the contact' },
      { id: asId('step-2'), title: 'Reach the marker', locationId: 'loc-vice-city-beach' },
    ],
  },
];

export class InMemoryQuestCatalog implements QuestCatalog {
  private readonly quests: Quest[];
  constructor(quests: Quest[] = seed) {
    this.quests = quests;
  }
  async findAll() {
    return this.quests;
  }
  async findById(id: QuestId) {
    return this.quests.find((q) => q.id === id);
  }
}

/** Swap for a Tauri-store / AsyncStorage / SQLite adapter later; the domain doesn't change. */
export class InMemoryQuestProgressStore implements QuestProgressStore {
  private readonly data = new Map<QuestId, QuestProgress>();
  async get(questId: QuestId) {
    return this.data.get(questId) ?? { questId, completedStepIds: [] };
  }
  async save(progress: QuestProgress) {
    this.data.set(progress.questId, progress);
  }
}
