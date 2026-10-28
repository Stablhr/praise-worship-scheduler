"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_controller_1 = require("../controllers/service.controller");
const validation_1 = require("../middleware/validation");
const service_dto_1 = require("../dtos/service.dto");
const auth_1 = require("../middleware/auth");
const permission_1 = require("../middleware/permission");
const rateLimit_1 = require("../middleware/rateLimit");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(rateLimit_1.defaultLimiter, auth_1.requireAuth);
// Every member can see the schedule (CONTEXT.md section 5)
router.get('/', permission_1.requireMember, (0, validation_1.validateQuery)(service_dto_1.listServicesQueryDto), service_controller_1.serviceController.list);
router.get('/:id', permission_1.requireMember, service_controller_1.serviceController.get);
// Only the Chairman and Pastor add services or say who serves
router.post('/', permission_1.requireAdmin, (0, validation_1.validate)(service_dto_1.createServiceDto), service_controller_1.serviceController.create);
router.post('/generate', permission_1.requireAdmin, (0, validation_1.validate)(service_dto_1.generateServicesDto), service_controller_1.serviceController.generate);
router.patch('/:id', permission_1.requireAdmin, (0, validation_1.validate)(service_dto_1.updateServiceDto), service_controller_1.serviceController.update);
router.delete('/:id', permission_1.requireAdmin, service_controller_1.serviceController.remove);
router.put('/:id/assignments', permission_1.requireAdmin, (0, validation_1.validate)(service_dto_1.setAssignmentsDto), service_controller_1.serviceController.setAssignments);
// Photo upload (any member can paste a photo). Delete is admin only.
router.post('/:id/photo', permission_1.requireMember, upload_1.upload.single('photo'), service_controller_1.serviceController.uploadPhoto);
router.delete('/:id/photo', permission_1.requireAdmin, service_controller_1.serviceController.removePhoto);
exports.default = router;
