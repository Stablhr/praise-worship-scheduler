import {useQuery} from '@tanstack/react-query';
import {listServices} from '@/lib/api/servicesApi';

/**
 * The services of a range of Manila days. The calendar asks for one month at a
 * time, so each month is cached on its own.
 */
export const servicesQueryKey = (from: string, to: string) =>
  ['services', from, to] as const;

export function useServicesQuery(from: string, to: string) {
  return useQuery({
    queryKey: servicesQueryKey(from, to),
    queryFn: () => listServices(from, to),
    staleTime: 30_000
  });
}
