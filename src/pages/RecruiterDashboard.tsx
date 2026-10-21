import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Award,
  BarChart3,
  Settings,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  Check,
  Send,
  Eye,
} from 'lucide-react';
import type {
  User,
  JobOpening,
  Candidate,
  InterviewReport,
  RecruiterAnalytics,
  InterviewStructure,
} from '../types/index.js';
import { InterviewReportModal } from './InterviewReportModal.js';

interface RecruiterDashboardProps {
  currentUser: User;
  onOpenCandidateLink: (token: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  currentUser,
  onOpenCandidateLink,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'jobs' | 'create_job' | 'candidates' | 'reports' | 'analytics'
  >('overview');

  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [analytics, setAnalytics] = useState<RecruiterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected report modal
  const [selectedReport, setSelectedReport] = useState<InterviewReport | null>(null);

  // Candidate invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteJobId, setInviteJobId] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Job creation form
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReqSkills, setJobReqSkills] = useState('');
  const [jobPrefSkills, setJobPrefSkills] = useState('');
  const [jobStructure, setJobStructure] = useState<InterviewStructure>('5_rounds');
  const [jobExperience, setJobExperience] = useState(3);
  const [jobLocation, setJobLocation] = useState('Remote');
  const [savingJob, setSavingJob] = useState(false);

  // Filtering candidates
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJob, setFilterJob] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [jRes, cRes, rRes, aRes] = await Promise.all([
        fetch('/api/jobs').then((r) => r.json()),
        fetch('/api/candidates').then((r) => r.json()),
        fetch('/api/reports').then((r) => r.json()),
        fetch('/api/analytics/recruiter').then((r) => r.json()),
      ]);

      if (jRes.jobs) setJobs(jRes.jobs);
      if (cRes.candidates) setCandidates(cRes.candidates);
      if (rRes.reports) setReports(rRes.reports);
      if (aRes.analytics) setAnalytics(aRes.analytics);

      if (jRes.jobs?.length > 0 && !inviteJobId) {
        setInviteJobId(jRes.jobs[0].id);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          department: jobDept,
          organization: currentUser.organization || 'HireNexa Org',
          recruiterId: currentUser.id,
          description: jobDesc,
          requiredSkills: jobReqSkills,
          preferredSkills: jobPrefSkills,
          interviewStructure: jobStructure,
          minExperienceYears: jobExperience,
          location: jobLocation,
        }),
      });

      const data = await res.json();
      if (data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setActiveTab('jobs');
        // Reset form
        setJobTitle('');
        setJobDept('');
        setJobDesc('');
        setJobReqSkills('');
        setJobPrefSkills('');
      }
    } catch (e) {
      console.error('Failed to create job:', e);
    } finally {
      setSavingJob(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/candidates/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: inviteJobId,
          name: inviteName,
          email: inviteEmail,
          phone: invitePhone,
        }),
      });
      const data = await res.json();
      if (data.candidate) {
        setCandidates((prev) => [data.candidate, ...prev]);
        const fullLink = `${window.location.origin}/interview/${data.candidate.invitationToken}`;
        setGeneratedInviteLink(fullLink);
      }
    } catch (e) {
      console.error('Failed to invite candidate:', e);
    }
  };

  const handleCreateQuickTemplate = async (structure: InterviewStructure) => {
    setSavingJob(true);
    try {
      const is8 = structure === '8_rounds';
      const templateTitle = is8 ? 'Lead Cloud Solutions Architect' : 'Senior Full-Stack AI Engineer';
      const templateDesc = is8
        ? 'Lead multi-region Kubernetes deployments, automated CI/CD pipelines, and high-resilience distributed systems.'
        : 'Design and deploy scalable intelligent applications integrating LLMs, Node.js, React, and cloud architectures.';
      const templateReqSkills = is8
        ? 'Kubernetes, AWS / GCP, Terraform, Microservices, Distributed Systems'
        : 'TypeScript, React, Node.js, Python, LLMs / Generative AI, REST APIs';

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: templateTitle,
          department: is8 ? 'Infrastructure' : 'Engineering & AI',
          organization: currentUser.organization || 'TechVision Labs',
          recruiterId: currentUser.id,
          description: templateDesc,
          requiredSkills: templateReqSkills,
          interviewStructure: structure,
          minExperienceYears: is8 ? 6 : 3,
          location: 'Remote',
        }),
      });
      const data = await res.json();
      if (data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setActiveTab('jobs');
      }
    } catch (e) {
      console.error('Failed to create template job:', e);
    } finally {
      setSavingJob(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveDecision = async (
    candidateId: string,
    decision: 'shortlisted' | 'on_hold' | 'rejected' | 'selected',
    notes: string
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();
      if (data.candidate) {
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? data.candidate : c)));
        if (selectedReport && selectedReport.candidateId === candidateId) {
          setSelectedReport({
            ...selectedReport,
            recruiterDecision: decision,
            recruiterNotes: notes,
          });
        }
      }
    } catch (e) {
      console.error('Failed to update decision:', e);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJob = filterJob === 'all' || c.jobId === filterJob;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {currentUser.organization || 'TechVision Labs'}
            </span>
            <span className="text-slate-400 text-xs">• Recruiter Workspace</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Welcome back, {currentUser.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setGeneratedInviteLink(null);
              setShowInviteModal(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Invite Candidate</span>
          </button>
          <button
            onClick={() => setActiveTab('create_job')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-white/[0.08] transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Create Opening</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto border-b border-white/[0.08] gap-6 text-xs font-semibold text-slate-400 my-6">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'jobs', label: `Job Openings (${jobs.length})`, icon: Briefcase },
          { id: 'candidates', label: `Candidates (${candidates.length})`, icon: Users },
          { id: 'reports', label: `Interview Reports (${reports.length})`, icon: Award },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'create_job', label: 'Create Opening Wizard', icon: PlusCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 flex items-center gap-1.5 whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Active Job Openings</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-white">{analytics.activeJobs}</span>
                <span className="text-xs text-slate-400">{analytics.totalJobs} Total</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Invited Candidates</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-400">{analytics.totalCandidates}</span>
                <span className="text-xs text-emerald-400 font-mono">
                  {analytics.interviewsCompleted} Done
                </span>
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Completion Rate</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400">{analytics.completionRate}%</span>
                <span className="text-xs text-slate-400">{analytics.dropOffRate}% In Progress</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Average Score</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-purple-400">{analytics.avgInterviewScore}</span>
                <span className="text-xs text-slate-400">/ 100 benchmark</span>
              </div>
            </div>
          </div>

          {/* Hiring Decision Funnel Status */}
          <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
            <h3 className="text-xs font-bold text-white mb-4 flex items-center justify-between">
              <span>Candidate Hiring Decisions</span>
              <span className="text-[11px] text-slate-400 font-normal">Updated from real database records</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xl font-bold text-emerald-400">{analytics.shortlistedCount}</span>
                <span className="text-[11px] text-emerald-300 block mt-0.5">Shortlisted</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-xl font-bold text-blue-400">{analytics.selectedCount}</span>
                <span className="text-[11px] text-blue-300 block mt-0.5">Selected (Offer)</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xl font-bold text-amber-400">{analytics.onHoldCount}</span>
                <span className="text-[11px] text-amber-300 block mt-0.5">On Hold</span>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-xl font-bold text-red-400">{analytics.rejectedCount}</span>
                <span className="text-[11px] text-red-300 block mt-0.5">Rejected</span>
              </div>
            </div>
          </div>

          {/* Recent Candidates List preview */}
          <div className="glass-panel rounded-2xl border border-white/[0.08] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white">Recent Interview Activity</h3>
              <button
                onClick={() => setActiveTab('candidates')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                View All Candidates →
              </button>
            </div>
            {candidates.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">No candidate activity yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Generate your first secure candidate invitation link to see interview activity.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.jobTitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          c.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : c.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => onOpenCandidateLink(c.invitationToken)}
                        title="Open Candidate Portal"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/[0.05]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. JOB OPENINGS LIST */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.length === 0 && (
              <div className="col-span-1 md:col-span-2 glass-panel p-10 rounded-3xl border border-white/[0.08] text-center">
                <Briefcase className="w-12 h-12 text-blue-400/60 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Job Openings Created Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                  Configure real job roles with customized 5-round or 8-round interview pipelines, evaluation criteria, and skill requirements.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('create_job')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Job Opening Wizard</span>
                  </button>
                  <button
                    onClick={() => handleCreateQuickTemplate('5_rounds')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/[0.08] transition-colors"
                  >
                    + Load 5-Round Template
                  </button>
                  <button
                    onClick={() => handleCreateQuickTemplate('8_rounds')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/[0.08] transition-colors"
                  >
                    + Load 8-Round Template
                  </button>
                </div>
              </div>
            )}
            {jobs.map((job) => (
              <div
                key={job.id}
                className="glass-panel p-6 rounded-3xl border border-white/[0.08] hover:border-blue-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wide">
                      {job.interviewStructure.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {job.rounds.length} Interview Rounds
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{job.department} • {job.location}</p>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">{job.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.requiredSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-white/[0.06] text-slate-300"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-400">{job.openingsCount} Openings</span>
                  <button
                    onClick={() => {
                      setInviteJobId(job.id);
                      setGeneratedInviteLink(null);
                      setShowInviteModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Invite Candidates</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CANDIDATES LIST */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate by name, email, or role..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Job Openings</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="invited">Invited</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="on_hold">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Candidates Table */}
          <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Candidate</th>
                    <th className="py-3 px-4 font-semibold">Target Opening</th>
                    <th className="py-3 px-4 font-semibold">Resume Match</th>
                    <th className="py-3 px-4 font-semibold">Current Round</th>
                    <th className="py-3 px-4 font-semibold">Score</th>
                    <th className="py-3 px-4 font-semibold">Decision</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredCandidates.map((cand) => {
                    const candidateReport = reports.find((r) => r.candidateId === cand.id);
                    return (
                      <tr key={cand.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{cand.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{cand.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {cand.jobTitle}
                        </td>
                        <td className="py-3 px-4">
                          {cand.resume ? (
                            <span className="font-bold text-blue-400">{cand.resume.matchScore}%</span>
                          ) : (
                            <span className="text-slate-500 italic">Pending upload</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          Round {cand.currentRound} / {cand.totalRounds}
                        </td>
                        <td className="py-3 px-4">
                          {typeof cand.overallScore === 'number' ? (
                            <span className="font-bold text-emerald-400">{cand.overallScore}%</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              cand.recruiterDecision === 'selected' || cand.recruiterDecision === 'shortlisted'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : cand.recruiterDecision === 'on_hold'
                                ? 'bg-amber-500/20 text-amber-400'
                                : cand.recruiterDecision === 'rejected'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {cand.recruiterDecision ? cand.recruiterDecision.replace('_', ' ') : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {candidateReport && (
                              <button
                                onClick={() => setSelectedReport(candidateReport)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Report</span>
                              </button>
                            )}
                            <button
                              onClick={() => onOpenCandidateLink(cand.invitationToken)}
                              title="Enter candidate interview room"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-300">No candidates match your current filter</p>
                        <p className="text-[11px] text-slate-500 mt-1">Invite candidates to an open position to populate this assessment roster.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. INTERVIEW REPORTS LIST */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.length === 0 && (
              <div className="col-span-1 md:col-span-2 glass-panel p-10 rounded-3xl border border-white/[0.08] text-center">
                <Award className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Completed Interview Dossiers Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  As invited candidates conclude their interactive AI avatar voice interviews, full evaluations featuring transcripts, round-by-round scorecards, and hiring recommendations will be recorded here.
                </p>
              </div>
            )}
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {rep.recommendation}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Score: <span className="font-bold text-white">{rep.overallScore}/100</span>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {rep.candidateName}
                </h4>
                <p className="text-xs text-slate-400 mb-2">{rep.jobTitle} • {rep.organization}</p>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {rep.recommendationSummary}
                </p>
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(rep.completedAt).toLocaleDateString()}</span>
                  <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Open Dossier →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CREATE OPENING WIZARD */}
      {activeTab === 'create_job' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] max-w-2xl mx-auto">
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Job Setup Wizard</span>
            <h2 className="text-xl font-bold text-white mt-1">Configure New Role & Interview Pipeline</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose between 5-Round Standard or 8-Round Comprehensive pipelines with customized rubrics.
            </p>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={jobDept}
                  onChange={(e) => setJobDept(e.target.value)}
                  placeholder="AI & Data"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Location</label>
                <input
                  type="text"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  placeholder="Remote / San Francisco"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Pipeline Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Interview Pipeline</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setJobStructure('5_rounds')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    jobStructure === '5_rounds'
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-900/60 border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">Option A: 5 Rounds</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard interview: Resume, HR, Tech, Managerial, Final HR.
                  </p>
                </div>

                <div
                  onClick={() => setJobStructure('8_rounds')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    jobStructure === '8_rounds'
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-slate-900/60 border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">Option B: 8 Rounds</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Includes Aptitude Assessment & In-Depth Technical Deep Dive.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Job Description</label>
              <textarea
                rows={3}
                required
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Outline core responsibilities, team impact, and required day-to-day initiatives..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Required Skills (Comma separated)</label>
              <input
                type="text"
                required
                value={jobReqSkills}
                onChange={(e) => setJobReqSkills(e.target.value)}
                placeholder="Python, PyTorch, LLMs, Docker, API Design"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingJob}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/25"
              >
                {savingJob ? 'Publishing...' : 'Publish Job Opening'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. RECRUITER ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-bold text-white mb-4">Round-Wise Candidate Performance</h3>
              <div className="space-y-3">
                {analytics.roundWisePerformance.map((rw, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1 text-slate-300">
                      <span>{rw.roundName}</span>
                      <span className="font-bold text-blue-400 font-mono">{rw.avgScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${rw.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-bold text-white mb-4">Job-Wise Candidate Distribution</h3>
              <div className="space-y-4">
                {analytics.jobWiseDistribution.map((j, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] text-xs">
                    <div className="font-bold text-white mb-1">{j.jobTitle}</div>
                    <div className="flex justify-between text-slate-400">
                      <span>{j.candidateCount} Invited Candidates</span>
                      <span>Avg Score: <span className="font-bold text-emerald-400">{j.avgScore}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel-glow bg-[#0b0f1d] p-6 rounded-2xl border border-blue-500/30 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Invite Candidate to Interview</h3>
            <p className="text-xs text-slate-400 mb-4">
              Generates a secure, cryptographically unique invitation token for direct browser entry.
            </p>

            {generatedInviteLink ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Invitation Link Created!
                  </div>
                  <p className="text-[11px] text-slate-300 break-all font-mono mt-2 bg-slate-900 p-2.5 rounded-lg border border-white/[0.06]">
                    {generatedInviteLink}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedInviteLink)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Invitation Link'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const token = generatedInviteLink.split('/interview/')[1];
                      onOpenCandidateLink(token);
                      setShowInviteModal(false);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                  >
                    Launch Now
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Job Opening</label>
                  <select
                    value={inviteJobId}
                    onChange={(e) => setInviteJobId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Candidate Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Elena Rodriguez"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Candidate Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="elena@example.com"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                  >
                    Generate Secure Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Selected Report Modal */}
      {selectedReport && (
        <InterviewReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSaveDecision={handleSaveDecision}
        />
      )}
    </div>
  );
};
