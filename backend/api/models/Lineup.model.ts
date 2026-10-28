import mongoose, {Schema} from 'mongoose';

/** A song in a lineup. */
export interface SongEntry {
  /** Stable id for the song within the lineup. */
  _id: mongoose.Types.ObjectId;
  title: string;
  /** Optional link, e.g. a YouTube URL. */
  link?: string;
  /** Praise/Fast or Worship/Slow (CONTEXT.md section 4). */
  type: 'praise' | 'worship';
  /** Display order, 0-based. */
  order: number;
  /** The member who added the song. */
  addedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineupDocument extends mongoose.Document {
  serviceId: mongoose.Types.ObjectId;
  songs: SongEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const SongSchema = new Schema<SongEntry>(
  {
    title: {type: String, required: true, trim: true},
    link: {type: String, trim: true},
    type: {
      type: String,
      enum: ['praise', 'worship'],
      required: true
    },
    order: {type: Number, required: true, default: 0},
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Member'
    }
  },
  {_id: true, timestamps: true}
);

const LineupSchema = new Schema<LineupDocument>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      unique: true
    },
    songs: {type: [SongSchema], default: []}
  },
  {timestamps: true}
);

// Every read is "the lineup of one service".
LineupSchema.index({serviceId: 1}, {unique: true});

export const LineupModel = mongoose.model<LineupDocument>(
  'Lineup',
  LineupSchema,
  'lineups'
);