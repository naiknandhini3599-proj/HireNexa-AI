import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJobOpening extends Document {
  title: string;
  department: string;
  organization: string;
  recruiterId: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  employmentType: string;
  location: string;
  openingsCount: number;
  interviewStructure: '5_rounds' | '8_rounds';
  rounds: Array<{
    roundNumber: number;
    name: string;
    type: string;
    description: string;
    durationMinutes: number;
    questionsCount: number;
    criteria: string[];
  }>;
  criteria: string[];
  applicationDeadline: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
}

const JobOpeningSchema = new Schema<IJobOpening>({
  title: { type: String, required: true, trim: true },
  department: { type: String, default: 'General' },
  organization: { type: String, required: true },
  recruiterId: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  preferredSkills: { type: [String], default: [] },
  minExperienceYears: { type: Number, default: 2 },
  employmentType: { type: String, default: 'Full-time' },
  location: { type: String, default: 'Remote' },
  openingsCount: { type: Number, default: 1 },
  interviewStructure: { type: String, enum: ['5_rounds', '8_rounds'], default: '5_rounds' },
  rounds: { type: Schema.Types.Mixed, default: [] },
  criteria: { type: [String], default: [] },
  applicationDeadline: { type: String, default: '2026-12-31' },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export const JobOpeningModel: Model<IJobOpening> =
  (mongoose.models.JobOpening as Model<IJobOpening>) || mongoose.model<IJobOpening>('JobOpening', JobOpeningSchema);
