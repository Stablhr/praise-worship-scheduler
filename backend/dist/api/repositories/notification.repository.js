"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = void 0;
const Notification_model_1 = require("../models/Notification.model");
exports.notificationRepository = {
    /** All notifications for one member, newest first. */
    listByMember: (memberId) => Notification_model_1.NotificationModel.find({
        $or: [{ memberId: null }, { memberId }]
    })
        .sort({ createdAt: -1 })
        .limit(100)
        .exec(),
    /** Count of unread notifications for one member. */
    countUnread: (memberId) => Notification_model_1.NotificationModel.countDocuments({
        $or: [{ memberId: null }, { memberId }],
        readAt: null
    }).exec(),
    /** Creates one notification. */
    create: (data) => Notification_model_1.NotificationModel.create(data),
    /** Creates notifications for all members (memberId = null means "all"). */
    createForAll: (data) => Notification_model_1.NotificationModel.create({ ...data, memberId: null }),
    /** Marks one notification as read. */
    markRead: (id, memberId) => Notification_model_1.NotificationModel.findOneAndUpdate({
        _id: id,
        $or: [{ memberId: null }, { memberId }]
    }, { $set: { readAt: new Date() } }, { new: true }).exec(),
    /** Marks all notifications as read for one member. */
    markAllRead: (memberId) => Notification_model_1.NotificationModel.updateMany({
        $or: [{ memberId: null }, { memberId }],
        readAt: null
    }, { $set: { readAt: new Date() } }).exec(),
    /** Checks if a reminder was already sent for a service + kind + day. */
    existsForService: async (serviceId, kind, title) => {
        const count = await Notification_model_1.NotificationModel.countDocuments({
            serviceId,
            kind,
            title
        }).exec();
        return count > 0;
    }
};
