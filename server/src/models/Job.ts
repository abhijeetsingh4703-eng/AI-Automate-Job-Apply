import mongoose from 'mongoose';

export interface IJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  sourcePortal: 'indeed' | 'linkedin' | 'glassdoor' | 'angellist' | 'other';
  externalJobId: string;
  externalUrl: string;
  postedDate: Date;
  // PHASE 2: AI Matching
  // matchScore?: number;
  // matchedSkills?: string[];
  createdAt: Date;
  updatedAt: Date;
  // Auto-delete after 90 days (TTL index)
}

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [String],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    sourcePortal: {
      type: String,
      enum: ['indeed', 'linkedin', 'glassdoor', 'angellist', 'other'],
      required: true,
    },
    externalJobId: {
      type: String,
      required: true,
      unique: true,
    },
    externalUrl: {
      type: String,
      required: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    // PHASE 2: AI Matching
    // matchScore: Number,
    // matchedSkills: [String],
  },
  {
    timestamps: true,
  }
);

// PHASE 3: TTL Index - Auto-delete old jobs
// jobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const Job = mongoose.model<IJob>('Job', jobSchema);
