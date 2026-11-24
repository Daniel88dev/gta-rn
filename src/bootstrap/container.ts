/**
 * Composition root: the only place that knows concrete adapters.
 * UI code talks to the buses, never to repositories directly.
 * Kept identical in the desktop and mobile apps; each app only differs in how it loads content (see load-content.ts).
 */
import type { AtlasContent, GuideContent } from '../content/format';
import { DATA_SOURCES } from '../content/data-sources';
import { CommandBus, QueryBus } from '../shared/cqrs';
import { BLANK_BASE_MAP, type BaseMap } from '../modules/map/domain/base-map';
import { getBaseMapHandler, type GetBaseMapQuery } from '../modules/map/application/get-base-map.query';
import { getLegendHandler, type GetLegendQuery } from '../modules/map/application/get-legend.query';
import {
  getLocationDetailsHandler,
  type GetLocationDetailsQuery,
} from '../modules/map/application/get-location-details.query';
import { getMarkersHandler, type GetMarkersQuery } from '../modules/map/application/get-markers.query';
import {
  getRegionLabelsHandler,
  type GetRegionLabelsQuery,
} from '../modules/map/application/get-region-labels.query';
import { hydrateAtlas } from '../modules/map/infrastructure/atlas-content';
import {
  InMemoryAtlasReferenceData,
  InMemoryLocationRepository,
} from '../modules/map/infrastructure/in-memory-atlas';
import {
  completeQuestStepHandler,
  type CompleteQuestStepCommand,
} from '../modules/quests/application/complete-quest-step.command';
import {
  getQuestListHandler,
  type GetQuestListQuery,
} from '../modules/quests/application/get-quest-list.query';
import {
  setQuestCompletedHandler,
  type SetQuestCompletedCommand,
} from '../modules/quests/application/set-quest-completed.command';
import { InMemoryQuestCatalog, InMemoryQuestProgressStore } from '../modules/quests/infrastructure/in-memory';
import { hydrateQuest } from '../modules/quests/infrastructure/quest-content';
import {
  getCollectiblesAtLocationHandler,
  type GetCollectiblesAtLocationQuery,
} from '../modules/collectibles/application/get-collectibles-at-location.query';
import {
  getCollectionStatsHandler,
  type GetCollectionStatsQuery,
} from '../modules/collectibles/application/get-collection-stats.query';
import {
  setCollectibleFoundHandler,
  type SetCollectibleFoundCommand,
} from '../modules/collectibles/application/set-collectible-found.command';
import {
  hydrateCollectible,
  hydrateCollectibleSet,
} from '../modules/collectibles/infrastructure/collectible-content';
import {
  InMemoryCollectibleCatalog,
  InMemoryCollectionProgressStore,
} from '../modules/collectibles/infrastructure/in-memory';
import {
  getActivitiesAtLocationHandler,
  type GetActivitiesAtLocationQuery,
} from '../modules/activities/application/get-activities-at-location.query';
import {
  getActivitySummaryHandler,
  type GetActivitySummaryQuery,
} from '../modules/activities/application/get-activity-summary.query';
import {
  setActivityDoneHandler,
  type SetActivityDoneCommand,
} from '../modules/activities/application/set-activity-done.command';
import { hydrateActivity, hydrateActivityKind } from '../modules/activities/infrastructure/activity-content';
import {
  InMemoryActivityCatalog,
  InMemoryActivityLogStore,
} from '../modules/activities/infrastructure/in-memory';
import { getCreditsHandler, type GetCreditsQuery } from '../modules/sources/application/get-credits.query';
import { StaticDataSourceRegistry } from '../modules/sources/infrastructure/static-data-source-registry';

export interface AppContent {
  readonly atlas: AtlasContent;
  readonly guide: GuideContent;
}

export interface ContainerOptions {
  /** Which imagery to draw under the pins. Defaults to a blank grid until a licensed base map is chosen. */
  readonly baseMap?: BaseMap;
}

export const createContainer = (content: AppContent, options: ContainerOptions = {}) => {
  const commands = new CommandBus();
  const queries = new QueryBus();

  // Map (atlas)
  const atlas = hydrateAtlas(content.atlas);
  const locations = new InMemoryLocationRepository(atlas.locations);
  const reference = new InMemoryAtlasReferenceData(atlas);
  queries.register<GetMarkersQuery>('map/get-markers', getMarkersHandler(locations, reference));
  queries.register<GetLocationDetailsQuery>(
    'map/get-location-details',
    getLocationDetailsHandler(locations, reference),
  );
  queries.register<GetLegendQuery>('map/get-legend', getLegendHandler(locations, reference));
  queries.register<GetRegionLabelsQuery>(
    'map/get-region-labels',
    getRegionLabelsHandler(locations, reference),
  );
  queries.register<GetBaseMapQuery>('map/get-base-map', getBaseMapHandler(options.baseMap ?? BLANK_BASE_MAP));

  // Missions
  const questCatalog = new InMemoryQuestCatalog(content.guide.missions.map(hydrateQuest));
  const questProgress = new InMemoryQuestProgressStore();
  queries.register<GetQuestListQuery>('quests/get-list', getQuestListHandler(questCatalog, questProgress));
  commands.register<CompleteQuestStepCommand>(
    'quests/complete-step',
    completeQuestStepHandler(questCatalog, questProgress),
  );
  commands.register<SetQuestCompletedCommand>(
    'quests/set-completed',
    setQuestCompletedHandler(questCatalog, questProgress),
  );

  // Collectibles
  const collectibleCatalog = new InMemoryCollectibleCatalog(
    content.guide.collectibleSets.map(hydrateCollectibleSet),
    content.guide.collectibles.map(hydrateCollectible),
  );
  const collection = new InMemoryCollectionProgressStore();
  queries.register<GetCollectionStatsQuery>(
    'collectibles/get-stats',
    getCollectionStatsHandler(collectibleCatalog, collection),
  );
  queries.register<GetCollectiblesAtLocationQuery>(
    'collectibles/get-at-location',
    getCollectiblesAtLocationHandler(collectibleCatalog, collection),
  );
  commands.register<SetCollectibleFoundCommand>(
    'collectibles/set-found',
    setCollectibleFoundHandler(collectibleCatalog, collection),
  );

  // Activities
  const activityCatalog = new InMemoryActivityCatalog(
    content.guide.activityKinds.map(hydrateActivityKind),
    content.guide.activities.map(hydrateActivity),
  );
  const activityLog = new InMemoryActivityLogStore();
  queries.register<GetActivitySummaryQuery>(
    'activities/get-summary',
    getActivitySummaryHandler(activityCatalog, activityLog),
  );
  queries.register<GetActivitiesAtLocationQuery>(
    'activities/get-at-location',
    getActivitiesAtLocationHandler(activityCatalog, activityLog),
  );
  commands.register<SetActivityDoneCommand>(
    'activities/set-done',
    setActivityDoneHandler(activityCatalog, activityLog),
  );

  // Sources and credits
  queries.register<GetCreditsQuery>(
    'sources/get-credits',
    getCreditsHandler(new StaticDataSourceRegistry(DATA_SOURCES)),
  );

  return { commands, queries };
};

export type Container = ReturnType<typeof createContainer>;
