import mongoose, {Schema} from 'mongoose';

export type MemberPermission = 'admin' | 'songleader' | 'member';

export interface MemberDocument extends mongoose.Document {
  /** Full name of the member. */
  name: string;
  /** Sign-in email. Only emails an admin added can sign in. */
  email: string;
  /**
   * bcrypt hash of the member's password.
   * null means the admin added them but they have not set a password yet.
   */
  passwordHash: string | null;
  /** Set when the member finishes their first sign-in setup. */
  activatedAt: Date | null;
  photoUrl?: string;
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
    passwordHash: {type: String, default: null},
    activatedAt: {type: Date, default: null},
    photoUrl: {type: String},
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
