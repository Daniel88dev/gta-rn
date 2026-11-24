import type { Query, QueryHandler } from '../../../shared/cqrs';
import type { ActivityExpectedTotal, ActivityGroup, ActivityKindId } from '../domain/activity';
import type { ActivityCatalog, ActivityLogStore } from '../domain/repositories';

export interface ActivityKindSummary {
  readonly kindId: ActivityKindId;
  readonly name: string;
  readonly group: ActivityGroup;
  readonly done: number;
  readonly known: number;
  readonly expected?: ActivityExpectedTotal;
}

export interface GetActivitySummaryQuery extends Query<
  'activities/get-summary',
  readonly ActivityKindSummary[]
> {
  readonly group?: ActivityGroup;
}

export const getActivitySummaryHandler =
  (catalog: ActivityCatalog, store: ActivityLogStore): QueryHandler<GetActivitySummaryQuery> =>
  async ({ group }) => {
    const [kinds, items, log] = await Promise.all([catalog.kinds(), catalog.findAll(), store.get()]);
    const done = new Set(log.doneIds);
    return kinds
      .filter((k) => !group || k.group === group)
      .map((k) => {
        const ofKind = items.filter((a) => a.kindId === k.id);
        return {
          kindId: k.id,
          name: k.name,
          group: k.group,
          known: ofKind.length,
          done: ofKind.filter((a) => done.has(a.id)).length,
          expected: k.expected,
        };
      });
  };
