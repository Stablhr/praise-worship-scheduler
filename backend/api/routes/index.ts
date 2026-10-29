import Router from 'express';
import authRoutes from './auth.routes';
import memberRoutes from './member.routes';
import serviceRoutes from './service.routes';
import lineupRoutes from './lineup.routes';
import notificationRoutes from './notification.routes';
import settingsRoutes from './settings.routes';
import youtubeRoutes from './youtube.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/services', serviceRoutes);
router.use('/services/:serviceId/lineup', lineupRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/youtube', youtubeRoutes);

export default router;