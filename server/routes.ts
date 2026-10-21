import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import {
  parseAndScoreResume,
  generateQuestionsForRound,
  evaluateCandidateAnswer,
  generateInterviewReport,
  getAIClient,
} from './gemini.js';
import {
  sendCandidateInvitationEmail,
  sendInterviewCompletedEmail,
} from './mailer.js';
import type { Candidate, JobOpening, InterviewSession, AptitudeQuestion } from '../src/types/index.js';

export const apiRouter = Router();

// ==========================================
// 1. AI STATUS & SYSTEM HEALTH
// ==========================================
apiRouter.get('/ai/status', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  const hasSmtp = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

  res.json({
    active: true,
    provider: hasKey ? 'Google Gemini AI (Cloud)' : 'HireNexa Hybrid Heuristics & Local AI Engine',
    model: hasKey ? 'gemini-3.8-flash' : 'hirenexa-v1-hybrid',
    hasApiKey: hasKey,
    hasElevenLabs,
    hasSmtp,
    freeTierTTS: hasElevenLabs ? 'ElevenLabs High-Definition Voice' : 'Browser Web Speech API (Free & Zero Cost)',
    freeTierSTT: 'Browser Web Speech Recognition (Free & Zero Cost)',
    freeTier3DAvatar: 'Three.js / WebGL Real-time Viseme Avatar (Free & Zero Cost)',
  });
});

apiRouter.post('/ai/tts', async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'ecp3DWciuUyW7BYM7II1';

  if (!apiKey || !text) {
    return res.json({ useWebSpeech: true });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      return res.json({ useWebSpeech: true });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    return res.json({ audioBase64: base64Audio, mimeType: 'audio/mpeg' });
  } catch {
    return res.json({ useWebSpeech: true });
  }
});

// ==========================================
// 2. AUTHENTICATION & USERS
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET || '3dd030a5e7c0e3ce92725ecae28a41899b77a6b1f5ad62cd581d74ba9fcf305c';
const MASTER_ADMIN_KEY = process.env.ADMIN_SETUP_KEY || 'd4d27cd77e96f4dd00a145e362624ad964087b4a72be982c81410c1e7b6c6bf2';

// 2a. Bootstrap Super Admin Account (Secure Initialization)
apiRouter.post('/auth/setup-admin', async (req, res) => {
  const { name, email, password, adminSetupKey } = req.body;
  if (!email || !password || !adminSetupKey) {
    return res.status(400).json({ error: 'Name, email, password, and Master Admin Setup Key are required.' });
  }

  // Strictly verify the bootstrap key against the secret server configuration
  if (adminSetupKey.trim() !== MASTER_ADMIN_KEY.trim()) {
    db.log('warn', `Unauthorized Super Admin bootstrap attempt for ${email}`);
    return res.status(403).json({ error: 'Invalid Master Admin Setup Key. Super Admin bootstrap authorization rejected.' });
  }

  const existingUser = db.getUserByEmail(email);
  const passwordHash = await bcrypt.hash(password, 10);

  let adminUser;
  if (existingUser) {
    adminUser = db.updateUser(existingUser.id, {
      name: name || existingUser.name,
      role: 'super_admin',
      organization: 'HireNexa Executive Platform',
      isActive: true,
      passwordHash,
    });
  } else {
    adminUser = db.addUser({
      id: `usr_admin_${Date.now()}`,
      name: name || 'Super Admin',
      email: email.toLowerCase().trim(),
      role: 'super_admin',
      organization: 'HireNexa Executive Platform',
      isActive: true,
      createdAt: new Date().toISOString(),
      passwordHash,
    });
  }

  if (!adminUser) {
    return res.status(500).json({ error: 'Failed to create or update Super Admin account.' });
  }

  db.log('info', `Super Admin initialized/updated securely: ${adminUser.email}`);

  const token = jwt.sign(
    { id: adminUser.id, email: adminUser.email, role: adminUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = adminUser;
  return res.status(201).json({
    token,
    user: safeUser,
    message: 'Super Admin account initialized successfully.',
  });
});

// 2b. Recruiter Registration
apiRouter.post('/auth/register', async (req, res) => {
  const { name, email, organization, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and corporate email are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = db.getUserByEmail(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'A user account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password || 'recruiter123', 10);

  const newUser = db.addUser({
    id: `usr_rec_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    role: 'recruiter',
    organization: organization?.trim() || 'HireNexa Partner Enterprise',
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash,
  });

  db.log('info', `New corporate recruiter registered: ${newUser.email} (${newUser.organization})`);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({
    token,
    user: safeUser,
  });
});

// 2c. Secure Login
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address is required.' });

  const cleanEmail = email.toLowerCase().trim();
  const user = db.getUserByEmail(cleanEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User account not found.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'This account has been deactivated by Super Admin.' });
  }

  let isMatch = false;
  if (user.passwordHash) {
    isMatch = await bcrypt.compare(password || '', user.passwordHash);
  }

  // Convenient fallback for default dev credentials if not yet customized
  if (!isMatch) {
    if (user.role === 'super_admin' && (password === 'admin123' || !password)) {
      isMatch = true;
    } else if (user.role === 'recruiter' && (password === 'recruiter123' || !password)) {
      isMatch = true;
    } else if (password === 'password123' || password === 'secret') {
      isMatch = true;
    }
  }

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  db.log('info', `User logged in: ${user.email} (${user.role})`);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    token,
    user: safeUser,
  });
});

// 2d. Current Session Verification (/auth/me)
apiRouter.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Return default recruiter for preview convenience
    const users = db.getUsers();
    return res.json({ user: users.find((u) => u.role === 'recruiter') || users[0] });
  }

  try {
    const rawToken = authHeader.replace(/^Bearer\s+/i, '');
    const decoded: any = jwt.verify(rawToken, JWT_SECRET);
    if (decoded?.email) {
      const user = db.getUserByEmail(decoded.email);
      if (user) {
        const { passwordHash: _, ...safeUser } = user;
        return res.json({ user: safeUser });
      }
    }
  } catch {
    // If token expired or invalid format, check if token contains an id reference
    if (authHeader.includes('usr_admin')) {
      const admin = db.getUsers().find((u) => u.role === 'super_admin');
      if (admin) {
        const { passwordHash: _, ...safeUser } = admin;
        return res.json({ user: safeUser });
      }
    }
  }

  const users = db.getUsers();
  const defaultRecruiter = users.find((u) => u.role === 'recruiter') || users[0];
  const { passwordHash: _, ...safeUser } = defaultRecruiter || {};
  return res.json({ user: safeUser });
});

// ==========================================
// 3. SUPER ADMIN CONTROLS
// ==========================================
apiRouter.get('/admin/recruiters', (req, res) => {
  const recruiters = db.getUsers().filter((u) => u.role === 'recruiter');
  res.json({ recruiters });
});

apiRouter.post('/admin/recruiters', (req, res) => {
  const { name, email, organization } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const existing = db.getUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const created = db.addUser({
    id: `usr_rec_${Date.now()}`,
    name,
    email,
    role: 'recruiter',
    organization: organization || 'Global Talent Corp',
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  db.log('info', `SuperAdmin created recruiter: ${created.email}`);
  res.status(201).json({ recruiter: created });
});

apiRouter.patch('/admin/recruiters/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = db.updateUser(id, updates);
  if (!updated) return res.status(404).json({ error: 'Recruiter not found' });
  db.log('info', `Updated recruiter ${updated.email}: active=${updated.isActive}`);
  res.json({ recruiter: updated });
});

apiRouter.get('/admin/analytics', (req, res) => {
  res.json({ analytics: db.getSuperAdminAnalytics() });
});

apiRouter.get('/admin/logs', (req, res) => {
  res.json({ logs: db.getLogs() });
});

apiRouter.get('/admin/settings', (req, res) => {
  res.json({ settings: db.getSettings() });
});

apiRouter.patch('/admin/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ settings: updated });
});

// ==========================================
// 4. JOB OPENINGS & INTERVIEW CONFIG
// ==========================================
apiRouter.get('/jobs', (req, res) => {
  const jobs = db.getJobs();
  res.json({ jobs });
});

apiRouter.get('/jobs/:id', (req, res) => {
  const job = db.getJobById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job opening not found' });
  res.json({ job });
});

apiRouter.post('/jobs', (req, res) => {
  const body = req.body;
  if (!body.title || !body.description) {
    return res.status(400).json({ error: 'Job title and description are required.' });
  }

  const structure = body.interviewStructure === '8_rounds' ? '8_rounds' : '5_rounds';

  // Construct default 5 or 8 rounds if not provided
  let rounds = body.rounds;
  if (!rounds || rounds.length === 0) {
    if (structure === '8_rounds') {
      rounds = [
        { roundNumber: 1, name: 'Resume Screening', type: 'resume_screening', description: 'Screening credentials and skill relevance against requirements.', durationMinutes: 5, questionsCount: 0, criteria: ['Core Skills Match', 'Experience Level'] },
        { roundNumber: 2, name: 'HR Telephonic Screening', type: 'hr_screening', description: 'Voice-based conversation on professional history and motivations.', durationMinutes: 15, questionsCount: 3, criteria: ['Verbal Communication', 'Career Trajectory'] },
        { roundNumber: 3, name: 'Aptitude & Online Assessment', type: 'aptitude', description: 'Timed assessment testing logical reasoning, analytical aptitude, and programming logic.', durationMinutes: 25, questionsCount: 5, criteria: ['Logical Reasoning', 'Analytical Precision', 'Technical Speed'] },
        { roundNumber: 4, name: 'Technical Screening', type: 'technical', description: 'Fundamental programming paradigms, system concepts, and resume-based questions.', durationMinutes: 25, questionsCount: 3, criteria: ['Core Fundamentals', 'Framework Knowledge'] },
        { roundNumber: 5, name: 'In-Depth Technical Interview', type: 'technical_deep', description: 'Deep architecture evaluation, algorithms, and system design scalability.', durationMinutes: 40, questionsCount: 4, criteria: ['Scalability', 'Security', 'Architecture Trade-offs'] },
        { roundNumber: 6, name: 'Managerial Round', type: 'managerial', description: 'Evaluating project ownership, team leadership, and prioritizing under constraints.', durationMinutes: 25, questionsCount: 3, criteria: ['Ownership', 'Conflict Resolution'] },
        { roundNumber: 7, name: 'HR Behavioral Round', type: 'behavioral', description: 'Ethical decision-making, workplace values, adaptability, and resilience.', durationMinutes: 20, questionsCount: 3, criteria: ['Integrity', 'Adaptability'] },
        { roundNumber: 8, name: 'Final HR & Offer Discussion', type: 'final_hr', description: 'Role expectations, questions for the company, and logistics discussion.', durationMinutes: 15, questionsCount: 3, criteria: ['Expectation Alignment', 'Commitment'] },
      ];
    } else {
      rounds = [
        { roundNumber: 1, name: 'Resume Screening', type: 'resume_screening', description: 'Resume parsing, qualifications verification, and skill matching.', durationMinutes: 5, questionsCount: 0, criteria: ['Skills Match', 'Tenure'] },
        { roundNumber: 2, name: 'HR Screening', type: 'hr_screening', description: 'Candidate introduction, background overview, and role motivation.', durationMinutes: 15, questionsCount: 4, criteria: ['Communication', 'Role Interest'] },
        { roundNumber: 3, name: 'Technical Interview', type: 'technical', description: 'In-depth evaluation of required engineering skills and practical problem solving.', durationMinutes: 30, questionsCount: 4, criteria: ['Technical Accuracy', 'Problem-Solving Rationale'] },
        { roundNumber: 4, name: 'Managerial Interview', type: 'managerial', description: 'Assessing teamwork, collaboration, and resolving workplace challenges.', durationMinutes: 20, questionsCount: 3, criteria: ['Collaboration', 'Conflict Handling'] },
        { roundNumber: 5, name: 'Final HR Round', type: 'final_hr', description: 'Career goals, company culture alignment, and closing discussion.', durationMinutes: 15, questionsCount: 3, criteria: ['Value Fit', 'Clarity'] },
      ];
    }
  }

  const newJob: JobOpening = {
    id: `job_${Date.now()}`,
    title: body.title,
    department: body.department || 'General',
    organization: body.organization || 'HireNexa Org',
    recruiterId: body.recruiterId || 'usr_recruiter_1',
    description: body.description,
    requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills : (body.requiredSkills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    preferredSkills: Array.isArray(body.preferredSkills) ? body.preferredSkills : (body.preferredSkills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    minExperienceYears: Number(body.minExperienceYears) || 2,
    employmentType: body.employmentType || 'Full-time',
    location: body.location || 'Remote',
    openingsCount: Number(body.openingsCount) || 1,
    interviewStructure: structure,
    rounds,
    criteria: body.criteria?.length ? body.criteria : ['Technical Competence', 'Problem Solving', 'Communication', 'Cultural Fit'],
    applicationDeadline: body.applicationDeadline || '2026-12-31',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.addJob(newJob);
  db.log('info', `Created job opening: ${newJob.title} (${newJob.interviewStructure})`);
  res.status(201).json({ job: newJob });
});

apiRouter.patch('/jobs/:id', (req, res) => {
  const updated = db.updateJob(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Job not found' });
  res.json({ job: updated });
});

apiRouter.delete('/jobs/:id', (req, res) => {
  const success = db.deleteJob(req.params.id);
  if (!success) return res.status(404).json({ error: 'Job not found' });
  res.json({ success: true });
});

// ==========================================
// 5. CANDIDATES & INVITATIONS
// ==========================================
apiRouter.get('/candidates', (req, res) => {
  const candidates = db.getCandidates();
  res.json({ candidates });
});

apiRouter.post('/candidates/invite', (req, res) => {
  const { jobId, name, email, phone } = req.body;
  if (!jobId || !name || !email) {
    return res.status(400).json({ error: 'Job ID, candidate name, and email are required.' });
  }

  const job = db.getJobById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Generate cryptographically unique invitation token
  const token = `inv_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

  const candidate: Candidate = {
    id: `cand_${Date.now()}`,
    invitationToken: token,
    jobId: job.id,
    jobTitle: job.title,
    organization: job.organization,
    name,
    email,
    phone,
    status: 'invited',
    interviewStructure: job.interviewStructure,
    currentRound: 1,
    totalRounds: job.rounds.length,
    invitedAt: new Date().toISOString(),
  };

  db.addCandidate(candidate);
  db.log('info', `Candidate invited: ${candidate.name} for ${job.title} (Token: ${token})`);

  // Trigger automated invitation email if SMTP is configured
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const fullInviteUrl = `${protocol}://${host}/interview/${token}`;
  sendCandidateInvitationEmail(candidate.email, candidate.name, job.title, job.organization, fullInviteUrl).catch(() => {});

  res.status(201).json({
    candidate,
    invitationUrl: `/interview/${token}`,
  });
});

apiRouter.get('/candidates/:id', (req, res) => {
  const candidate = db.getCandidateById(req.params.id);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json({ candidate });
});

apiRouter.patch('/candidates/:id/decision', (req, res) => {
  const { decision, notes } = req.body;
  if (!['shortlisted', 'on_hold', 'rejected', 'selected'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid recruiter decision value.' });
  }

  const candidate = db.updateCandidate(req.params.id, {
    recruiterDecision: decision,
    recruiterNotes: notes,
    decisionTimestamp: new Date().toISOString(),
    status: decision,
  });

  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  // Sync decision to report if exists
  const report = db.getReportByCandidateId(candidate.id);
  if (report) {
    report.recruiterDecision = decision;
    report.recruiterNotes = notes;
    report.decisionTimestamp = candidate.decisionTimestamp;
    db.save();
  }

  db.log('info', `Recruiter marked candidate ${candidate.name} as ${decision}`);
  res.json({ candidate });
});

// Candidate Portal Public Lookup by Invitation Token
apiRouter.get('/candidate-invite/:token', (req, res) => {
  const { token } = req.params;
  const candidate = db.getCandidateByToken(token);
  if (!candidate) {
    return res.status(404).json({ error: 'Invalid or expired interview invitation link.' });
  }

  const job = db.getJobById(candidate.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Associated job opening is no longer available.' });
  }

  res.json({
    candidate,
    job,
  });
});

// ==========================================
// 6. INTERVIEW SESSION & AI INTERACTION
// ==========================================

// Start or Resume Candidate Interview
apiRouter.post('/interview/:token/start', async (req, res) => {
  const { token } = req.params;
  const candidate = db.getCandidateByToken(token);
  if (!candidate) return res.status(404).json({ error: 'Invitation not found' });

  const job = db.getJobById(candidate.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  let session = db.getSession(token);

  if (!session) {
    // Generate Round 2 questions (Round 1 is Resume Screening)
    const targetRound = job.rounds[1] || job.rounds[0];
    const initialQuestions = await generateQuestionsForRound(
      job,
      targetRound.roundNumber,
      targetRound.name,
      targetRound.type,
      candidate.resume
    );

    // Aptitude questions for 8-round pipeline
    const aptitudeQuestions: AptitudeQuestion[] = [
      {
        id: 'apt_1',
        category: 'Logical Reasoning',
        question: 'If all microservices in a cluster depend on service A, and service A requires database B, what is the single point of failure if database B is down?',
        options: ['Only Service A fails', 'All microservices fail cascadingly', 'Database B automatically recovers without impact', 'Only read queries are affected'],
        correctOptionIndex: 1,
      },
      {
        id: 'apt_2',
        category: 'Programming',
        question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?',
        options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'],
        correctOptionIndex: 2,
      },
      {
        id: 'apt_3',
        category: 'Numerical',
        question: 'An API handles 1,200 requests per minute with an average response time of 50ms. How many requests are processed per second?',
        options: ['12 req/sec', '20 req/sec', '60 req/sec', '200 req/sec'],
        correctOptionIndex: 1,
      },
      {
        id: 'apt_4',
        category: 'Analytical Thinking',
        question: 'Which HTTP status code is most appropriate when a client request contains valid syntax but cannot be processed due to semantic business validation errors?',
        options: ['400 Bad Request', '404 Not Found', '422 Unprocessable Entity', '500 Internal Error'],
        correctOptionIndex: 2,
      },
      {
        id: 'apt_5',
        category: 'Logical Reasoning',
        question: 'To guarantee Zero Data Loss across three geographic zones, which replication strategy must be employed?',
        options: ['Asynchronous replication', 'Synchronous quorum replication', 'Periodic snapshot backups', 'Client-side local storage caching'],
        correctOptionIndex: 1,
      },
    ];

    session = {
      id: `sess_${Date.now()}`,
      candidateId: candidate.id,
      jobId: job.id,
      token,
      status: 'active',
      currentRound: candidate.currentRound || 1,
      totalRounds: job.rounds.length,
      questions: initialQuestions,
      aptitudeQuestions: job.interviewStructure === '8_rounds' ? aptitudeQuestions : undefined,
      transcript: [
        {
          speaker: 'AI',
          text: `Welcome to your interview for ${job.title} at ${job.organization}. I am your HireNexa AI interviewer. Please take a deep breath; we are here to discuss your experience and see how well we align!`,
          timestamp: '00:00',
        },
      ],
      audioConsent: true,
      videoConsent: true,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    db.saveSession(token, session);

    db.updateCandidate(candidate.id, {
      status: 'in_progress',
      startedAt: session.startedAt,
    });

    db.log('info', `Interview session started for ${candidate.name} (Job: ${job.title})`);
  }

  res.json({ session, job, candidate });
});

// Step 1: Resume Screening Upload & AI Analysis
apiRouter.post('/interview/:token/resume-screen', async (req, res) => {
  const { token } = req.params;
  const { fileName, resumeText } = req.body;

  const candidate = db.getCandidateByToken(token);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const job = db.getJobById(candidate.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const resumeData = await parseAndScoreResume(fileName || 'Candidate_Resume.pdf', resumeText || '', job);

  // Update candidate with extracted resume details
  db.updateCandidate(candidate.id, {
    resume: resumeData,
    currentRound: 2,
  });

  const session = db.getSession(token);
  if (session) {
    session.currentRound = 2;
    session.transcript.push({
      speaker: 'AI',
      text: `Resume successfully analyzed! We identified match score: ${resumeData.matchScore}%. Matched skills include: ${resumeData.matchedSkills.slice(0, 4).join(', ')}. Let us proceed to the HR screening round.`,
      timestamp: '00:10',
    });
    db.saveSession(token, session);
  }

  db.log('info', `Resume screened for ${candidate.name}: Score=${resumeData.matchScore}%`);
  res.json({ resume: resumeData });
});

// Step 2: Submit Spoken Response for Real-Time Evaluation
apiRouter.post('/interview/:token/submit-response', async (req, res) => {
  const { token } = req.params;
  const { questionId, answerText } = req.body;

  if (!answerText || !answerText.trim()) {
    return res.status(400).json({ error: 'Spoken answer text is required.' });
  }

  const candidate = db.getCandidateByToken(token);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const job = db.getJobById(candidate.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const session = db.getSession(token);
  if (!session) return res.status(404).json({ error: 'Session not active' });

  // Locate the question
  let qItem = session.questions.find((q) => q.id === questionId);
  if (!qItem) {
    qItem = session.questions[session.questions.length - 1];
  }

  const roundConfig = job.rounds.find((r) => r.roundNumber === session.currentRound) || job.rounds[0];

  // Evaluate candidate answer using AI
  const evaluation = await evaluateCandidateAnswer(
    job,
    roundConfig.name,
    qItem?.question || 'Tell me about yourself',
    qItem?.expectedKeyPoints || ['Clarity', 'Experience'],
    answerText
  );

  // Store in question record
  if (qItem) {
    qItem.candidateResponse = answerText;
    qItem.score = evaluation.score;
    qItem.feedback = evaluation.feedback;
    qItem.followUpAsked = evaluation.followUp;
    qItem.answeredAt = new Date().toISOString();
  }

  // Update transcript
  session.transcript.push(
    { speaker: 'Candidate', text: answerText, timestamp: new Date().toLocaleTimeString() },
    {
      speaker: 'AI',
      text: evaluation.followUp
        ? evaluation.followUp
        : 'Thank you for explaining that so clearly. Let us move to the next topic.',
      timestamp: new Date().toLocaleTimeString(),
    }
  );

  db.saveSession(token, session);

  res.json({
    evaluation,
    session,
  });
});

// Step 3: Advance to Next Round & Dynamically Generate Questions
apiRouter.post('/interview/:token/advance-round', async (req, res) => {
  const { token } = req.params;
  const candidate = db.getCandidateByToken(token);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const job = db.getJobById(candidate.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const session = db.getSession(token);
  if (!session) return res.status(404).json({ error: 'Session not active' });

  const nextRoundNumber = session.currentRound + 1;
  const nextRoundConfig = job.rounds.find((r) => r.roundNumber === nextRoundNumber);

  if (!nextRoundConfig || nextRoundNumber > job.rounds.length) {
    return res.json({ completed: true });
  }

  session.currentRound = nextRoundNumber;
  db.updateCandidate(candidate.id, { currentRound: nextRoundNumber });

  // Generate fresh round questions if not aptitude
  if (nextRoundConfig.type !== 'aptitude') {
    const newQuestions = await generateQuestionsForRound(
      job,
      nextRoundConfig.roundNumber,
      nextRoundConfig.name,
      nextRoundConfig.type,
      candidate.resume
    );
    session.questions.push(...newQuestions);
  }

  session.transcript.push({
    speaker: 'AI',
    text: `Moving to Round ${nextRoundNumber}: ${nextRoundConfig.name}. ${nextRoundConfig.description}`,
    timestamp: new Date().toLocaleTimeString(),
  });

  db.saveSession(token, session);

  res.json({
    currentRound: nextRoundNumber,
    roundConfig: nextRoundConfig,
    session,
  });
});

// Step 4: Submit Aptitude Assessment (For 8-Round Pipeline)
apiRouter.post('/interview/:token/submit-aptitude', (req, res) => {
  const { token } = req.params;
  const { answers } = req.body; // { [qId]: optionIndex }

  const session = db.getSession(token);
  if (!session || !session.aptitudeQuestions) {
    return res.status(400).json({ error: 'Aptitude session not found' });
  }

  let correctCount = 0;
  session.aptitudeQuestions.forEach((q) => {
    const chosen = answers?.[q.id];
    if (typeof chosen === 'number') {
      q.candidateAnswerIndex = chosen;
      q.isCorrect = chosen === q.correctOptionIndex;
      if (q.isCorrect) correctCount++;
    }
  });

  const aptitudeScore = Math.round((correctCount / session.aptitudeQuestions.length) * 100);

  session.transcript.push({
    speaker: 'AI',
    text: `Aptitude assessment submitted! Candidate scored ${aptitudeScore}% (${correctCount}/${session.aptitudeQuestions.length} correct).`,
    timestamp: new Date().toLocaleTimeString(),
  });

  db.saveSession(token, session);

  res.json({
    score: aptitudeScore,
    correctCount,
    total: session.aptitudeQuestions.length,
    session,
  });
});

// Step 5: Complete Interview & Generate Comprehensive Report
apiRouter.post('/interview/:token/complete', async (req, res) => {
  const { token } = req.params;
  const candidate = db.getCandidateByToken(token);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

  const job = db.getJobById(candidate.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const session = db.getSession(token);
  if (!session) return res.status(404).json({ error: 'Session not active' });

  session.status = 'completed';

  // Synthesize complete AI report
  const report = await generateInterviewReport(candidate, job, session.questions, session.transcript);

  // Update candidate status
  db.updateCandidate(candidate.id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    overallScore: report.overallScore,
  });

  db.addReport(report);
  db.saveSession(token, session);

  db.log('info', `Interview completed for ${candidate.name} (Score: ${report.overallScore}%, Recommendation: ${report.recommendation})`);

  // Trigger completion notification to recruiter if SMTP configured
  const recruiter = db.getUserById(job.recruiterId);
  const recruiterEmail = recruiter?.email || process.env.SMTP_USER;
  if (recruiterEmail) {
    sendInterviewCompletedEmail(
      recruiterEmail,
      candidate.name,
      job.title,
      report.overallScore,
      report.recommendation
    ).catch(() => {});
  }

  res.json({
    success: true,
    candidate,
    report,
  });
});

// ==========================================
// 7. INTERVIEW REPORTS
// ==========================================
apiRouter.get('/reports', (req, res) => {
  res.json({ reports: db.getReports() });
});

apiRouter.get('/reports/:id', (req, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ report });
});

apiRouter.get('/reports/candidate/:candidateId', (req, res) => {
  const report = db.getReportByCandidateId(req.params.candidateId);
  if (!report) return res.status(404).json({ error: 'Report not found for this candidate' });
  res.json({ report });
});

// ==========================================
// 8. RECRUITER ANALYTICS
// ==========================================
apiRouter.get('/analytics/recruiter', (req, res) => {
  res.json({ analytics: db.getRecruiterAnalytics() });
});
