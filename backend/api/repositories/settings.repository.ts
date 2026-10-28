import {SettingsDocument, SettingsModel} from '../models/Settings.model';

export const settingsRepository = {
  /** Returns the single settings document, creating one with defaults if needed. */
  getOrCreate: async (): Promise<SettingsDocument> => {
    let settings = await SettingsModel.findOne().exec();

    if (!settings) {
      settings = await SettingsModel.create({});
    }

    return settings;
  },

  /** Updates the settings document. */
  update: async (changes: Partial<SettingsDocument>) => {
    const settings = await settingsRepository.getOrCreate();

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