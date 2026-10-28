import {useQuery} from '@tanstack/react-query';
import {getUnreadCount, listNotifications} from '@/lib/api/notificationsApi';

export const notificationsQueryKey = ['notifications'] as const;
export const unreadCountQueryKey = ['notifications', 'unread-count'] as const;

/** All notifications for the signed-in member. */
export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: listNotifications,
    staleTime: 15_000
  });
}

/** Count of unread notifications (for the bell badge). */
export function useUnreadCountQuery() {
  return useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: getUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000
  });
}