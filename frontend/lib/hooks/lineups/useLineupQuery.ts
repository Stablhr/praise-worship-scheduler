import {useQuery} from '@tanstack/react-query';
import {getLineup} from '@/lib/api/lineupsApi';

export const lineupQueryKey = (serviceId: string) =>
  ['lineup', serviceId] as const;

/** The lineup (songs) for one service. */
export function useLineupQuery(serviceId: string, enabled = true) {
  return useQuery({
    queryKey: lineupQueryKey(serviceId),
    queryFn: () => getLineup(serviceId),
    staleTime: 15_000,
    enabled
  });
}