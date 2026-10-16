import {Router} from 'express';
import {memberController} from '../controllers/member.controller';
import {validate} from '../middleware/validation';
import {createMemberDto, updateMemberDto} from '../dtos/member.dto';
import {requireAuth} from '../middleware/auth';
import {requireAdmin, requireMember} from '../middleware/permission';
import {defaultLimiter} from '../middleware/rateLimit';

const router = Router();

router.use(defaultLimiter, requireAuth);

// Every member can see the team list (CONTEXT.md section 2)
router.get('/', requireMember, memberController.list);

// Only the Chairman and Pastor change the roster
router.post('/', requireAdmin, validate(createMemberDto), memberController.create);
router.patch(
  '/:id',
  requireAdmin,
  validate(updateMemberDto),
  memberController.update
);
router.delete('/:id', requireAdmin, memberController.remove);

export default router;
