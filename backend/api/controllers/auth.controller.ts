import {Request, Response, NextFunction} from 'express';
import {CookieOptions} from 'express';
import {authService} from '../services/auth.service';
import {memberService, toMemberProfile} from '../services/member.service';
import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {env} from '../config/env';
import {ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE} from '../constants/cookies';
import {upload} from '../middleware/upload';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE === 'true',
  sameSite: env.COOKIE_SAMESITE ?? 'lax',
  path: '/'
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setSessionCookies(
  res: Response,
  tokens: {accessToken: string; refreshToken: string}
) {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE
  });
}

export const authController = {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Not authenticated');
      }

      if (!req.auth.type) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Invalid token');
      }

      if (req.auth.type === 'member') {
        const member = await memberService.getProfile(req.auth.userId);
        res.status(200).json({user: toMemberProfile(member)});
        return;
      }

      res.status(200).json({
        user: {
          id: req.auth.userId,
          type: req.auth.type
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async patchMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Not authenticated');
      }

      if (req.auth.type !== 'member') {
        throw new ApiError(403, ErrorCodes.FORBIDDEN, 'Only members can update their profile');
      }

      const member = await memberService.updateProfile(req.auth.userId, req.body);
      res.status(200).json({user: toMemberProfile(member)});
    } catch (error) {
      next(error);
    }
  },

  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Not authenticated');
      }

      if (req.auth.type !== 'member') {
        throw new ApiError(403, ErrorCodes.FORBIDDEN, 'Only members can update their profile');
      }

      const file = req.file;

      if (!file) {
        throw new ApiError(400, ErrorCodes.VALIDATION_ERROR, 'No photo was uploaded');
      }

      const photoUrl = `/uploads/${file.filename}`;
      const member = await memberService.updateProfile(req.auth.userId, {photoUrl});

      res.status(200).json({user: toMemberProfile(member)});
    } catch (error) {
      next(error);
    }
  },

  async removePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Not authenticated');
      }

      if (req.auth.type !== 'member') {
        throw new ApiError(403, ErrorCodes.FORBIDDEN, 'Only members can update their profile');
      }

      const member = await memberService.updateProfile(req.auth.userId, {photoUrl: ''});

      res.status(200).json({user: toMemberProfile(member)});
    } catch (error) {
      next(error);
    }
  },

  async memberRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const {member, accessToken, refreshToken} =
        await memberService.register(req.body);

      setSessionCookies(res, {accessToken, refreshToken});

      res.status(201).json({user: toMemberProfile(member)});
    } catch (error) {
      next(error);
    }
  },

  async memberLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const {member, accessToken, refreshToken} = await memberService.login(
        req.body
      );

      setSessionCookies(res, {accessToken, refreshToken});

      res.status(200).json({user: toMemberProfile(member)});
    } catch (error) {
      next(error);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verify(req.body.email, req.body.code);
      res.status(200).json({message: 'Verified'});
    } catch (error) {
      next(error);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resendVerification(req.body.email);
      res.status(200).json({message: 'Verification code resent'});
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const {accessToken, refreshToken, user, userType} =
        await authService.login(req.body.email, req.body.password);

      setSessionCookies(res, {accessToken, refreshToken});

      res.status(200).json({
        user: {
          id: user._id.toString(),
          email: user.email,
          type: userType
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        (req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined) ??
        (req.body.refreshToken as string | undefined);

      if (!refreshToken) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Missing refresh token');
      }

      const result = await authService.refreshAccessToken(refreshToken);

      setSessionCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });

      res.status(200).json({message: 'Refreshed'});
    } catch (error) {
      const opts = COOKIE_OPTIONS;
      res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
      res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
      if (refreshToken) {
        authService.logout(refreshToken);
      }

      const opts = COOKIE_OPTIONS;
      res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
      res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
      res.status(200).json({message: 'Logged out'});
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res
        .status(200)
        .json({message: 'If that email exists, a reset code has been sent.'});
    } catch (error) {
      next(error);
    }
  },

  async verifyResetCode(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verifyResetCode(req.body.email, req.body.code);
      res.status(200).json({message: 'Code verified'});
    } catch (error) {
      next(error);
    }
  },

  async resendResetCode(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.status(200).json({message: 'Reset code resent'});
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(
        req.body.email,
        req.body.code,
        req.body.newPassword
      );
      res.status(200).json({message: 'Password reset successfully'});
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Not authenticated');
      }

      if (req.auth.type === 'member') {
        throw new ApiError(
          403,
          ErrorCodes.FORBIDDEN,
          'Password change is not available for team members yet'
        );
      }

      await authService.changePassword(
        req.auth.userId,
        req.auth.type ?? 'user',
        req.body.currentPassword,
        req.body.newPassword
      );

      res.status(200).json({message: 'Password changed successfully'});
    } catch (error) {
      next(error);
    }
  }
};
