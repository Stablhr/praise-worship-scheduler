"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const validation_1 = require("../middleware/validation");
const settings_dto_1 = require("../dtos/settings.dto");
const auth_1 = require("../middleware/auth");
const permission_1 = require("../middleware/permission");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
router.use(rateLimit_1.defaultLimiter, auth_1.requireAuth);
// Any member can read settings.
router.get('/', (0, permission_1.requirePermission)('admin', 'songleader', 'member'), settings_controller_1.settingsController.get);
// Only admins can change system settings.
router.patch('/', (0, permission_1.requirePermission)('admin'), (0, validation_1.validate)(settings_dto_1.updateSettingsDto), settings_controller_1.settingsController.update);
exports.default = router;
