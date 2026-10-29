import {Router} from 'express';
import {youtubeController} from '../controllers/youtube.controller';
import {requireAuth} from '../middleware/auth';
import {defaultLimiter} from '../middleware/rateLimit';

const router = Router();

router.use(defaultLimiter, requireAuth);

router.get('/search', youtubeController.search);
router.get('/video', youtubeController.video);

export default router;