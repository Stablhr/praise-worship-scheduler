'use client';

import {useState} from 'react';
import {Bell, CheckCheck} from 'lucide-react';
import {EmptyState} from '@/components/app/EmptyState';
import {ErrorState} from '@/components/app/ErrorState';

import {ScreenHeader} from '@/components/app/ScreenHeader';
import {Skeleton} from '@/components/ui/skeleton';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {markAllNotificationsRead, markNotificationRead} from '@/lib/api/notificationsApi';

import {
  notificationsQueryKey,
  unreadCountQueryKey,
  useNotificationsQuery
} from '@/lib/hooks/notifications/useNotificationsQuery';
import {useQueryClient} from '@tanstack/react-query';

/** Notifications screen (DESIGN.md section 6.8). */
export default function NotificationsPage() {

  const queryClient = useQueryClient();
  const {data, isPending, isError, error, refetch} = useNotificationsQuery();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const notifications = data ?? [];

  async function handleMarkAllRead() {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      void queryClient.invalidateQueries({queryKey: notificationsQueryKey});
      void queryClient.invalidateQueries({queryKey: unreadCountQueryKey});
    } catch {
      // Silently fail; the list will still show.
    } finally {
      setIsMarkingAll(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      void queryClient.invalidateQueries({queryKey: notificationsQueryKey});
      void queryClient.invalidateQueries({queryKey: unreadCountQueryKey});
    } catch {
      // Silently fail.
    }
  }

  if (isPending) return <NotificationsSkeleton />;

  if (isError) {
    return (
      <>
        <ScreenHeader title="Notifications" backHref="/more" />
        <div className="mx-auto w-full max-w-[480px] px-4 py-6">
          <ErrorState
            message={getFriendlyErrorMessage(
              error,
              'We could not load your notifications. Please try again.'
            )}
            onRetry={() => refetch()}
          />
        </div>
      </>
    );
  }

  const hasUnread = notifications.some(n => !n.readAt);

  return (
    <>
      <ScreenHeader
        title="Notifications"
        backHref="/more"
        action={
          hasUnread ? (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={isMarkingAll}
              aria-label="Mark all as read"
              className="flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-150 ease-out active:bg-muted-surface disabled:opacity-60"
            >
              <CheckCheck className="size-5" aria-hidden="true" />
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-[480px] px-4 py-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Reminders, lineup changes and assignment updates will appear here."
          />
        ) : (
          <ul className="space-y-2">
            {notifications.map(notification => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!notification.readAt) void handleMarkRead(notification.id);
                  }}
                  className={`w-full rounded-card border border-border bg-surface p-4 text-left shadow-card transition-colors duration-150 ease-out ${
                    !notification.readAt ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.readAt && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-text">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-muted">
                        {notification.body}
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

function NotificationsSkeleton() {
  return (
    <>
      <ScreenHeader title="Notifications" backHref="/more" />
      <div className="mx-auto w-full max-w-[480px] space-y-3 px-4 py-4">
        {[0, 1, 2].map(row => (
          <Skeleton key={row} className="h-[88px] w-full rounded-card" />
        ))}
      </div>
    </>
  );
}