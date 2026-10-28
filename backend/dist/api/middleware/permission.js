"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireMember = exports.requirePermission = exports.ALL_MEMBER_PERMISSIONS = void 0;
const error_1 = require("../utils/error");
const errorCodes_1 = require("../constants/errorCodes");
const member_repository_1 = require("../repositories/member.repository");
/** Every permission level. Used for routes any member may reach. */
exports.ALL_MEMBER_PERMISSIONS = [
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
const requirePermission = (...allowed) => async (req, _res, next) => {
    try {
        if (!req.auth?.userId) {
            throw new error_1.ApiError(401, errorCodes_1.ErrorCodes.UNAUTHORIZED, 'Not authenticated');
        }
        const member = await member_repository_1.memberRepository.findById(req.auth.userId);
        if (!member) {
            throw new error_1.ApiError(401, errorCodes_1.ErrorCodes.MEMBER_NOT_FOUND, 'This account is no longer on the team list');
        }
        if (!allowed.includes(member.permission)) {
            throw new error_1.ApiError(403, errorCodes_1.ErrorCodes.FORBIDDEN, 'You do not have permission to do that');
        }
        req.member = member;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requirePermission = requirePermission;
/** Any signed-in team member. Excludes the older template accounts. */
exports.requireMember = (0, exports.requirePermission)(...exports.ALL_MEMBER_PERMISSIONS);
/** Chairman and Pastor only. */
exports.requireAdmin = (0, exports.requirePermission)('admin');
