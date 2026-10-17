import {useQuery} from '@tanstack/react-query';
import {getService} from '@/lib/api/servicesApi';

export const serviceQueryKey = (id: string) => ['service', id] as const;

/** One service with every role and who holds it. */
export function useServiceQuery(id: string) {
  return useQuery({
    queryKey: serviceQueryKey(id),
    queryFn: () => getService(id),
    staleTime: 15_000
  });
}
