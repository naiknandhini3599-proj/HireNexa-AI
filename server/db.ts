import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  JobOpening,
  Candidate,
  InterviewSession,
  InterviewReport,
  RecruiterAnalytics,
  SuperAdminAnalytics,
} from '../src/types/index.js';
import mongoose from 'mongoose';
import { UserModel } from './models/User.js';
import { JobOpeningModel } from './models/JobOpening.js';
import { CandidateModel } from './models/Candidate.js';
import { InterviewReportModel } from './models/InterviewReport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Interface for complete persisted database state
export interface DatabaseState {
  users: User[];
  jobs: JobOpening[];
  candidates: Candidate[];
  sessions: Record<string, InterviewSession>;
  reports: InterviewReport[];
  systemLogs: { timestamp: string; level: 'info' | 'warn' | 'error'; message: string; details?: any }[];
  platformSettings: {
    allowRegistration: boolean;
    maxInterviewsPerJob: number;
    defaultStructure: '5_rounds' | '8_rounds';
    enableAudioRecording: boolean;
    aiProvider: string;
    model: string;
  };
}

// Initial Seed Data
const defaultState: DatabaseState = {
  users: [
    {
      id: 'usr_admin_1',
      name: 'Nandhini SuperAdmin',
      email: 'admin@hirenexa.ai',
      role: 'super_admin',
      organization: 'HireNexa Global Enterprise',
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr_recruiter_1',
      name: 'Sarah Jenkins',
      email: 'sarah.recruiter@hirenexa.ai',
      role: 'recruiter',
      organization: 'TechVision Labs',
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'usr_recruiter_2',
      name: 'David K. Vance',
      email: 'david.hr@hirenexa.ai',
      role: 'recruiter',
      organization: 'NextGen Systems',
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  jobs: [
    {
      id: 'job_1',
      title: 'Senior Full-Stack AI Engineer',
      department: 'Engineering & AI',
      organization: 'TechVision Labs',
      recruiterId: 'usr_recruiter_1',
      description: 'We are seeking an experienced Full-Stack AI Engineer to design and deploy scalable intelligent applications integrating LLMs, Node.js, React, and cloud architectures.',
      requiredSkills: ['TypeScript', 'React', 'Node.js', 'Python', 'LLMs / Generative AI', 'REST APIs', 'Cloud Architecture'],
      preferredSkills: ['Docker', 'Vector Databases', 'Three.js', 'Redis'],
      minExperienceYears: 4,
      employmentType: 'Full-time',
      location: 'Remote / San Francisco, CA',
      openingsCount: 2,
      interviewStructure: '5_rounds',
      applicationDeadline: '2026-12-31',
      status: 'active',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      criteria: ['System Architecture Knowledge', 'Coding Proficiency', 'Problem Solving', 'Communication & Articulation', 'Cultural Fit'],
      rounds: [
        {
          roundNumber: 1,
          name: 'Resume Screening',
          type: 'resume_screening',
          description: 'Automated skill extraction, education verification, and job match relevance evaluation.',
          durationMinutes: 5,
          questionsCount: 0,
          criteria: ['Core Skills Match', 'Experience Relevance', 'Education / Portfolio'],
        },
        {
          roundNumber: 2,
          name: 'HR Screening',
          type: 'hr_screening',
          description: 'Candidate introduction, professional background, role interest, salary and timeline expectations.',
          durationMinutes: 15,
          questionsCount: 4,
          criteria: ['Professional Communication', 'Role Motivation', 'Timeline & Logistics'],
        },
        {
          roundNumber: 3,
          name: 'Technical Interview',
          type: 'technical',
          description: 'In-depth assessment of React, Node.js, asynchronous programming, and Generative AI SDK workflows.',
          durationMinutes: 30,
          questionsCount: 4,
          criteria: ['Framework Knowledge', 'System Scalability', 'API Design', 'Security Practices'],
        },
        {
          roundNumber: 4,
          name: 'Managerial Interview',
          type: 'managerial',
          description: 'Evaluating teamwork, cross-functional collaboration, conflict resolution, and handling production deadlines.',
          durationMinutes: 20,
          questionsCount: 3,
          criteria: ['Collaboration', 'Prioritization under Pressure', 'Ownership & Leadership'],
        },
        {
          roundNumber: 5,
          name: 'Final HR Round',
          type: 'final_hr',
          description: 'Long-term career aspirations, alignment with organizational values, and candidate questions.',
          durationMinutes: 15,
          questionsCount: 3,
          criteria: ['Career Growth Alignment', 'Value Alignment', 'Expectation Clarity'],
        },
      ],
    },
    {
      id: 'job_2',
      title: 'Lead Cloud Solutions Architect',
      department: 'Infrastructure',
      organization: 'TechVision Labs',
      recruiterId: 'usr_recruiter_1',
      description: 'Looking for a Lead Cloud Architect to govern our multi-region Kubernetes deployments, automated CI/CD pipelines, and high-resilience distributed systems.',
      requiredSkills: ['Kubernetes', 'AWS / GCP', 'Terraform', 'Microservices', 'Distributed Systems', 'Security Compliance'],
      preferredSkills: ['Golang', 'Kafka', 'eBPF', 'FinOps'],
      minExperienceYears: 7,
      employmentType: 'Full-time',
      location: 'Hybrid / New York, NY',
      openingsCount: 1,
      interviewStructure: '8_rounds',
      applicationDeadline: '2026-11-30',
      status: 'active',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      criteria: ['Architecture Design', 'High Availability & DR', 'Security', 'Analytical Aptitude', 'Leadership'],
      rounds: [
        { roundNumber: 1, name: 'Resume Screening', type: 'resume_screening', description: 'Screening credentials & architecture track record', durationMinutes: 5, questionsCount: 0, criteria: ['Certifications', 'Years of Experience', 'Scale of Systems'] },
        { roundNumber: 2, name: 'HR Telephonic Screening', type: 'hr_screening', description: 'Initial verbal screening of background & goals', durationMinutes: 15, questionsCount: 3, criteria: ['Communication', 'Availability', 'Target Compensation'] },
        { roundNumber: 3, name: 'Aptitude & Online Assessment', type: 'aptitude', description: 'Timed assessment covering logical reasoning, analytical systems thinking, and distributed algorithms', durationMinutes: 25, questionsCount: 5, criteria: ['Logical Reasoning', 'Analytical Precision', 'Technical Speed'] },
        { roundNumber: 4, name: 'Technical Screening', type: 'technical', description: 'Core container orchestration, networking, and cloud networking fundamentals', durationMinutes: 25, questionsCount: 3, criteria: ['Kubernetes Networking', 'IaC Principles'] },
        { roundNumber: 5, name: 'In-Depth Technical Interview', type: 'technical_deep', description: 'Multi-region disaster recovery, latency optimization, and zero-trust security', durationMinutes: 40, questionsCount: 4, criteria: ['Distributed Architecture', 'Fault Tolerance', 'Zero-Trust Security'] },
        { roundNumber: 6, name: 'Managerial Round', type: 'managerial', description: 'Leading engineering squads, stakeholder management, and architectural trade-offs', durationMinutes: 25, questionsCount: 3, criteria: ['Team Mentorship', 'Budget & Trade-off Negotiation'] },
        { roundNumber: 7, name: 'HR Behavioral Round', type: 'behavioral', description: 'Ethical judgment, cross-cultural leadership, and adaptability', durationMinutes: 20, questionsCount: 3, criteria: ['Integrity', 'Empathy', 'Continuous Learning'] },
        { roundNumber: 8, name: 'Final HR and Offer Discussion', type: 'final_hr', description: 'Expectation review, joining timelines, and closing interview notes', durationMinutes: 15, questionsCount: 3, criteria: ['Joining Commitment', 'Role Clarity'] },
      ],
    },
  ],
  candidates: [
    {
      id: 'cand_101',
      invitationToken: 'tok_demo_alex_chen',
      jobId: 'job_1',
      jobTitle: 'Senior Full-Stack AI Engineer',
      organization: 'TechVision Labs',
      name: 'Alex Chen',
      email: 'alex.chen.dev@example.com',
      phone: '+1 (555) 349-2810',
      status: 'completed',
      interviewStructure: '5_rounds',
      currentRound: 5,
      totalRounds: 5,
      overallScore: 92,
      recruiterDecision: 'shortlisted',
      recruiterNotes: 'Exceptional answers on vector database retrieval latency and React 19 server actions. Recommended for team lead interview.',
      decisionTimestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      invitedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 86400000 + 45 * 60000).toISOString(),
      resume: {
        fileName: 'Alex_Chen_Staff_Engineer_Resume.pdf',
        extractedSkills: ['TypeScript', 'React', 'Node.js', 'Python', 'LLMs / Generative AI', 'REST APIs', 'PostgreSQL', 'Docker'],
        extractedExperience: ['5 years as Senior Full-Stack Engineer at CloudScale Inc', '2 years at DataCore developing LLM workflow automation'],
        extractedEducation: ['B.S. in Computer Science - University of California, Berkeley'],
        extractedProjects: ['Distributed RAG agent with sub-second semantic retrieval', 'Real-time collaborative canvas app with WebSockets'],
        matchScore: 94,
        matchedSkills: ['TypeScript', 'React', 'Node.js', 'Python', 'LLMs / Generative AI', 'REST APIs'],
        missingSkills: ['Three.js'],
        summary: 'Accomplished full-stack specialist with 7+ years building enterprise SaaS and generative AI systems with production-grade reliability.',
      },
    },
    {
      id: 'cand_102',
      invitationToken: 'tok_demo_elena_rodriguez',
      jobId: 'job_1',
      jobTitle: 'Senior Full-Stack AI Engineer',
      organization: 'TechVision Labs',
      name: 'Elena Rodriguez',
      email: 'elena.r@example.org',
      phone: '+1 (555) 782-9901',
      status: 'in_progress',
      interviewStructure: '5_rounds',
      currentRound: 3,
      totalRounds: 5,
      invitedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      startedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      resume: {
        fileName: 'Elena_Rodriguez_CV.pdf',
        extractedSkills: ['TypeScript', 'Node.js', 'React', 'Docker', 'REST APIs', 'GraphQL'],
        extractedExperience: ['4 years full stack engineering at Fintech Co'],
        extractedEducation: ['M.S. Software Engineering - UT Austin'],
        extractedProjects: ['High-throughput payment gateway client'],
        matchScore: 86,
        matchedSkills: ['TypeScript', 'Node.js', 'React', 'REST APIs'],
        missingSkills: ['Python', 'LLMs / Generative AI'],
        summary: 'Strong backend & frontend fundamentals with extensive distributed payments experience. Eager to cross-train on LLM pipelines.',
      },
    },
    {
      id: 'cand_103',
      invitationToken: 'tok_demo_marcus_vance',
      jobId: 'job_2',
      jobTitle: 'Lead Cloud Solutions Architect',
      organization: 'TechVision Labs',
      name: 'Marcus Vance',
      email: 'm.vance@cloudarchitect.net',
      phone: '+1 (555) 489-1244',
      status: 'completed',
      interviewStructure: '8_rounds',
      currentRound: 8,
      totalRounds: 8,
      overallScore: 95,
      recruiterDecision: 'selected',
      recruiterNotes: 'Top-tier cloud architect. Flawless answers across Kubernetes CNI, zero-trust service meshes, and cost optimization at petabyte scale.',
      decisionTimestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      invitedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      startedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 86400000 + 60 * 60000).toISOString(),
      resume: {
        fileName: 'Marcus_Vance_Cloud_Architect.pdf',
        extractedSkills: ['Kubernetes', 'AWS / GCP', 'Terraform', 'Microservices', 'Distributed Systems', 'Security Compliance', 'Golang'],
        extractedExperience: ['8 years principal architect at FinTech Cloud Corp', 'AWS Certified Solutions Architect Professional'],
        extractedEducation: ['B.S. Electrical & Computer Engineering - Georgia Tech'],
        extractedProjects: ['Multi-region active-active failover architecture with 99.999% SLA'],
        matchScore: 98,
        matchedSkills: ['Kubernetes', 'AWS / GCP', 'Terraform', 'Microservices', 'Distributed Systems', 'Security Compliance'],
        missingSkills: [],
        summary: 'Principal level architect with deep expertise in mission-critical infrastructure, Terraform automation, and high-availability systems.',
      },
    },
  ],
  sessions: {},
  reports: [
    {
      id: 'rep_cand_101',
      candidateId: 'cand_101',
      jobId: 'job_1',
      candidateName: 'Alex Chen',
      candidateEmail: 'alex.chen.dev@example.com',
      jobTitle: 'Senior Full-Stack AI Engineer',
      organization: 'TechVision Labs',
      interviewStructure: '5_rounds',
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      overallScore: 92,
      resumeMatchScore: 94,
      recommendation: 'Strong Hire',
      recommendationSummary: 'Alex exhibited superior command of modern React architecture, server-side Node.js event loops, and LLM prompt engineering. Responses were structured, articulate, and grounded in real-world production trade-offs.',
      strengths: [
        'Extensive hands-on experience designing low-latency API architectures with Node.js',
        'Deep practical understanding of LLM streaming, token budgeting, and guardrails',
        'Clear, confident communication style and structured problem-solving',
        'Proactive team mindset and strong mentorship track record',
      ],
      areasForImprovement: [
        'Could deepen exposure to client-side 3D WebGL / Three.js animations',
        'Slightly faster code syntax recall on edge cases',
      ],
      missingOrUnverifiedSkills: ['Three.js'],
      criteriaBreakdown: [
        {
          name: 'System Architecture Knowledge',
          description: 'Ability to architect scalable, resilient web services and distributed systems.',
          maxScore: 25,
          obtainedScore: 24,
          evidence: 'Described microservices decouplings with asynchronous message queuing and caching layers.',
          notes: 'High clarity and thorough trade-off analysis.',
        },
        {
          name: 'Coding & Technology Stack Proficiency',
          description: 'Mastery of TypeScript, React 19, Node.js, and modern APIs.',
          maxScore: 25,
          obtainedScore: 23,
          evidence: 'Explained React Server Components and state synchronization mechanics accurately.',
          notes: 'Demonstrated deep expertise in typing and asynchronous runtime behaviors.',
        },
        {
          name: 'Generative AI & LLM Integration',
          description: 'Understanding of modern generative models, embeddings, RAG, and streaming responses.',
          maxScore: 25,
          obtainedScore: 24,
          evidence: 'Detailed semantic chunking strategies for vector indexing and hallucination mitigation.',
          notes: 'Exceptional familiarity with LLM constraints.',
        },
        {
          name: 'Communication & Problem Solving',
          description: 'Structured articulation, workplace collaboration, and stakeholder empathy.',
          maxScore: 25,
          obtainedScore: 21,
          evidence: 'Gave concrete behavioral examples of resolving sprint roadblocks smoothly.',
          notes: 'Engaging, thoughtful, and pleasant conversational pace.',
        },
      ],
      roundResults: [
        { roundNumber: 1, roundName: 'Resume Screening', score: 94, summary: 'Skills strongly align with required stack and 7 years of full stack tenure.' },
        { roundNumber: 2, roundName: 'HR Screening', score: 92, summary: 'Articulate introduction, clear career goals, and realistic compensation expectations.' },
        { roundNumber: 3, roundName: 'Technical Interview', score: 95, summary: 'Superb breakdown of event loop, micro-tasks, and resilient RESTful microservices.' },
        { roundNumber: 4, roundName: 'Managerial Interview', score: 89, summary: 'Demonstrated proactive conflict resolution and cross-functional team alignment.' },
        { roundNumber: 5, roundName: 'Final HR Round', score: 90, summary: 'Strong cultural enthusiasm and readiness to join within 3 weeks.' },
      ],
      transcript: [
        { speaker: 'AI', text: 'Welcome Alex! Could you tell me a little bit about yourself and what excites you about this AI Engineer role?', timestamp: '00:01' },
        { speaker: 'Candidate', text: 'Hello! I have spent the last 5 years designing full-stack web platforms and recently specialized in integrating generative AI agents. What excites me about TechVision Labs is the focus on low-latency interactive AI interfaces.', timestamp: '00:15' },
        { speaker: 'AI', text: 'That sounds impressive. In terms of technical architecture, how do you handle streaming responses from an LLM while maintaining state consistency in React?', timestamp: '01:05' },
        { speaker: 'Candidate', text: 'I stream raw server-sent event chunks directly into an immutable buffer using custom hooks, avoiding unnecessary re-renders while updating the UI state at 60 FPS.', timestamp: '01:35' },
        { speaker: 'AI', text: 'Excellent explanation. How do you approach team disputes over architectural decisions when deadlines are tight?', timestamp: '02:40' },
        { speaker: 'Candidate', text: 'I focus on objective metrics—such as latency benchmarks, testability, and development speed—and document an RFC so the entire squad aligns transparently.', timestamp: '03:10' },
      ],
      recruiterDecision: 'shortlisted',
      recruiterNotes: 'Exceptional answers on vector database retrieval latency and React 19 server actions. Recommended for team lead interview.',
      decisionTimestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  systemLogs: [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'info', message: 'Platform initialized with secure seed data.' },
    { timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'info', message: 'Candidate Alex Chen interview session completed successfully.' },
  ],
  platformSettings: {
    allowRegistration: true,
    maxInterviewsPerJob: 50,
    defaultStructure: '5_rounds',
    enableAudioRecording: true,
    aiProvider: 'Google Gemini AI',
    model: 'gemini-3.8-flash',
  },
};

// Database class managing state with auto-persistence
class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.warn('[DB] Failed to load disk data, using default state:', e);
    }
    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state: DatabaseState): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Failed to persist state to disk:', e);
    }
  }

  public save(): void {
    this.saveState(this.state);
  }

  // Users
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // MongoDB Atlas Synchronization
  public async syncFromMongo(): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const [mongoUsers, mongoJobs, mongoCandidates, mongoReports] = await Promise.all([
        UserModel.find({}).lean(),
        JobOpeningModel.find({}).lean(),
        CandidateModel.find({}).lean(),
        InterviewReportModel.find({}).lean(),
      ]);

      if (mongoUsers.length > 0) {
        this.state.users = mongoUsers.map((u: any) => ({
          id: u._id?.toString() || u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          organization: u.organization,
          isActive: u.isActive !== false,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          passwordHash: u.passwordHash,
        }));
      }

      if (mongoJobs.length > 0) {
        this.state.jobs = mongoJobs.map((j: any) => ({
          id: j._id?.toString() || j.id,
          title: j.title,
          department: j.department || 'General',
          organization: j.organization,
          recruiterId: j.recruiterId,
          description: j.description,
          requiredSkills: j.requiredSkills || [],
          preferredSkills: j.preferredSkills || [],
          minExperienceYears: j.minExperienceYears || 2,
          employmentType: j.employmentType || 'Full-time',
          location: j.location || 'Remote',
          openingsCount: j.openingsCount || 1,
          interviewStructure: j.interviewStructure || '5_rounds',
          rounds: j.rounds || [],
          criteria: j.criteria || [],
          applicationDeadline: j.applicationDeadline || '2026-12-31',
          status: j.status || 'active',
          createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
        }));
      }

      if (mongoCandidates.length > 0) {
        this.state.candidates = mongoCandidates.map((c: any) => ({
          id: c._id?.toString() || c.id,
          invitationToken: c.invitationToken,
          jobId: c.jobId,
          jobTitle: c.jobTitle,
          organization: c.organization,
          name: c.name,
          email: c.email,
          phone: c.phone,
          status: c.status || 'invited',
          interviewStructure: c.interviewStructure || '5_rounds',
          currentRound: c.currentRound || 1,
          totalRounds: c.totalRounds || 5,
          resume: c.resume,
          invitedAt: c.invitedAt ? new Date(c.invitedAt).toISOString() : new Date().toISOString(),
          startedAt: c.startedAt ? new Date(c.startedAt).toISOString() : undefined,
          completedAt: c.completedAt ? new Date(c.completedAt).toISOString() : undefined,
          overallScore: c.overallScore,
          recruiterDecision: c.recruiterDecision,
          recruiterNotes: c.recruiterNotes,
          decisionTimestamp: c.decisionTimestamp ? new Date(c.decisionTimestamp).toISOString() : undefined,
        }));
      }

      if (mongoReports.length > 0) {
        this.state.reports = mongoReports.map((r: any) => ({
          id: r._id?.toString() || r.id,
          candidateId: r.candidateId,
          jobId: r.jobId,
          candidateName: r.candidateName,
          candidateEmail: r.candidateEmail,
          jobTitle: r.jobTitle,
          organization: r.organization,
          interviewStructure: r.interviewStructure || '5_rounds',
          completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : new Date().toISOString(),
          overallScore: r.overallScore,
          resumeMatchScore: r.resumeMatchScore || 0,
          recommendation: r.recommendation,
          recommendationSummary: r.recommendationSummary,
          strengths: r.strengths || [],
          areasForImprovement: r.areasForImprovement || [],
          missingOrUnverifiedSkills: r.missingOrUnverifiedSkills || [],
          criteriaBreakdown: r.criteriaBreakdown || [],
          roundResults: r.roundResults || [],
          transcript: r.transcript || [],
          recruiterDecision: r.recruiterDecision,
          recruiterNotes: r.recruiterNotes,
          decisionTimestamp: r.decisionTimestamp ? new Date(r.decisionTimestamp).toISOString() : undefined,
        }));
      }

      this.save();
      console.log(`🍃 Synced with MongoDB Atlas: ${mongoUsers.length} users, ${mongoJobs.length} jobs, ${mongoCandidates.length} candidates, ${mongoReports.length} reports.`);
    } catch (err) {
      console.warn('⚠️ Could not hydrate from MongoDB:', err);
    }
  }

  public async syncUserToMongo(user: User): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await UserModel.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        {
          name: user.name,
          email: user.email.toLowerCase(),
          passwordHash: user.passwordHash || 'hashed_default',
          role: user.role,
          organization: user.organization,
          isActive: user.isActive,
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[Mongo] Failed to sync user to MongoDB:', e);
    }
  }

  public async syncJobToMongo(job: JobOpening): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await JobOpeningModel.findOneAndUpdate(
        { title: job.title, organization: job.organization },
        {
          title: job.title,
          department: job.department,
          organization: job.organization,
          recruiterId: job.recruiterId,
          description: job.description,
          requiredSkills: job.requiredSkills,
          preferredSkills: job.preferredSkills,
          minExperienceYears: job.minExperienceYears,
          employmentType: job.employmentType,
          location: job.location,
          openingsCount: job.openingsCount,
          interviewStructure: job.interviewStructure,
          rounds: job.rounds,
          criteria: job.criteria,
          applicationDeadline: job.applicationDeadline,
          status: job.status,
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[Mongo] Failed to sync job to MongoDB:', e);
    }
  }

  public async syncCandidateToMongo(candidate: Candidate): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await CandidateModel.findOneAndUpdate(
        { invitationToken: candidate.invitationToken },
        {
          invitationToken: candidate.invitationToken,
          jobId: candidate.jobId,
          jobTitle: candidate.jobTitle,
          organization: candidate.organization,
          name: candidate.name,
          email: candidate.email.toLowerCase(),
          phone: candidate.phone,
          status: candidate.status,
          interviewStructure: candidate.interviewStructure,
          currentRound: candidate.currentRound,
          totalRounds: candidate.totalRounds,
          resume: candidate.resume,
          invitedAt: candidate.invitedAt ? new Date(candidate.invitedAt) : new Date(),
          startedAt: candidate.startedAt ? new Date(candidate.startedAt) : undefined,
          completedAt: candidate.completedAt ? new Date(candidate.completedAt) : undefined,
          overallScore: candidate.overallScore,
          recruiterDecision: candidate.recruiterDecision,
          recruiterNotes: candidate.recruiterNotes,
          decisionTimestamp: candidate.decisionTimestamp ? new Date(candidate.decisionTimestamp) : undefined,
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[Mongo] Failed to sync candidate to MongoDB:', e);
    }
  }

  public async syncReportToMongo(report: InterviewReport): Promise<void> {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await InterviewReportModel.findOneAndUpdate(
        { candidateId: report.candidateId },
        {
          candidateId: report.candidateId,
          jobId: report.jobId,
          candidateName: report.candidateName,
          candidateEmail: report.candidateEmail,
          jobTitle: report.jobTitle,
          organization: report.organization,
          interviewStructure: report.interviewStructure,
          completedAt: report.completedAt ? new Date(report.completedAt) : new Date(),
          overallScore: report.overallScore,
          resumeMatchScore: report.resumeMatchScore,
          recommendation: report.recommendation,
          recommendationSummary: report.recommendationSummary,
          strengths: report.strengths,
          areasForImprovement: report.areasForImprovement,
          missingOrUnverifiedSkills: report.missingOrUnverifiedSkills,
          criteriaBreakdown: report.criteriaBreakdown,
          roundResults: report.roundResults,
          transcript: report.transcript,
          recruiterDecision: report.recruiterDecision,
          recruiterNotes: report.recruiterNotes,
          decisionTimestamp: report.decisionTimestamp ? new Date(report.decisionTimestamp) : undefined,
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[Mongo] Failed to sync report to MongoDB:', e);
    }
  }

  public addUser(user: User): User {
    this.state.users.push(user);
    this.save();
    this.syncUserToMongo(user).catch(() => {});
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    this.save();
    this.syncUserToMongo(this.state.users[idx]).catch(() => {});
    return this.state.users[idx];
  }

  // Jobs
  public getJobs(): JobOpening[] {
    return this.state.jobs;
  }

  public getJobById(id: string): JobOpening | undefined {
    return this.state.jobs.find((j) => j.id === id);
  }

  public addJob(job: JobOpening): JobOpening {
    this.state.jobs.unshift(job);
    this.save();
    this.syncJobToMongo(job).catch(() => {});
    return job;
  }

  public updateJob(id: string, updates: Partial<JobOpening>): JobOpening | undefined {
    const idx = this.state.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    this.state.jobs[idx] = { ...this.state.jobs[idx], ...updates };
    this.save();
    this.syncJobToMongo(this.state.jobs[idx]).catch(() => {});
    return this.state.jobs[idx];
  }

  public deleteJob(id: string): boolean {
    const prevLen = this.state.jobs.length;
    this.state.jobs = this.state.jobs.filter((j) => j.id !== id);
    this.save();
    return this.state.jobs.length < prevLen;
  }

  // Candidates
  public getCandidates(): Candidate[] {
    return this.state.candidates;
  }

  public getCandidateById(id: string): Candidate | undefined {
    return this.state.candidates.find((c) => c.id === id);
  }

  public getCandidateByToken(token: string): Candidate | undefined {
    return this.state.candidates.find((c) => c.invitationToken === token);
  }

  public addCandidate(candidate: Candidate): Candidate {
    this.state.candidates.unshift(candidate);
    this.save();
    this.syncCandidateToMongo(candidate).catch(() => {});
    return candidate;
  }

  public updateCandidate(id: string, updates: Partial<Candidate>): Candidate | undefined {
    const idx = this.state.candidates.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.state.candidates[idx] = { ...this.state.candidates[idx], ...updates };
    this.save();
    this.syncCandidateToMongo(this.state.candidates[idx]).catch(() => {});
    return this.state.candidates[idx];
  }

  // Sessions
  public getSession(token: string): InterviewSession | undefined {
    return this.state.sessions[token];
  }

  public saveSession(token: string, session: InterviewSession): void {
    this.state.sessions[token] = session;
    this.save();
  }

  // Reports
  public getReports(): InterviewReport[] {
    return this.state.reports;
  }

  public getReportById(id: string): InterviewReport | undefined {
    return this.state.reports.find((r) => r.id === id);
  }

  public getReportByCandidateId(candidateId: string): InterviewReport | undefined {
    return this.state.reports.find((r) => r.candidateId === candidateId);
  }

  public addReport(report: InterviewReport): InterviewReport {
    const idx = this.state.reports.findIndex((r) => r.candidateId === report.candidateId);
    if (idx !== -1) {
      this.state.reports[idx] = report;
    } else {
      this.state.reports.unshift(report);
    }
    this.save();
    this.syncReportToMongo(report).catch(() => {});
    return report;
  }

  // Logs
  public log(level: 'info' | 'warn' | 'error', message: string, details?: any): void {
    this.state.systemLogs.unshift({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    });
    if (this.state.systemLogs.length > 200) {
      this.state.systemLogs.pop();
    }
    this.save();
  }

  public getLogs() {
    return this.state.systemLogs;
  }

  // Settings
  public getSettings() {
    return this.state.platformSettings;
  }

  public updateSettings(updates: Partial<DatabaseState['platformSettings']>) {
    this.state.platformSettings = { ...this.state.platformSettings, ...updates };
    this.save();
    return this.state.platformSettings;
  }

  // Recruiter Analytics (Computed from real records)
  public getRecruiterAnalytics(recruiterId?: string): RecruiterAnalytics {
    const jobs = recruiterId
      ? this.state.jobs.filter((j) => j.recruiterId === recruiterId)
      : this.state.jobs;
    const jobIds = new Set(jobs.map((j) => j.id));
    const candidates = this.state.candidates.filter((c) => jobIds.has(c.jobId));

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'active').length;
    const totalCandidates = candidates.length;
    const interviewsScheduled = candidates.filter((c) => c.status === 'invited' || c.status === 'not_started').length;
    const interviewsCompleted = candidates.filter((c) => c.status === 'completed' || c.status === 'shortlisted' || c.status === 'selected' || c.status === 'rejected' || c.status === 'on_hold').length;
    const interviewsInProgress = candidates.filter((c) => c.status === 'in_progress').length;

    const shortlistedCount = candidates.filter((c) => c.recruiterDecision === 'shortlisted' || c.status === 'shortlisted').length;
    const onHoldCount = candidates.filter((c) => c.recruiterDecision === 'on_hold' || c.status === 'on_hold').length;
    const rejectedCount = candidates.filter((c) => c.recruiterDecision === 'rejected' || c.status === 'rejected').length;
    const selectedCount = candidates.filter((c) => c.recruiterDecision === 'selected' || c.status === 'selected').length;

    const scoredCandidates = candidates.filter((c) => typeof c.overallScore === 'number');
    const avgInterviewScore = scoredCandidates.length
      ? Math.round(scoredCandidates.reduce((acc, c) => acc + (c.overallScore || 0), 0) / scoredCandidates.length)
      : 0;

    const startedInterviews = interviewsCompleted + interviewsInProgress;
    const completionRate = startedInterviews > 0
      ? Math.round((interviewsCompleted / startedInterviews) * 100)
      : 0;
    const dropOffRate = startedInterviews > 0
      ? Math.round((interviewsInProgress / startedInterviews) * 100)
      : 0;

    const jobWiseDistribution = jobs.map((j) => {
      const cands = candidates.filter((c) => c.jobId === j.id);
      const scored = cands.filter((c) => typeof c.overallScore === 'number');
      const avg = scored.length ? Math.round(scored.reduce((acc, c) => acc + (c.overallScore || 0), 0) / scored.length) : 0;
      return {
        jobTitle: j.title,
        candidateCount: cands.length,
        avgScore: avg,
      };
    });

    const roundPerformanceMap: Record<string, { totalScore: number; count: number }> = {};
    for (const r of this.state.reports) {
      if (Array.isArray(r.roundResults)) {
        for (const rr of r.roundResults) {
          if (!roundPerformanceMap[rr.roundName]) {
            roundPerformanceMap[rr.roundName] = { totalScore: 0, count: 0 };
          }
          roundPerformanceMap[rr.roundName].totalScore += rr.score || 0;
          roundPerformanceMap[rr.roundName].count += 1;
        }
      }
    }
    const roundWisePerformance = Object.keys(roundPerformanceMap).length > 0
      ? Object.entries(roundPerformanceMap).map(([roundName, data]) => ({
          roundName,
          avgScore: Math.round(data.totalScore / data.count),
        }))
      : [
          { roundName: 'Resume Screening', avgScore: 0 },
          { roundName: 'HR Screening', avgScore: 0 },
          { roundName: 'Technical Round', avgScore: 0 },
          { roundName: 'Managerial Round', avgScore: 0 },
          { roundName: 'Final HR Discussion', avgScore: 0 },
        ];

    return {
      totalJobs,
      activeJobs,
      totalCandidates,
      interviewsScheduled,
      interviewsCompleted,
      interviewsInProgress,
      shortlistedCount,
      onHoldCount,
      rejectedCount,
      selectedCount,
      avgInterviewScore,
      completionRate,
      dropOffRate,
      jobWiseDistribution,
      roundWisePerformance,
    };
  }

  // Super Admin Analytics
  public getSuperAdminAnalytics(): SuperAdminAnalytics {
    const recruiters = this.state.users.filter((u) => u.role === 'recruiter');
    const totalRecruiters = recruiters.length;
    const activeRecruiters = recruiters.filter((u) => u.isActive).length;
    const organizations = new Set(this.state.users.map((u) => u.organization).filter(Boolean));
    const totalOrganizations = organizations.size;

    const totalJobs = this.state.jobs.length;
    const totalCandidates = this.state.candidates.length;
    const completedInterviews = this.state.candidates.filter((c) => c.status === 'completed' || !!c.recruiterDecision).length;
    const interviewsInProgress = this.state.candidates.filter((c) => c.status === 'in_progress').length;
    const started = completedInterviews + interviewsInProgress;
    const platformCompletionRate = started > 0 ? Math.round((completedInterviews / started) * 100) : 0;

    const scored = this.state.candidates.filter((c) => typeof c.overallScore === 'number');
    const avgInterviewScore = scored.length ? Math.round(scored.reduce((a, b) => a + (b.overallScore || 0), 0) / scored.length) : 0;

    return {
      totalRecruiters,
      activeRecruiters,
      totalOrganizations,
      totalJobs,
      totalCandidates,
      completedInterviews,
      interviewsInProgress,
      platformCompletionRate,
      avgInterviewScore,
      abandonmentRate: started > 0 ? Math.round((interviewsInProgress / started) * 100) : 0,
      apiUsageCount: this.state.candidates.length * 12,
      systemHealth: '100% Operational',
    };
  }
}

export const db = new Database();
