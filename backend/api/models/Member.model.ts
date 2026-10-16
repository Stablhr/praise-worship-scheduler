import mongoose, {Schema} from 'mongoose';

export type MemberPermission = 'admin' | 'songleader' | 'member';

export interface MemberDocument extends mongoose.Document {
  /** Full name taken from the Google account. */
  name: string;
  /** Google email. Only emails an admin added can sign in. */
  email: string;
  photoUrl?: string;
  googleId?: string;
  permission: MemberPermission;
  /** Optional label shown next to the name, such as Chairman, Pastor or Guitarist. */
  position?: string;
  /** Device push tokens (used from Phase 6 onwards). */
  pushTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<MemberDocument>(
  {
    name: {type: String, required: true, trim: true},
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    photoUrl: {type: String},
    googleId: {type: String},
    permission: {
      type: String,
      enum: ['admin', 'songleader', 'member'],
      default: 'member',
      required: true
    },
    position: {type: String, trim: true},
    pushTokens: {type: [String], default: []}
  },
  {timestamps: true}
);

export const MemberModel = mongoose.model<MemberDocument>(
  'Member',
  MemberSchema,
  'members'
);
