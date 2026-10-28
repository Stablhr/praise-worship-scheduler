"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSongsDto = exports.updateSongDto = exports.addSongDto = void 0;
const zod_1 = require("zod");
const songTypeSchema = zod_1.z.enum(['praise', 'worship']);
const linkSchema = zod_1.z
    .string()
    .trim()
    .max(500, 'That link is too long')
    .optional()
    .or(zod_1.z.literal(''));
const titleSchema = zod_1.z
    .string()
    .trim()
    .min(1, 'Please enter a song title')
    .max(200, 'That title is too long');
exports.addSongDto = zod_1.z.object({
    title: titleSchema,
    link: linkSchema,
    type: songTypeSchema
});
exports.updateSongDto = zod_1.z
    .object({
    title: titleSchema.optional(),
    link: linkSchema,
    type: songTypeSchema.optional()
})
    .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
});
exports.reorderSongsDto = zod_1.z.object({
    songIds: zod_1.z
        .array(zod_1.z.string().trim().min(1))
        .min(1, 'Please provide at least one song')
        .max(100, 'There are too many songs')
});
