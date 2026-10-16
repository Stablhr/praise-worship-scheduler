import {Request, Response, NextFunction} from 'express';
import {memberService, toMemberProfile} from '../services/member.service';

/**
 * Members routes are thin (backend/AGENTS.md): validate in the route, decide in
 * the service, shape the response here. `req.member` is set by requirePermission
 * on the admin-only routes.
 */
export const memberController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const members = await memberService.list();

      res.status(200).json({members: members.map(toMemberProfile)});
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await memberService.add(req.body);

      res.status(201).json({member: toMemberProfile(member)});
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await memberService.update(req.params.id, req.body);

      res.status(200).json({member: toMemberProfile(member)});
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await memberService.remove(req.params.id, req.member?.id ?? '');

      res.status(200).json({message: 'Member removed'});
    } catch (error) {
      next(error);
    }
  }
};
