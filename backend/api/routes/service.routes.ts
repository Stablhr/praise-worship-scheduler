import {Router} from 'express';
import {serviceController} from '../controllers/service.controller';
import {validate, validateQuery} from '../middleware/validation';
import {
  createServiceDto,
  generateServicesDto,
  listServicesQueryDto,
  setAssignmentsDto,
  updateServiceDto
} from '../dtos/service.dto';
import {requireAuth} from '../middleware/auth';
import {requireAdmin, requireMember} from '../middleware/permission';
import {defaultLimiter} from '../middleware/rateLimit';
import {upload} from '../middleware/upload';

const router = Router();

router.use(defaultLimiter, requireAuth);

// Every member can see the schedule (CONTEXT.md section 5)
router.get(
  '/',
  requireMember,
  validateQuery(listServicesQueryDto),
  serviceController.list
);
router.get('/:id', requireMember, serviceController.get);

// Only the Chairman and Pastor add services or say who serves
router.post('/', requireAdmin, validate(createServiceDto), serviceController.create);
router.post(
  '/generate',
  requireAdmin,
  validate(generateServicesDto),
  serviceController.generate
);
router.patch(
  '/:id',
  requireAdmin,
  validate(updateServiceDto),
  serviceController.update
);
router.delete('/:id', requireAdmin, serviceController.remove);
router.put(
  '/:id/assignments',
  requireAdmin,
  validate(setAssignmentsDto),
  serviceController.setAssignments
);

// Photo upload (any member can paste a photo). Delete is admin only.
router.post(
  '/:id/photo',
  requireMember,
  upload.single('photo'),
  serviceController.uploadPhoto
);

router.delete('/:id/photo', requireAdmin, serviceController.removePhoto);

export default router;
