import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../utils/error';
import {youtubeService} from '../services/youtube.service';

export const youtubeController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const rawQuery = req.query.q;
      const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

      if (query.length < 2) {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Please enter at least 2 characters to search.'
        );
      }

      const results = await youtubeService.searchVideos(query);
      res.status(200).json({results});
    } catch (error) {
      next(error);
    }
  }
};