import { View } from 'react-native';

import { useQuery } from '@/bootstrap/use-query';
import { ProgressRow } from '@/components/progress-row';

import type { GetCollectionStatsQuery } from '../application/get-collection-stats.query';

export function CollectionSection() {
  const { data } = useQuery<GetCollectionStatsQuery>({ type: 'collectibles/get-stats' });
  return (
    <View>
      {data?.map((s) => (
        <ProgressRow
          key={s.setId}
          name={s.name}
          done={s.found}
          known={s.known}
          expected={s.expected?.total}
        />
      ))}
    </View>
  );
}
