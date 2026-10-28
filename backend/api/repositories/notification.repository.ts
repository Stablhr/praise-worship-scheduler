import {isValidObjectId} from 'mongoose';
import {NotificationDocument, NotificationModel} from '../models/Notification.model';

export const notificationRepository = {
  /** All notifications for one member, newest first. */
  listByMember: (memberId: string) =>
    NotificationModel.find({
      $or: [{memberId: null}, {memberId}]
    })
      .sort({createdAt: -1})
      .limit(100)
      .exec(),

  /** Count of unread notifications for one member. */
  countUnread: (memberId: string) =>
    NotificationModel.countDocuments({
      $or: [{memberId: null}, {memberId}],
      readAt: null
    }).exec(),

  /** Creates one notification. */
  create: (data: Partial<NotificationDocument>) =>
    NotificationModel.create(data),

  /** Creates notifications for all members (memberId = null means "all"). */
  createForAll: (data: Omit<Partial<NotificationDocument>, 'memberId'>) =>
    NotificationModel.create({...data, memberId: null}),

  /** Marks one notification as read. */
  markRead: (id: string, memberId: string) =>
    NotificationModel.findOneAndUpdate(
      {
        _id: id,
        $or: [{memberId: null}, {memberId}]
      },
      {$set: {readAt: new Date()}},
      {new: true}
    ).exec(),

  /** Marks all notifications as read for one member. */
  markAllRead: (memberId: string) =>
    NotificationModel.updateMany(
      {
        $or: [{memberId: null}, {memberId}],
        readAt: null
      },
      {$set: {readAt: new Date()}}
    ).exec(),

  /** Checks if a reminder was already sent for a service + kind + day. */
  existsForService: async (
    serviceId: string,
    kind: string,
    title: string
  ): Promise<boolean> => {
    const count = await NotificationModel.countDocuments({
      serviceId,
      kind,
      title
    }).exec();
    return count > 0;
  }
};