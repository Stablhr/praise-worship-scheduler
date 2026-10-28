"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lineup_controller_1 = require("../controllers/lineup.controller");
const validation_1 = require("../middleware/validation");
const lineup_dto_1 = require("../dtos/lineup.dto");
const auth_1 = require("../middleware/auth");
const permission_1 = require("../middleware/permission");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(rateLimit_1.defaultLimiter, auth_1.requireAuth);
// Every member can see the lineup (CONTEXT.md section 5)
router.get('/', (0, permission_1.requirePermission)('admin', 'songleader', 'member'), lineup_controller_1.lineupController.get);
// Only song leaders and admins add, edit, delete or reorder songs
router.post('/songs', (0, permission_1.requirePermission)('admin', 'songleader'), (0, validation_1.validate)(lineup_dto_1.addSongDto), lineup_controller_1.lineupController.addSong);
router.patch('/songs/:songId', (0, permission_1.requirePermission)('admin', 'songleader'), (0, validation_1.validate)(lineup_dto_1.updateSongDto), lineup_controller_1.lineupController.updateSong);
router.delete('/songs/:songId', (0, permission_1.requirePermission)('admin', 'songleader'), lineup_controller_1.lineupController.deleteSong);
router.put('/songs/order', (0, permission_1.requirePermission)('admin', 'songleader'), (0, validation_1.validate)(lineup_dto_1.reorderSongsDto), lineup_controller_1.lineupController.reorderSongs);
exports.default = router;
