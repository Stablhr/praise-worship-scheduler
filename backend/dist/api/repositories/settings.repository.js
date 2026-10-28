"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRepository = void 0;
const Settings_model_1 = require("../models/Settings.model");
exports.settingsRepository = {
    /** Returns the single settings document, creating one with defaults if needed. */
    getOrCreate: async () => {
        let settings = await Settings_model_1.SettingsModel.findOne().exec();
        if (!settings) {
            settings = await Settings_model_1.SettingsModel.create({});
        }
        return settings;
    },
    /** Updates the settings document. */
    update: async (changes) => {
        const settings = await exports.settingsRepository.getOrCreate();
        if (changes.defaultServiceTimes) {
            settings.defaultServiceTimes = {
                ...settings.defaultServiceTimes,
                ...changes.defaultServiceTimes
            };
        }
        if (changes.reminderDays) {
            settings.reminderDays = changes.reminderDays;
        }
        if (changes.reminderTime) {
            settings.reminderTime = changes.reminderTime;
        }
        await settings.save();
        return settings;
    }
};
