"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberLoginDto = exports.memberRegisterDto = exports.changePasswordDto = exports.resendResetCodeDto = exports.resetPasswordDto = exports.forgotPasswordDto = exports.refreshDto = exports.loginDto = exports.resendVerificationDto = exports.verifyDto = exports.registerDto = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
exports.registerDto = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: passwordSchema,
    username: zod_1.z.string().min(1)
});
exports.verifyDto = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6) // always 6 digits from generateVerificationCode()
});
exports.resendVerificationDto = zod_1.z.object({
    email: zod_1.z.string().email()
});
exports.loginDto = zod_1.z.object({
    email: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1)
});
exports.refreshDto = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1).optional()
});
exports.forgotPasswordDto = zod_1.z.object({
    email: zod_1.z.string().email()
});
exports.resetPasswordDto = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
    newPassword: passwordSchema
});
exports.resendResetCodeDto = zod_1.z.object({
    email: zod_1.z.string().email()
});
exports.changePasswordDto = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: passwordSchema
});
exports.memberRegisterDto = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Please enter your name'),
    email: zod_1.z.string().trim().email('Please enter a valid email address'),
    password: passwordSchema,
    /** The position the person serves in. Free text, like the Members screen. */
    position: zod_1.z.string().trim().max(60).optional()
});
exports.memberLoginDto = zod_1.z.object({
    email: zod_1.z.string().trim().email('Please enter a valid email address'),
    password: zod_1.z.string().min(1, 'Please enter your password')
});
