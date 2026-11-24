import type { Query, QueryHandler } from '../../../shared/cqrs';
import { APP_DISCLAIMER, type DataSource, type DataSourceRegistry } from '../domain/data-source';

export interface Credits {
  readonly disclaimer: string;
  readonly sources: readonly DataSource[];
}

export type GetCreditsQuery = Query<'sources/get-credits', Credits>;

export const getCreditsHandler =
  (registry: DataSourceRegistry): QueryHandler<GetCreditsQuery> =>
  async () => ({ disclaimer: APP_DISCLAIMER, sources: await registry.findAll() });
