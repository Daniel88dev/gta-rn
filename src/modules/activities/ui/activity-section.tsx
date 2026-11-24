import { View } from 'react-native';

import { useQuery } from '@/bootstrap/use-query';
import { ProgressRow } from '@/components/progress-row';

import type { GetActivitySummaryQuery } from '../application/get-activity-summary.query';
import type { ActivityGroup } from '../domain/activity';

export function ActivitySection({ group }: { readonly group: ActivityGroup }) {
  const { data } = useQuery<GetActivitySummaryQuery>({ type: 'activities/get-summary', group });
  return (
    <View>
      {data?.map((k) => (
        <ProgressRow
          key={k.kindId}
          name={k.name}
          done={k.done}
          known={k.known}
          expected={k.expected?.total}
        />
      ))}
    </View>
  );
}
