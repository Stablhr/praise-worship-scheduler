import {Router} from 'express';
import {notificationController} from '../controllers/notification.controller';
import {requireAuth} from '../middleware/auth';
import {requirePermission} from '../middleware/permission';
import {defaultLimiter} from '../middleware/rateLimit';

const router = Router();

router.use(defaultLimiter, requireAuth);

// Every member can see their notifications.
router.get('/', requirePermission('admin', 'songleader', 'member'), notificationController.list);
router.get('/unread-count', requirePermission('admin', 'songleader', 'member'), notificationController.countUnread);

// Mark as read.
router.patch('/:id/read', requirePermission('admin', 'songleader', 'member'), notificationController.markRead);
router.patch('/read-all', requirePermission('admin', 'songleader', 'member'), notificationController.markAllRead);

export default router;