import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../utils/error';
import {notificationService, toNotificationDto} from '../services/notification.service';

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.member?.id ?? req.auth?.userId;

      if (!memberId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
      }

      const notifications = await notificationService.list(memberId);

      res.status(200).json({notifications});
    } catch (error) {
      next(error);
    }
  },

  async countUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.member?.id ?? req.auth?.userId;

      if (!memberId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
      }

      const count = await notificationService.countUnread(memberId);

      res.status(200).json({count});
    } catch (error) {
      next(error);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.member?.id ?? req.auth?.userId;

      if (!memberId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
      }

      const notification = await notificationService.markRead(
        req.params.id,
        memberId
      );

      res.status(200).json({notification});
    } catch (error) {
      next(error);
    }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.member?.id ?? req.auth?.userId;

      if (!memberId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
      }

      await notificationService.markAllRead(memberId);

      res.status(200).json({message: 'All notifications marked as read'});
    } catch (error) {
      next(error);
    }
  }
};