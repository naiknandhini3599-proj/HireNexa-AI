import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterviewReport extends Document {
  candidateId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  organization: string;
  interviewStructure: '5_rounds' | '8_rounds';
  completedAt: Date;
  overallScore: number;
  resumeMatchScore: number;
  recommendation: 'Strong Hire' | 'Hire' | 'Consider' | 'Do Not Hire';
  recommendationSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  missingOrUnverifiedSkills: string[];
  criteriaBreakdown: Array<{
    name: string;
    description: string;
    maxScore: number;
    obtainedScore: number;
    evidence: string;
    notes: string;
  }>;
  roundResults: Array<{
    roundNumber: number;
    roundName: string;
    score: number;
    summary: string;
  }>;
  transcript: Array<{
    speaker: 'AI' | 'Candidate';
    text: string;
    timestamp: string;
  }>;
  recruiterDecision?: 'shortlisted' | 'on_hold' | 'rejected' | 'selected';
  recruiterNotes?: string;
  decisionTimestamp?: Date;
}

const InterviewReportSchema = new Schema<IInterviewReport>({
  candidateId: { type: String, required: true, index: true },
  jobId: { type: String, required: true },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  jobTitle: { type: String, required: true },
  organization: { type: String, required: true },
  interviewStructure: { type: String, enum: ['5_rounds', '8_rounds'], default: '5_rounds' },
  completedAt: { type: Date, default: Date.now },
  overallScore: { type: Number, required: true },
  resumeMatchScore: { type: Number, required: true },
  recommendation: { type: String, enum: ['Strong Hire', 'Hire', 'Consider', 'Do Not Hire'], required: true },
  recommendationSummary: { type: String, required: true },
  strengths: { type: [String], default: [] },
  areasForImprovement: { type: [String], default: [] },
  missingOrUnverifiedSkills: { type: [String], default: [] },
  criteriaBreakdown: { type: Schema.Types.Mixed, default: [] },
  roundResults: { type: Schema.Types.Mixed, default: [] },
  transcript: { type: Schema.Types.Mixed, default: [] },
  recruiterDecision: { type: String, enum: ['shortlisted', 'on_hold', 'rejected', 'selected'] },
  recruiterNotes: { type: String },
  decisionTimestamp: { type: Date },
});

export const InterviewReportModel: Model<IInterviewReport> =
  (mongoose.models.InterviewReport as Model<IInterviewReport>) || mongoose.model<IInterviewReport>('InterviewReport', InterviewReportSchema);
