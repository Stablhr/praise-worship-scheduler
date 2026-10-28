"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberDto = exports.createMemberDto = exports.memberPermissionSchema = void 0;
const zod_1 = require("zod");
exports.memberPermissionSchema = zod_1.z.enum(['admin', 'songleader', 'member']);
const nameSchema = zod_1.z
    .string()
    .trim()
    .min(1, 'Please enter a name')
    .max(80, 'That name is too long');
const emailSchema = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(160, 'That email is too long');
/**
 * Positions come from CONTEXT.md section 3 (Chairman, Pastor and the Saturday
 * and Sunday roles). Free text on purpose: a new role should not need a server
 * change, and the Members screen groups by whatever values exist.
 */
const positionSchema = zod_1.z
    .string()
    .trim()
    .max(40, 'That position is too long');
exports.createMemberDto = zod_1.z.object({
    name: nameSchema,
    email: emailSchema,
    // Empty string means "no position yet".
    position: positionSchema.optional(),
    permission: exports.memberPermissionSchema.default('member')
});
exports.updateMemberDto = zod_1.z
    .object({
    name: nameSchema.optional(),
    position: positionSchema.optional(),
    permission: exports.memberPermissionSchema.optional()
})
    .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
});
