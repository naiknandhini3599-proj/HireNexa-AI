import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  FileText,
  User,
  Briefcase,
  Layers,
  Sparkles,
  BarChart,
  MessageSquare,
  Clock,
  Send,
} from 'lucide-react';
import type { InterviewReport } from '../types/index.js';

interface InterviewReportModalProps {
  report: InterviewReport | null;
  onClose: () => void;
  onSaveDecision: (candidateId: string, decision: 'shortlisted' | 'on_hold' | 'rejected' | 'selected', notes: string) => void;
}

export const InterviewReportModal: React.FC<InterviewReportModalProps> = ({
  report,
  onClose,
  onSaveDecision,
}) => {
  if (!report) return null;

  const [decision, setDecision] = useState<'shortlisted' | 'on_hold' | 'rejected' | 'selected'>(
    report.recruiterDecision || 'shortlisted'
  );
  const [notes, setNotes] = useState(report.recruiterNotes || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'criteria' | 'rounds' | 'transcript'>('overview');

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSaveDecision(report.candidateId, decision, notes);
    setSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Key', 'Value'];
    const rows = [
      ['Candidate', 'Name', report.candidateName],
      ['Candidate', 'Email', report.candidateEmail],
      ['Job', 'Title', report.jobTitle],
      ['Job', 'Organization', report.organization],
      ['Evaluation', 'Overall Score', `${report.overallScore}%`],
      ['Evaluation', 'Resume Match', `${report.resumeMatchScore}%`],
      ['Evaluation', 'AI Recommendation', report.recommendation],
      ['Decision', 'Recruiter Decision', report.recruiterDecision || 'Pending'],
      ['Decision', 'Notes', `"${(report.recruiterNotes || '').replace(/"/g, '""')}"`],
    ];

    report.criteriaBreakdown.forEach((c) => {
      rows.push(['Criteria', c.name, `${c.obtainedScore}/${c.maxScore} - ${c.evidence}`]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HireNexa_Report_${report.candidateName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 80) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-red-400 border-red-500/40 bg-red-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:text-black">
      <div className="relative w-full max-w-4xl glass-panel-glow bg-[#0b0f1d] rounded-3xl border border-blue-500/30 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-slate-900/40 print:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white print:text-black">{report.candidateName}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  {report.jobTitle}
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600">
                {report.organization} • Completed on {new Date(report.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              title="Print / Save PDF"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors flex items-center gap-1 text-xs"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] px-6 gap-6 text-xs font-semibold text-slate-400 print:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Overview & Recommendation
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'criteria'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Skill Criteria Breakdown ({report.criteriaBreakdown.length})
          </button>
          <button
            onClick={() => setActiveTab('rounds')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'rounds'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Round-by-Round ({report.roundResults.length})
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`py-3 transition-colors border-b-2 ${
              activeTab === 'transcript'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Transcript & Answers ({report.transcript.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {/* Top Score Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Overall Interview Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{report.overallScore}</span>
                <span className="text-slate-400 text-xs">/100</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Resume Relevance</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-400">{report.resumeMatchScore}</span>
                <span className="text-slate-400 text-xs">/100</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">AI Recommendation</span>
              <span
                className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(
                  report.overallScore
                )}`}
              >
                {report.recommendation}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl glass-panel border border-white/[0.08]">
              <span className="text-[11px] text-slate-400 block mb-1">Pipeline Workflow</span>
              <span className="text-xs font-bold text-purple-400 capitalize">
                {report.interviewStructure.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20">
                <h4 className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Executive AI Recommendation Summary
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">{report.recommendationSummary}</p>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20">
                  <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Candidate Strengths
                  </h4>
                  <ul className="space-y-2">
                    {report.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl glass-panel border border-amber-500/20">
                  <h4 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Areas for Growth & Follow-up
                  </h4>
                  <ul className="space-y-2">
                    {report.areasForImprovement.map((area, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                    {report.missingOrUnverifiedSkills.length > 0 && (
                      <li className="flex items-start gap-2 text-amber-300 pt-1 border-t border-white/[0.04]">
                        <span className="font-semibold">Unverified:</span>
                        <span>{report.missingOrUnverifiedSkills.join(', ')}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recruiter Decision Panel */}
              <div className="p-5 rounded-2xl glass-panel-glow border border-blue-500/30 print:hidden">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Authorized Recruiter Decision (Human in the Loop)
                </h4>
                <form onSubmit={handleDecisionSubmit} className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(['shortlisted', 'selected', 'on_hold', 'rejected'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDecision(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                          decision === opt
                            ? opt === 'selected' || opt === 'shortlisted'
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : opt === 'on_hold'
                              ? 'bg-amber-600 text-white border-amber-500'
                              : 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-900/80 text-slate-400 border-white/[0.08] hover:text-white'
                        }`}
                      >
                        {opt.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Recruiter Evaluation Notes
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add hiring committee notes, salary discussions, or next-step scheduling instructions..."
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                    >
                      {saving ? 'Saving...' : 'Update Decision'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: CRITERIA BREAKDOWN */}
          {activeTab === 'criteria' && (
            <div className="space-y-4">
              {report.criteriaBreakdown.map((crit, idx) => (
                <div key={idx} className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-white">{crit.name}</h4>
                    <span className="text-xs font-bold text-blue-400 font-mono">
                      {crit.obtainedScore} / {crit.maxScore}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(crit.obtainedScore / crit.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-300">Observed Evidence:</span> {crit.evidence}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Rubric Notes:</span> {crit.notes}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ROUNDS BREAKDOWN */}
          {activeTab === 'rounds' && (
            <div className="space-y-3">
              {report.roundResults.map((round) => (
                <div key={round.roundNumber} className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] font-bold flex items-center justify-center">
                        {round.roundNumber}
                      </span>
                      <h4 className="text-xs font-bold text-white">{round.roundName}</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{round.score}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">{round.summary}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {report.transcript.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs ${
                    line.speaker === 'AI'
                      ? 'bg-blue-950/20 border-blue-500/20 text-blue-200'
                      : 'bg-slate-900 border-white/[0.08] text-slate-200 ml-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                    <span>{line.speaker === 'AI' ? 'HireNexa AI Avatar' : report.candidateName}</span>
                    <span className="font-mono">{line.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{line.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
