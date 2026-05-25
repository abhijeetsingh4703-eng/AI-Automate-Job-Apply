import mongoose from 'mongoose';

export interface IResume {
  _id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  extractedText: string;
  skills: string[];
  experience: string;
  education: string;
  // PHASE 2: AI Analysis
  // aiAnalysis: {
  //   strengths: string[];
  //   improvements: string[];
  //   score: number;
  // };
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    skills: [String],
    experience: String,
    education: String,
    // PHASE 2: AI Analysis results
    // aiAnalysis: {
    //   strengths: [String],
    //   improvements: [String],
    //   score: Number,
    // },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
