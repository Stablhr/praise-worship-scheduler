import {z} from 'zod';
import {isDateKey, isValidTime} from '../utils/manila';

const serviceTypeSchema = z.enum(['saturday', 'sunday']);

/** A Manila calendar day, such as "2026-10-24". */
const dateKeySchema = z
  .string()
  .refine(isDateKey, 'Please choose a valid date');

/** A Manila start time, such as "15:00". */
const timeSchema = z.string().refine(isValidTime, 'Please choose a valid time');

const notesSchema = z.string().trim().max(200, 'Those notes are too long');

export const createServiceDto = z.object({
  type: serviceTypeSchema,
  date: dateKeySchema,
  // Missing means "use the default time for this type of service".
  time: timeSchema.optional(),
  notes: notesSchema.optional()
});

export const updateServiceDto = z
  .object({
    type: serviceTypeSchema.optional(),
    date: dateKeySchema.optional(),
    time: timeSchema.optional(),
    notes: notesSchema.optional()
  })
  .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
  });

export const listServicesQueryDto = z
  .object({
    from: dateKeySchema,
    to: dateKeySchema
  })
  .refine(value => value.from <= value.to, {
    message: 'The end date must not be before the start date'
  });

const assignmentSchema = z.object({
  role: z.string().trim().min(1, 'Please choose a role'),
  memberId: z.string().trim().min(1, 'Please choose a member')
});

export const setAssignmentsDto = z.object({
  assignments: z
    .array(assignmentSchema)
    .max(50, 'There are too many assignments for one service')
});

export const generateServicesDto = z.object({
  weeks: z.number().int().min(1).max(26).optional()
});

export type CreateServiceDto = z.infer<typeof createServiceDto>;
export type UpdateServiceDto = z.infer<typeof updateServiceDto>;
export type SetAssignmentsDto = z.infer<typeof setAssignmentsDto>;
export type GenerateServicesDto = z.infer<typeof generateServicesDto>;
