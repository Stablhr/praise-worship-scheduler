import mongoose from 'mongoose';
import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {NotificationDocument} from '../models/Notification.model';
import {notificationRepository} from '../repositories/notification.repository';
import {memberRepository} from '../repositories/member.repository';
import {serviceRepository} from '../repositories/service.repository';
import {manilaDateKey, manilaInstant} from '../utils/manila';
import {addDays} from '../utils/manila';

export type NotificationDto = {
  id: string;
  kind: string;
  title: string;
  body: string;
  serviceId?: string;
  readAt?: string | null;
  createdAt: string;
};

export function toNotificationDto(n: NotificationDocument): NotificationDto {
  return {
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    serviceId: n.serviceId?.toString(),
    readAt: n.readAt ? n.readAt.toISOString() : null,
    createdAt: n.createdAt.toISOString()
  };
}

export const notificationService = {
  /** Lists notifications for one member, newest first. */
  async list(memberId: string): Promise<NotificationDto[]> {
    const notifications = await notificationRepository.listByMember(memberId);
    return notifications.map(toNotificationDto);
  },

  /** Counts unread notifications for one member. */
  async countUnread(memberId: string): Promise<number> {
    return notificationRepository.countUnread(memberId);
  },

  /** Marks one notification as read. */
  async markRead(id: string, memberId: string): Promise<NotificationDto> {
    const notification = await notificationRepository.markRead(id, memberId);

    if (!notification) {
      throw new ApiError(
        404,
        ErrorCodes.NOTIFICATION_NOT_FOUND,
        'We could not find this notification'
      );
    }

    return toNotificationDto(notification);
  },

  /** Marks all notifications as read for one member. */
  async markAllRead(memberId: string): Promise<void> {
    await notificationRepository.markAllRead(memberId);
  },

  /** Creates a notification for all members. */
  async notifyAll(input: {
    kind: string;
    title: string;
    body: string;
    serviceId?: string;
  }): Promise<void> {
    await notificationRepository.createForAll({
      kind: input.kind as NotificationDocument['kind'],
      title: input.title,
      body: input.body,
      serviceId: input.serviceId
        ? new mongoose.Types.ObjectId(input.serviceId)
        : undefined
    });
  },

  /** Creates a reminder notification for all members about an upcoming service. */
  async createReminder(serviceId: string, daysBefore: number): Promise<void> {
    const service = await serviceRepository.findById(serviceId);

    if (!service) return;

    const title = `Service in ${daysBefore} day${daysBefore === 1 ? '' : 's'}`;

    // Don't send duplicate reminders.
    const exists = await notificationRepository.existsForService(
      serviceId,
      'reminder',
      title
    );

    if (exists) return;

    const dateLabel = manilaDateKey(service.date);
    const body = `The ${service.type === 'saturday' ? 'Saturday prayer meeting' : 'Sunday service'} on ${dateLabel} is coming up. Check your assignments and the lineup.`;

    await notificationRepository.createForAll({
      kind: 'reminder',
      title,
      body,
      serviceId: service._id
    });
  },

  /**
   * Runs the daily reminder job. Creates reminders for services 3 and 2 days
   * ahead (Asia/Manila). Safe to run repeatedly — duplicates are skipped.
   */
  async runReminderJob(): Promise<void> {
    const todayKey = manilaDateKey(new Date());

    for (const daysBefore of [3, 2]) {
      const targetKey = addDays(todayKey, daysBefore);
      const from = manilaInstant(targetKey);
      const to = manilaInstant(addDays(targetKey, 1));

      const services = await serviceRepository.listBetween(from, to);

      for (const service of services) {
        await notificationService.createReminder(service.id, daysBefore);
      }
    }
  },

  /** Notifies all members that a lineup changed. */
  async notifyLineupChanged(serviceId: string): Promise<void> {
    const service = await serviceRepository.findById(serviceId);

    if (!service) return;

    await notificationRepository.createForAll({
      kind: 'lineup',
      title: 'Lineup updated',
      body: `The lineup for the ${service.type === 'saturday' ? 'Saturday prayer meeting' : 'Sunday service'} on ${manilaDateKey(service.date)} has been updated.`,
      serviceId: service._id
    });
  },

  /** Notifies all members that assignments changed. */
  async notifyAssignmentsChanged(serviceId: string): Promise<void> {
    const service = await serviceRepository.findById(serviceId);

    if (!service) return;

    await notificationRepository.createForAll({
      kind: 'assignment',
      title: 'Assignments updated',
      body: `The role assignments for the ${service.type === 'saturday' ? 'Saturday prayer meeting' : 'Sunday service'} on ${manilaDateKey(service.date)} have been updated.`,
      serviceId: service._id
    });
  }
};