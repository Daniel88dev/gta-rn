/**
 * Composition root: the only place that knows concrete adapters.
 * UI code talks to the buses, never to repositories directly.
 */
import { CommandBus, QueryBus } from '../shared/cqrs';
import { getLocationsHandler, type GetLocationsQuery } from '../modules/map/application/get-locations.query';
import { InMemoryLocationRepository } from '../modules/map/infrastructure/in-memory-location-repository';
import {
  completeQuestStepHandler,
  type CompleteQuestStepCommand,
} from '../modules/quests/application/complete-quest-step.command';
import {
  getQuestListHandler,
  type GetQuestListQuery,
} from '../modules/quests/application/get-quest-list.query';
import { InMemoryQuestCatalog, InMemoryQuestProgressStore } from '../modules/quests/infrastructure/in-memory';

export const createContainer = () => {
  const commands = new CommandBus();
  const queries = new QueryBus();

  const locations = new InMemoryLocationRepository();
  const questCatalog = new InMemoryQuestCatalog();
  const questProgress = new InMemoryQuestProgressStore();

  queries.register<GetLocationsQuery>('map/get-locations', getLocationsHandler(locations));
  queries.register<GetQuestListQuery>('quests/get-list', getQuestListHandler(questCatalog, questProgress));
  commands.register<CompleteQuestStepCommand>(
    'quests/complete-step',
    completeQuestStepHandler(questCatalog, questProgress),
  );

  return { commands, queries };
};

export type Container = ReturnType<typeof createContainer>;
