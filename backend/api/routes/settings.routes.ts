import {Router} from 'express';
import {settingsController} from '../controllers/settings.controller';
import {validate} from '../middleware/validation';
import {updateSettingsDto} from '../dtos/settings.dto';
import {requireAuth} from '../middleware/auth';
import {requirePermission} from '../middleware/permission';
import {defaultLimiter} from '../middleware/rateLimit';

const router = Router();

router.use(defaultLimiter, requireAuth);

// Any member can read settings.
router.get('/', requirePermission('admin', 'songleader', 'member'), settingsController.get);

// Only admins can change system settings.
router.patch(
  '/',
  requirePermission('admin'),
  validate(updateSettingsDto),
  settingsController.update
);

export default router;