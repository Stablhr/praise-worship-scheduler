import Router from 'express';
import authRoutes from './auth.routes';
import memberRoutes from './member.routes';
import serviceRoutes from './service.routes';
import lineupRoutes from './lineup.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/services', serviceRoutes);
router.use('/services/:serviceId/lineup', lineupRoutes);

export default router;