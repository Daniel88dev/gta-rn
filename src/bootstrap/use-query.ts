import { useCallback, useEffect, useState } from 'react';
import type { Query, QueryResult } from '../shared/cqrs';
import { useContainer } from './container-context';

/**
 * Runs a query through the bus and re-runs it when `key` changes or `refresh()` is called.
 * `key` should be a stable serialisation of the query (JSON.stringify is fine for small queries).
 */
export function useQuery<Q extends Query>(query: Q, key = JSON.stringify(query)) {
  const { queries } = useContainer();
  const [data, setData] = useState<QueryResult<Q> | undefined>(undefined);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queries.ask<Q>(query).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
    // The query object is captured through `key` on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries, key, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { data, refresh };
}
