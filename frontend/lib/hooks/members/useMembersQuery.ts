import {useQuery} from '@tanstack/react-query';
import {listMembers} from '@/lib/api/membersApi';

export const membersQueryKey = ['members'] as const;

/** The whole team, for the Members screen. */
export function useMembersQuery(options?: {enabled?: boolean}) {
  return useQuery({
    queryKey: membersQueryKey,
    queryFn: listMembers,
    staleTime: 30_000,
    enabled: options?.enabled ?? true
  });
}
