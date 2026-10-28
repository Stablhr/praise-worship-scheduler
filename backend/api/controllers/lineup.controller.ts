import {Request, Response, NextFunction} from 'express';
import {lineupService, toLineupDto} from '../services/lineup.service';

/**
 * Lineup routes are thin (backend/AGENTS.md): validate in the route, decide in
 * the service, shape the response here.
 */
export const lineupController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const lineup = await lineupService.get(req.params.serviceId);

      res.status(200).json({lineup});
    } catch (error) {
      next(error);
    }
  },

  async addSong(req: Request, res: Response, next: NextFunction) {
    try {
      const addedBy = req.member?.id;
      const lineup = await lineupService.addSong(
        req.params.serviceId,
        req.body,
        addedBy
      );

      res.status(201).json({lineup});
    } catch (error) {
      next(error);
    }
  },

  async updateSong(req: Request, res: Response, next: NextFunction) {
    try {
      const lineup = await lineupService.updateSong(
        req.params.serviceId,
        req.params.songId,
        req.body
      );

      res.status(200).json({lineup});
    } catch (error) {
      next(error);
    }
  },

  async deleteSong(req: Request, res: Response, next: NextFunction) {
    try {
      const lineup = await lineupService.deleteSong(
        req.params.serviceId,
        req.params.songId
      );

      res.status(200).json({lineup});
    } catch (error) {
      next(error);
    }
  },

  async reorderSongs(req: Request, res: Response, next: NextFunction) {
    try {
      const lineup = await lineupService.reorderSongs(
        req.params.serviceId,
        req.body.songIds
      );

      res.status(200).json({lineup});
    } catch (error) {
      next(error);
    }
  }
};