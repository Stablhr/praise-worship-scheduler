import mongoose, {Schema} from 'mongoose';

export type ServiceType = 'saturday' | 'sunday';

export interface ServiceDocument extends mongoose.Document {
  /** Saturday prayer meeting or Sunday service (CONTEXT.md section 3). */
  type: ServiceType;
  /** The exact start of the service, stored in UTC. */
  date: Date;
  /** Start time in Manila as HH:mm, for the label shown to the team. */
  time: string;
  notes?: string;
  /** Photo of the assigned volunteers, added in Phase 5. */
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<ServiceDocument>(
  {
    type: {
      type: String,
      enum: ['saturday', 'sunday'],
      required: true
    },
    date: {type: Date, required: true},
    time: {type: String, required: true, trim: true},
    notes: {type: String, trim: true},
    photoUrl: {type: String}
  },
  {timestamps: true}
);

// The calendar asks for a range of days, so this is the query that must be fast.
ServiceSchema.index({date: 1});

export const ServiceModel = mongoose.model<ServiceDocument>(
  'Service',
  ServiceSchema,
  'services'
);
