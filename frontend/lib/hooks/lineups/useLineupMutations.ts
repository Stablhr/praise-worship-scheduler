import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  addSong,
  deleteSong,
  reorderSongs,
  updateSong,
  type SongChanges,
  type SongInput
} from '@/lib/api/lineupsApi';
import {lineupQueryKey} from './useLineupQuery';

function useRefreshLineup(serviceId: string) {
  const queryClient = useQueryClient();
  return (lineup: {serviceId: string; songs: unknown[]}) => {
    queryClient.setQueryData(lineupQueryKey(serviceId), lineup);
  };
}

export function useAddSong(serviceId: string) {
  const setLineup = useRefreshLineup(serviceId);

  return useMutation({
    mutationFn: (input: SongInput) => addSong(serviceId, input),
    onSuccess: setLineup
  });
}

export function useUpdateSong(serviceId: string) {
  const setLineup = useRefreshLineup(serviceId);

  return useMutation({
    mutationFn: ({songId, changes}: {songId: string; changes: SongChanges}) =>
      updateSong(serviceId, songId, changes),
    onSuccess: setLineup
  });
}

export function useDeleteSong(serviceId: string) {
  const setLineup = useRefreshLineup(serviceId);

  return useMutation({
    mutationFn: (songId: string) => deleteSong(serviceId, songId),
    onSuccess: setLineup
  });
}

export function useReorderSongs(serviceId: string) {
  const setLineup = useRefreshLineup(serviceId);

  return useMutation({
    mutationFn: (songIds: string[]) => reorderSongs(serviceId, songIds),
    onSuccess: setLineup
  });
}