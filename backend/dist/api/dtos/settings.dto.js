"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsDto = void 0;
const zod_1 = require("zod");
const manila_1 = require("../utils/manila");
const timeSchema = zod_1.z.string().refine(manila_1.isValidTime, 'Please choose a valid time');
exports.updateSettingsDto = zod_1.z
    .object({
    defaultServiceTimes: zod_1.z
        .object({
        saturday: timeSchema.optional(),
        sunday: timeSchema.optional()
    })
        .optional(),
    reminderDays: zod_1.z.array(zod_1.z.number().int().min(1).max(7)).optional(),
    reminderTime: timeSchema.optional()
})
    .refine(value => Object.keys(value).length > 0, {
    message: 'Nothing to update'
});
