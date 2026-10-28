import {httpClient} from './httpClient';

export type SystemSettings = {
  defaultServiceTimes: {saturday: string; sunday: string};
  reminderDays: number[];
  reminderTime: string;
};

export async function getSettings(): Promise<SystemSettings> {
  const res = await httpClient.get<{settings: SystemSettings}>('/settings');
  return res.data.settings;
}

export async function updateSettings(
  changes: Partial<SystemSettings>
): Promise<SystemSettings> {
  const res = await httpClient.patch<{settings: SystemSettings}>(
    '/settings',
    changes
  );
  return res.data.settings;
}