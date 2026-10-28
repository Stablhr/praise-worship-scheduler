"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = void 0;
exports.toSettingsDto = toSettingsDto;
const settings_repository_1 = require("../repositories/settings.repository");
function toSettingsDto(s) {
    return {
        defaultServiceTimes: s.defaultServiceTimes,
        reminderDays: s.reminderDays,
        reminderTime: s.reminderTime
    };
}
exports.settingsService = {
    async get() {
        const settings = await settings_repository_1.settingsRepository.getOrCreate();
        return toSettingsDto(settings);
    },
    async update(changes) {
        const settings = await settings_repository_1.settingsRepository.update(changes);
        return toSettingsDto(settings);
    }
};
