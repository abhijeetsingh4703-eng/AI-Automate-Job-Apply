import mongoose from 'mongoose';

export interface IApplication {
  _id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: Date;
  status: 'applied' | 'rejected' | 'interview' | 'offer' | 'pending';
  sourcePortal: 'indeed' | 'linkedin' | 'glassdoor' | 'angellist' | 'manual' | 'automated';
  automatedApply?: boolean;
  resumeUsed?: string;
  // PHASE 2: Tracking
  // lastStatusCheck: Date;
  // notes: string;
  // tailoredResume?: string;
  // coverletter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobTitle: String,
    company: String,
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['applied', 'rejected', 'interview', 'offer', 'pending'],
      default: 'applied',
    },
    sourcePortal: {
      type: String,
      enum: ['indeed', 'linkedin', 'glassdoor', 'angellist', 'manual', 'automated'],
      required: true,
    },
    automatedApply: {
      type: Boolean,
      default: false,
    },
    resumeUsed: String,
    // PHASE 2: Advanced tracking
    // lastStatusCheck: Date,
    // notes: String,
    // tailoredResume: String,
    // coverletter: String,
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
applicationSchema.index({ userId: 1, createdAt: -1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
