import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICandidate extends Document {
  invitationToken: string;
  jobId: string;
  jobTitle: string;
  organization: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  interviewStructure: '5_rounds' | '8_rounds';
  currentRound: number;
  totalRounds: number;
  resume?: {
    fileName: string;
    extractedSkills: string[];
    extractedExperience: string[];
    extractedEducation: string[];
    extractedProjects: string[];
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    summary: string;
  };
  invitedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  overallScore?: number;
  recruiterDecision?: 'shortlisted' | 'on_hold' | 'rejected' | 'selected';
  recruiterNotes?: string;
  decisionTimestamp?: Date;
}

const CandidateSchema = new Schema<ICandidate>({
  invitationToken: { type: String, required: true, unique: true, index: true },
  jobId: { type: String, required: true },
  jobTitle: { type: String, required: true },
  organization: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String },
  status: {
    type: String,
    enum: ['invited', 'not_started', 'in_progress', 'interrupted', 'completed', 'shortlisted', 'on_hold', 'rejected', 'selected'],
    default: 'invited',
  },
  interviewStructure: { type: String, enum: ['5_rounds', '8_rounds'], default: '5_rounds' },
  currentRound: { type: Number, default: 1 },
  totalRounds: { type: Number, default: 5 },
  resume: { type: Schema.Types.Mixed },
  invitedAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
  overallScore: { type: Number },
  recruiterDecision: { type: String, enum: ['shortlisted', 'on_hold', 'rejected', 'selected'] },
  recruiterNotes: { type: String },
  decisionTimestamp: { type: Date },
});

export const CandidateModel: Model<ICandidate> =
  (mongoose.models.Candidate as Model<ICandidate>) || mongoose.model<ICandidate>('Candidate', CandidateSchema);
