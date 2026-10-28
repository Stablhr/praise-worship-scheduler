"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateServicesDto = exports.setAssignmentsDto = exports.listServicesQueryDto = exports.updateServiceDto = exports.createServiceDto = void 0;
const zod_1 = require("zod");
const manila_1 = require("../utils/manila");
const serviceTypeSchema = zod_1.z.enum(['saturday', 'sunday']);
/** A Manila calendar day, such as "2026-10-24". */
const dateKeySchema = zod_1.z
    .string()
    .refine(manila_1.isDateKey, 'Please choose a valid date');
/** A Manila start time, such as "15:00". */
const timeSchema = zod_1.z.string().refine(manila_1.isValidTime, 'Please choose a valid time');
const notesSchema = zod_1.z.string().trim().max(200, 'Those notes are too long');
exports.createServiceDto = zod_1.z.object({
    type: serviceTypeSchema,
    date: dateKeySchema,
    // Missing means "use the default time for this type of service".
    time: timeSchema.optional(),
    notes: notesSchema.optional()
});
exports.updateServiceDto = zod_1.z
    .object({
    type: serviceTypeSchema.optional(),
    date: dateKeySchema.optional(),
    time: timeSchema.optional(),
    notes: notesSchema.optional()
})
    .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
});
exports.listServicesQueryDto = zod_1.z
    .object({
    from: dateKeySchema,
    to: dateKeySchema
})
    .refine(value => value.from <= value.to, {
    message: 'The end date must not be before the start date'
});
const assignmentSchema = zod_1.z.object({
    role: zod_1.z.string().trim().min(1, 'Please choose a role'),
    memberId: zod_1.z.string().trim().min(1, 'Please choose a member')
});
exports.setAssignmentsDto = zod_1.z.object({
    assignments: zod_1.z
        .array(assignmentSchema)
        .max(50, 'There are too many assignments for one service')
});
exports.generateServicesDto = zod_1.z.object({
    weeks: zod_1.z.number().int().min(1).max(26).optional()
});
