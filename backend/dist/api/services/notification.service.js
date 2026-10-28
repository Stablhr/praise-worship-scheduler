"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
exports.toNotificationDto = toNotificationDto;
const mongoose_1 = __importDefault(require("mongoose"));
const error_1 = require("../utils/error");
const errorCodes_1 = require("../constants/errorCodes");
const notification_repository_1 = require("../repositories/notification.repository");
const service_repository_1 = require("../repositories/service.repository");
const manila_1 = require("../utils/manila");
const manila_2 = require("../utils/manila");
function toNotificationDto(n) {
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
exports.notificationService = {
    /** Lists notifications for one member, newest first. */
    async list(memberId) {
        const notifications = await notification_repository_1.notificationRepository.listByMember(memberId);
        return notifications.map(toNotificationDto);
    },
    /** Counts unread notifications for one member. */
    async countUnread(memberId) {
        return notification_repository_1.notificationRepository.countUnread(memberId);
    },
    /** Marks one notification as read. */
    async markRead(id, memberId) {
        const notification = await notification_repository_1.notificationRepository.markRead(id, memberId);
        if (!notification) {
            throw new error_1.ApiError(404, errorCodes_1.ErrorCodes.NOTIFICATION_NOT_FOUND, 'We could not find this notification');
        }
        return toNotificationDto(notification);
    },
    /** Marks all notifications as read for one member. */
    async markAllRead(memberId) {
        await notification_repository_1.notificationRepository.markAllRead(memberId);
    },
    /** Creates a notification for all members. */
    async notifyAll(input) {
        await notification_repository_1.notificationRepository.createForAll({
            kind: input.kind,
            title: input.title,
            body: input.body,
            serviceId: input.serviceId
                ? new mongoose_1.default.Types.ObjectId(input.serviceId)
                : undefined
        });
    },
    /** Creates a reminder notification for all members about an upcoming service. */
    async createReminder(serviceId, daysBefore) {
        const service = await service_repository_1.serviceRepository.findById(serviceId);
        if (!service)
            return;
        const title = `Service in ${daysBefore} day${daysBefore === 1 ? '' : 's'}`;
        // Don't send duplicate reminders.
        const exists = await notification_repository_1.notificationRepository.existsForService(serviceId, 'reminder', title);
        if (exists)
            return;
        const dateLabel = (0, manila_1.manilaDateKey)(service.date);
        const body = `The ${service.type === 'saturday' ? 'Saturday prayer meeting' : 'Sunday service'} on ${dateLabel} is coming up. Check your assignments and the lineup.`;
        await notification_repository_1.notificationRepository.createForAll({
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
    async runReminderJob() {
        const todayKey = (0, manila_1.manilaDateKey)(new Date());
        for (const daysBefore of [3, 2]) {
            const targetKey = (0, manila_2.addDays)(todayKey, daysBefore);
            const from = (0, manila_1.manilaInstant)(targetKey);
            const to = (0, manila_1.manilaInstant)((0, manila_2.addDays)(targetKey, 1));
            const services = await service_repository_1.serviceRepository.listBetween(from, to);
            for (const service of services) {
                await exports.notificationService.createReminder(service.id, daysBefore);
            }
        }
    },
    /** Notifies all members that a lineup changed. */
    async notifyLineupChanged(serviceId) {
        const service = await service_repository_1.serviceRepository.findById(serviceId);
        if (!service)
            return;
        await notification_repository_1.notificationRepository.createForAll({
            kind: 'lineup',
            title: 'Lineup updated',
            body: `The lineup for the ${service.type === 'saturday' ? 'Saturday prayer meeting' : 'Sunday service'} on ${(0, manila_1.manilaDateKey)(service.date)} has been updated.`,
            serviceId: service._id
        });
    },
    /** Notifies all members that assignments changed. */
    async notifyAssignmentsChanged(serviceId) {
        const service = await service_repository_1.serviceRepository.findById(serviceId);
        if (!service)
            return;
        await notification_repository_1.notificationRepository.createForAll({
            kind: 'assignment',
            title: 'Assignments updated',
            body: `The role assignments for the ${service.type === 'saturday' ? 'Saturday prayer meeting' : 'Sunday service'} on ${(0, manila_1.manilaDateKey)(service.date)} have been updated.`,
            serviceId: service._id
        });
    }
};
