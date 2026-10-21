export type UserRole = 'super_admin' | 'recruiter' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  isActive: boolean;
  createdAt: string;
  passwordHash?: string;
}

export type InterviewStructure = '5_rounds' | '8_rounds';

export interface InterviewRoundConfig {
  roundNumber: number;
  name: string;
  type: 'resume_screening' | 'hr_screening' | 'technical' | 'managerial' | 'final_hr' | 'aptitude' | 'technical_deep' | 'behavioral';
  description: string;
  durationMinutes: number;
  questionsCount: number;
  criteria: string[];
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  organization: string;
  recruiterId: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  location: string;
  openingsCount: number;
  interviewStructure: InterviewStructure;
  rounds: InterviewRoundConfig[];
  criteria: string[];
  applicationDeadline: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export type CandidateStatus =
  | 'invited'
  | 'not_started'
  | 'in_progress'
  | 'interrupted'
  | 'completed'
  | 'report_pending'
  | 'shortlisted'
  | 'on_hold'
  | 'rejected'
  | 'selected';

export interface ResumeData {
  fileName: string;
  extractedName?: string;
  extractedEmail?: string;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  extractedProjects: string[];
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
}

export interface Candidate {
  id: string;
  invitationToken: string;
  jobId: string;
  jobTitle: string;
  organization: string;
  name: string;
  email: string;
  phone?: string;
  status: CandidateStatus;
  interviewStructure: InterviewStructure;
  currentRound: number;
  totalRounds: number;
  resume?: ResumeData;
  invitedAt: string;
  startedAt?: string;
  completedAt?: string;
  overallScore?: number;
  recruiterDecision?: 'shortlisted' | 'on_hold' | 'rejected' | 'selected';
  recruiterNotes?: string;
  decisionTimestamp?: string;
}

export interface InterviewQuestionItem {
  id: string;
  roundNumber: number;
  roundName: string;
  question: string;
  expectedKeyPoints: string[];
  candidateResponse?: string;
  score?: number;
  feedback?: string;
  followUpAsked?: string;
  answeredAt?: string;
}

export interface AptitudeQuestion {
  id: string;
  question: string;
  category: 'Logical Reasoning' | 'Numerical' | 'Verbal' | 'Programming' | 'Analytical Thinking';
  options: string[];
  correctOptionIndex: number;
  candidateAnswerIndex?: number;
  isCorrect?: boolean;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  jobId: string;
  token: string;
  status: 'active' | 'paused' | 'completed';
  currentRound: number;
  totalRounds: number;
  questions: InterviewQuestionItem[];
  aptitudeQuestions?: AptitudeQuestion[];
  transcript: { speaker: 'AI' | 'Candidate'; text: string; timestamp: string }[];
  audioConsent: boolean;
  videoConsent: boolean;
  startedAt: string;
  lastActiveAt: string;
}

export interface AssessmentCriterionResult {
  name: string;
  description: string;
  maxScore: number;
  obtainedScore: number;
  evidence: string;
  notes: string;
}

export interface InterviewReport {
  id: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  organization: string;
  interviewStructure: InterviewStructure;
  completedAt: string;
  overallScore: number; // 0 - 100
  resumeMatchScore: number; // 0 - 100
  recommendation: 'Strong Hire' | 'Hire' | 'Consider' | 'Do Not Hire';
  recommendationSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  missingOrUnverifiedSkills: string[];
  criteriaBreakdown: AssessmentCriterionResult[];
  roundResults: {
    roundNumber: number;
    roundName: string;
    score: number;
    summary: string;
  }[];
  transcript: { speaker: 'AI' | 'Candidate'; text: string; timestamp: string }[];
  recruiterDecision?: 'shortlisted' | 'on_hold' | 'rejected' | 'selected';
  recruiterNotes?: string;
  decisionTimestamp?: string;
}

export interface RecruiterAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  interviewsInProgress: number;
  shortlistedCount: number;
  onHoldCount: number;
  rejectedCount: number;
  selectedCount: number;
  avgInterviewScore: number;
  completionRate: number; // percentage
  dropOffRate: number; // percentage
  jobWiseDistribution: { jobTitle: string; candidateCount: number; avgScore: number }[];
  roundWisePerformance: { roundName: string; avgScore: number }[];
}

export interface SuperAdminAnalytics {
  totalRecruiters: number;
  activeRecruiters: number;
  totalOrganizations: number;
  totalJobs: number;
  totalCandidates: number;
  completedInterviews: number;
  interviewsInProgress: number;
  platformCompletionRate: number;
  avgInterviewScore: number;
  abandonmentRate: number;
  apiUsageCount: number;
  systemHealth: string;
}
