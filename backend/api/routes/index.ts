import Router from 'express';
import authRoutes from './auth.routes';
import memberRoutes from './member.routes';
import serviceRoutes from './service.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/services', serviceRoutes);

export default router;