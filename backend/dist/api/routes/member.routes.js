"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const member_controller_1 = require("../controllers/member.controller");
const validation_1 = require("../middleware/validation");
const member_dto_1 = require("../dtos/member.dto");
const auth_1 = require("../middleware/auth");
const permission_1 = require("../middleware/permission");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
router.use(rateLimit_1.defaultLimiter, auth_1.requireAuth);
// Every member can see the team list (CONTEXT.md section 2)
router.get('/', permission_1.requireMember, member_controller_1.memberController.list);
// Only the Chairman and Pastor change the roster
router.post('/', permission_1.requireAdmin, (0, validation_1.validate)(member_dto_1.createMemberDto), member_controller_1.memberController.create);
router.patch('/:id', permission_1.requireAdmin, (0, validation_1.validate)(member_dto_1.updateMemberDto), member_controller_1.memberController.update);
router.delete('/:id', permission_1.requireAdmin, member_controller_1.memberController.remove);
exports.default = router;
