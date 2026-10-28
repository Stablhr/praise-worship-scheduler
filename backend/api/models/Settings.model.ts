import mongoose, {Schema} from 'mongoose';

export interface SettingsDocument extends mongoose.Document {
  /** Default service times in Manila as HH:mm. */
  defaultServiceTimes: {
    saturday: string;
    sunday: string;
  };
  /** Reminder days before a service (e.g. [3, 2]). */
  reminderDays: number[];
  /** Reminder time in Manila as HH:mm. */
  reminderTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    defaultServiceTimes: {
      saturday: {type: String, default: '15:00'},
      sunday: {type: String, default: '09:00'}
    },
    reminderDays: {type: [Number], default: [3, 2]},
    reminderTime: {type: String, default: '09:00'}
  },
  {timestamps: true}
);

export const SettingsModel = mongoose.model<SettingsDocument>(
  'Settings',
  SettingsSchema,
  'settings'
);