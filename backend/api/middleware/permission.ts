import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {MemberDocument, MemberPermission} from '../models/Member.model';
import {memberRepository} from '../repositories/member.repository';

declare global {
  namespace Express {
    interface Request {
      /**
       * The signed-in team member, loaded by `requirePermission`.
       * Always trustworthy: it comes from the database, not from the token.
       */
      member?: MemberDocument;
    }
  }
}

/** Every permission level. Used for routes any member may reach. */
export const ALL_MEMBER_PERMISSIONS: MemberPermission[] = [
  'admin',
  'songleader',
  'member'
];

/**
 * The one place permissions are enforced (PLAN.md section 3).
 *
 * The JWT only says who signed in, so the permission is read from the database
 * on every request. That means changing someone's permission takes effect
 * immediately instead of waiting for their token to expire, and it can never be
 * faked by the client.
 *
 * Use after `requireAuth`.
 */
export const requirePermission =
  (...allowed: MemberPermission[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Not authenticated');
      }

      const member = await memberRepository.findById(req.auth.userId);

      if (!member) {
        throw new ApiError(
          401,
          ErrorCodes.MEMBER_NOT_FOUND,
          'This account is no longer on the team list'
        );
      }

      if (!allowed.includes(member.permission)) {
        throw new ApiError(
          403,
          ErrorCodes.FORBIDDEN,
          'You do not have permission to do that'
        );
      }

      req.member = member;
      next();
    } catch (error) {
      next(error);
    }
  };

/** Any signed-in team member. Excludes the older template accounts. */
export const requireMember = requirePermission(...ALL_MEMBER_PERMISSIONS);

/** Chairman and Pastor only. */
export const requireAdmin = requirePermission('admin');
