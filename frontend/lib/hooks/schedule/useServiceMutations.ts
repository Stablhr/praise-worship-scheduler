import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  createService,
  deleteService,
  generateServices,
  setAssignments,
  updateService,
  type AssignmentInput,
  type ServiceChanges,
  type ServiceInput
} from '@/lib/api/servicesApi';
import {serviceQueryKey} from './useServiceQuery';

/**
 * Anything that changes the schedule refreshes both the calendar views and the
 * open service, so no screen is left showing a stale picture. Only admins can
 * call these; the server rejects everyone else.
 */
function useRefreshSchedule() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({queryKey: ['services']});
  };
}

export function useCreateService() {
  const refresh = useRefreshSchedule();

  return useMutation({
    mutationFn: (input: ServiceInput) => createService(input),
    onSuccess: refresh
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, changes}: {id: string; changes: ServiceChanges}) =>
      updateService(id, changes),
    onSuccess: (service, {id}) => {
      queryClient.setQueryData(serviceQueryKey(id), previous =>
        previous ? {...previous, service} : previous
      );
      void queryClient.invalidateQueries({queryKey: ['services']});
    }
  });
}

export function useDeleteService() {
  const refresh = useRefreshSchedule();

  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: refresh
  });
}

export function useSetAssignments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      assignments
    }: {
      id: string;
      assignments: AssignmentInput[];
    }) => setAssignments(id, assignments),
    onSuccess: (roles, {id}) => {
      // The server returns the finished picture, so the screen updates at once.
      queryClient.setQueryData(serviceQueryKey(id), previous =>
        previous ? {...previous, roles} : previous
      );
    }
  });
}

export function useGenerateServices() {
  const refresh = useRefreshSchedule();

  return useMutation({
    mutationFn: (weeks?: number) => generateServices(weeks),
    onSuccess: refresh
  });
}
