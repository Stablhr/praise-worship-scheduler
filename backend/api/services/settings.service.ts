import {ApiError} from '../utils/error';
import {ErrorCodes} from '../constants/errorCodes';
import {SettingsDocument} from '../models/Settings.model';
import {settingsRepository} from '../repositories/settings.repository';

export type SettingsDto = {
  defaultServiceTimes: {saturday: string; sunday: string};
  reminderDays: number[];
  reminderTime: string;
};

export function toSettingsDto(s: SettingsDocument): SettingsDto {
  return {
    defaultServiceTimes: s.defaultServiceTimes,
    reminderDays: s.reminderDays,
    reminderTime: s.reminderTime
  };
}

export const settingsService = {
  async get(): Promise<SettingsDto> {
    const settings = await settingsRepository.getOrCreate();
    return toSettingsDto(settings);
  },

  async update(changes: Partial<SettingsDto>): Promise<SettingsDto> {
    const settings = await settingsRepository.update(changes);
    return toSettingsDto(settings);
  }
};