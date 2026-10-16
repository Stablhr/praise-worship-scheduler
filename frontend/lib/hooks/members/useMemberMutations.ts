import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  addMember,
  removeMember,
  updateMember,
  type MemberChanges,
  type NewMember
} from '@/lib/api/membersApi';
import {membersQueryKey} from './useMembersQuery';

/**
 * Adding, editing and removing all refresh the roster so the screen never shows
 * a stale row. Only admins can call these; the server rejects everyone else.
 */
function useRefreshMembers() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({queryKey: membersQueryKey});
}

export function useAddMember() {
  const refresh = useRefreshMembers();

  return useMutation({
    mutationFn: (input: NewMember) => addMember(input),
    onSuccess: refresh
  });
}

export function useUpdateMember() {
  const refresh = useRefreshMembers();

  return useMutation({
    mutationFn: ({
      id,
      changes
    }: {
      id: string;
      changes: MemberChanges;
    }) => updateMember(id, changes),
    onSuccess: refresh
  });
}

export function useRemoveMember() {
  const refresh = useRefreshMembers();

  return useMutation({
    mutationFn: (id: string) => removeMember(id),
    onSuccess: refresh
  });
}
