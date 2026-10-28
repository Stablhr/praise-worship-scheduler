import {httpClient} from './httpClient';

export type NotificationKind =
  | 'reminder'
  | 'lineup'
  | 'assignment'
  | 'schedule';

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  serviceId?: string;
  readAt?: string | null;
  createdAt: string;
};

export async function listNotifications(): Promise<Notification[]> {
  const res = await httpClient.get<{notifications: Notification[]}>(
    '/notifications'
  );
  return res.data.notifications;
}

export async function getUnreadCount(): Promise<number> {
  const res = await httpClient.get<{count: number}>(
    '/notifications/unread-count'
  );
  return res.data.count;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const res = await httpClient.patch<{notification: Notification}>(
    `/notifications/${id}/read`
  );
  return res.data.notification;
}

export async function markAllNotificationsRead(): Promise<void> {
  await httpClient.patch('/notifications/read-all');
}