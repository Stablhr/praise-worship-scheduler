import {z} from 'zod';
import {MemberPermission} from '../models/Member.model';

export const memberPermissionSchema = z.enum(['admin', 'songleader', 'member']);

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a name')
  .max(80, 'That name is too long');

const emailSchema = z
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
const positionSchema = z
  .string()
  .trim()
  .max(40, 'That position is too long');

export const createMemberDto = z.object({
  name: nameSchema,
  email: emailSchema,
  // Empty string means "no position yet".
  position: positionSchema.optional(),
  permission: memberPermissionSchema.default('member')
});

export const updateMemberDto = z
  .object({
    name: nameSchema.optional(),
    position: positionSchema.optional(),
    permission: memberPermissionSchema.optional()
  })
  .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
  });

export type CreateMemberDto = z.infer<typeof createMemberDto>;
export type UpdateMemberDto = z.infer<typeof updateMemberDto>;
export type MemberPermissionDto = MemberPermission;
