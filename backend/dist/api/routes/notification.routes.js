"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const permission_1 = require("../middleware/permission");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
router.use(rateLimit_1.defaultLimiter, auth_1.requireAuth);
// Every member can see their notifications.
router.get('/', (0, permission_1.requirePermission)('admin', 'songleader', 'member'), notification_controller_1.notificationController.list);
router.get('/unread-count', (0, permission_1.requirePermission)('admin', 'songleader', 'member'), notification_controller_1.notificationController.countUnread);
// Mark as read.
router.patch('/:id/read', (0, permission_1.requirePermission)('admin', 'songleader', 'member'), notification_controller_1.notificationController.markRead);
router.patch('/read-all', (0, permission_1.requirePermission)('admin', 'songleader', 'member'), notification_controller_1.notificationController.markAllRead);
exports.default = router;
