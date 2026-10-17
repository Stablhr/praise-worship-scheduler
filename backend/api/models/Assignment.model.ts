import mongoose, {Schema} from 'mongoose';

/**
 * Who serves which role for one service (PLAN.md section 2).
 *
 * A separate collection so a service can be read without its assignments (the
 * calendar only needs the dates), and so assignments can be replaced as a set.
 */
export interface AssignmentDocument extends mongoose.Document {
  serviceId: mongoose.Types.ObjectId;
  role: string;
  memberId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    role: {type: String, required: true, trim: true},
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    }
  },
  {timestamps: true}
);

// Every read is "the assignments of one service".
AssignmentSchema.index({serviceId: 1});
// "Which services is this member serving in?" — used when a member is removed.
AssignmentSchema.index({memberId: 1});

export const AssignmentModel = mongoose.model<AssignmentDocument>(
  'Assignment',
  AssignmentSchema,
  'assignments'
);
