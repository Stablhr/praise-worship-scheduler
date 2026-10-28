import mongoose, {Schema} from 'mongoose';

export type NotificationKind =
  | 'reminder'
  | 'lineup'
  | 'assignment'
  | 'schedule';

export interface NotificationDocument extends mongoose.Document {
  /** The member this notification is for, or null for "all members". */
  memberId: mongoose.Types.ObjectId | null;
  kind: NotificationKind;
  title: string;
  body: string;
  /** The service this notification relates to, if any. */
  serviceId?: mongoose.Types.ObjectId;
  /** When the member read it. Null means unread. */
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      default: null
    },
    kind: {
      type: String,
      enum: ['reminder', 'lineup', 'assignment', 'schedule'],
      required: true
    },
    title: {type: String, required: true, trim: true},
    body: {type: String, required: true, trim: true},
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service'
    },
    readAt: {type: Date, default: null}
  },
  {timestamps: true}
);

// "My notifications, newest first" is the only query.
NotificationSchema.index({memberId: 1, createdAt: -1});
// "All unread notifications for the bell badge."
NotificationSchema.index({memberId: 1, readAt: 1});

export const NotificationModel = mongoose.model<NotificationDocument>(
  'Notification',
  NotificationSchema,
  'notifications'
);