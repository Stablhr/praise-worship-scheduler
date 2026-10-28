"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const error_1 = require("../utils/error");
const notification_service_1 = require("../services/notification.service");
exports.notificationController = {
    async list(req, res, next) {
        try {
            const memberId = req.member?.id ?? req.auth?.userId;
            if (!memberId) {
                throw new error_1.ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
            }
            const notifications = await notification_service_1.notificationService.list(memberId);
            res.status(200).json({ notifications });
        }
        catch (error) {
            next(error);
        }
    },
    async countUnread(req, res, next) {
        try {
            const memberId = req.member?.id ?? req.auth?.userId;
            if (!memberId) {
                throw new error_1.ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
            }
            const count = await notification_service_1.notificationService.countUnread(memberId);
            res.status(200).json({ count });
        }
        catch (error) {
            next(error);
        }
    },
    async markRead(req, res, next) {
        try {
            const memberId = req.member?.id ?? req.auth?.userId;
            if (!memberId) {
                throw new error_1.ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
            }
            const notification = await notification_service_1.notificationService.markRead(req.params.id, memberId);
            res.status(200).json({ notification });
        }
        catch (error) {
            next(error);
        }
    },
    async markAllRead(req, res, next) {
        try {
            const memberId = req.member?.id ?? req.auth?.userId;
            if (!memberId) {
                throw new error_1.ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
            }
            await notification_service_1.notificationService.markAllRead(memberId);
            res.status(200).json({ message: 'All notifications marked as read' });
        }
        catch (error) {
            next(error);
        }
    }
};
