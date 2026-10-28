import {z} from 'zod';

const songTypeSchema = z.enum(['praise', 'worship']);

const linkSchema = z
  .string()
  .trim()
  .max(500, 'That link is too long')
  .optional()
  .or(z.literal(''));

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a song title')
  .max(200, 'That title is too long');

export const addSongDto = z.object({
  title: titleSchema,
  link: linkSchema,
  type: songTypeSchema
});

export const updateSongDto = z
  .object({
    title: titleSchema.optional(),
    link: linkSchema,
    type: songTypeSchema.optional()
  })
  .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
  });

export const reorderSongsDto = z.object({
  songIds: z
    .array(z.string().trim().min(1))
    .min(1, 'Please provide at least one song')
    .max(100, 'There are too many songs')
});

export type AddSongDto = z.infer<typeof addSongDto>;
export type UpdateSongDto = z.infer<typeof updateSongDto>;
export type ReorderSongsDto = z.infer<typeof reorderSongsDto>;