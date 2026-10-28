"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceController = void 0;
const error_1 = require("../utils/error");
const service_service_1 = require("../services/service.service");
/**
 * Schedule routes are thin (backend/AGENTS.md): validate in the route, decide in
 * the service, shape the response here.
 */
exports.serviceController = {
    async list(req, res, next) {
        try {
            const { from, to } = req.query;
            const services = await service_service_1.serviceService.list(from, to);
            res.status(200).json({ services: services.map(service_service_1.toServiceDto) });
        }
        catch (error) {
            next(error);
        }
    },
    async get(req, res, next) {
        try {
            const { service, roles } = await service_service_1.serviceService.get(req.params.id);
            res.status(200).json({ service: (0, service_service_1.toServiceDto)(service), roles });
        }
        catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            const service = await service_service_1.serviceService.create(req.body);
            res.status(201).json({ service: (0, service_service_1.toServiceDto)(service) });
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const service = await service_service_1.serviceService.update(req.params.id, req.body);
            res.status(200).json({ service: (0, service_service_1.toServiceDto)(service) });
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await service_service_1.serviceService.remove(req.params.id);
            res.status(200).json({ message: 'Service removed' });
        }
        catch (error) {
            next(error);
        }
    },
    async setAssignments(req, res, next) {
        try {
            const roles = await service_service_1.serviceService.setAssignments(req.params.id, req.body.assignments);
            res.status(200).json({ roles });
        }
        catch (error) {
            next(error);
        }
    },
    async generate(req, res, next) {
        try {
            const { created, skipped } = await service_service_1.serviceService.generateWeeks(req.body.weeks ?? 8);
            res.status(201).json({
                created: created.map(service_service_1.toServiceDto),
                skipped
            });
        }
        catch (error) {
            next(error);
        }
    },
    async uploadPhoto(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                throw new error_1.ApiError(400, 'VALIDATION_ERROR', 'No photo was uploaded');
            }
            const photoUrl = `/uploads/${file.filename}`;
            const service = await service_service_1.serviceService.setPhoto(req.params.id, photoUrl);
            res.status(200).json({ service: (0, service_service_1.toServiceDto)(service) });
        }
        catch (error) {
            next(error);
        }
    },
    async removePhoto(req, res, next) {
        try {
            const service = await service_service_1.serviceService.removePhoto(req.params.id);
            res.status(200).json({ service: (0, service_service_1.toServiceDto)(service) });
        }
        catch (error) {
            next(error);
        }
    }
};
