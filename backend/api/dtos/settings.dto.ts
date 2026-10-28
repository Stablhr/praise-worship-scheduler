import {z} from 'zod';
import {isValidTime} from '../utils/manila';

const timeSchema = z.string().refine(isValidTime, 'Please choose a valid time');

export const updateSettingsDto = z
  .object({
    defaultServiceTimes: z
      .object({
        saturday: timeSchema.optional(),
        sunday: timeSchema.optional()
      })
      .optional(),
    reminderDays: z.array(z.number().int().min(1).max(7)).optional(),
    reminderTime: timeSchema.optional()
  })
  .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
  });

export type UpdateSettingsDto = z.infer<typeof updateSettingsDto>;