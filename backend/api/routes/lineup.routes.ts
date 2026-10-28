import {Router} from 'express';
import {lineupController} from '../controllers/lineup.controller';
import {validate} from '../middleware/validation';
import {
  addSongDto,
  reorderSongsDto,
  updateSongDto
} from '../dtos/lineup.dto';
import {requireAuth} from '../middleware/auth';
import {requirePermission} from '../middleware/permission';
import {defaultLimiter} from '../middleware/rateLimit';

const router = Router({mergeParams: true});

router.use(defaultLimiter, requireAuth);

// Every member can see the lineup (CONTEXT.md section 5)
router.get('/', requirePermission('admin', 'songleader', 'member'), lineupController.get);

// Only song leaders and admins add, edit, delete or reorder songs
router.post(
  '/songs',
  requirePermission('admin', 'songleader'),
  validate(addSongDto),
  lineupController.addSong
);

router.patch(
  '/songs/:songId',
  requirePermission('admin', 'songleader'),
  validate(updateSongDto),
  lineupController.updateSong
);

router.delete(
  '/songs/:songId',
  requirePermission('admin', 'songleader'),
  lineupController.deleteSong
);

router.put(
  '/songs/order',
  requirePermission('admin', 'songleader'),
  validate(reorderSongsDto),
  lineupController.reorderSongs
);

export default router;