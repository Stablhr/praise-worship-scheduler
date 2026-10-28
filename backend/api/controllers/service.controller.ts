import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../utils/error';
import {serviceService, toServiceDto} from '../services/service.service';

/**
 * Schedule routes are thin (backend/AGENTS.md): validate in the route, decide in
 * the service, shape the response here.
 */
export const serviceController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {from, to} = req.query as {from: string; to: string};
      const services = await serviceService.list(from, to);

      res.status(200).json({services: services.map(toServiceDto)});
    } catch (error) {
      next(error);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const {service, roles} = await serviceService.get(req.params.id);

      res.status(200).json({service: toServiceDto(service), roles});
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.create(req.body);

      res.status(201).json({service: toServiceDto(service)});
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.update(req.params.id, req.body);

      res.status(200).json({service: toServiceDto(service)});
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await serviceService.remove(req.params.id);

      res.status(200).json({message: 'Service removed'});
    } catch (error) {
      next(error);
    }
  },

  async setAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await serviceService.setAssignments(
        req.params.id,
        req.body.assignments
      );

      res.status(200).json({roles});
    } catch (error) {
      next(error);
    }
  },

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const {created, skipped} = await serviceService.generateWeeks(
        req.body.weeks ?? 8
      );

      res.status(201).json({
        created: created.map(toServiceDto),
        skipped
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;

      if (!file) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'No photo was uploaded');
      }

      const photoUrl = `/uploads/${file.filename}`;
      const service = await serviceService.setPhoto(req.params.id, photoUrl);

      res.status(200).json({service: toServiceDto(service)});
    } catch (error) {
      next(error);
    }
  },

  async removePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.removePhoto(req.params.id);

      res.status(200).json({service: toServiceDto(service)});
    } catch (error) {
      next(error);
    }
  }
};
