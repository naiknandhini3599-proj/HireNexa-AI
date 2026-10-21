import React, { useState } from 'react';
import { Shield, FileText, Mail, Heart, CheckCircle2, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const openPrivacy = () => {
    setModalContent({
      title: 'HireNexa AI Privacy Notice & Consent Policy',
      body: `HireNexa AI is committed to fair, transparent, and ethical AI recruitment practices.
      
1. Data Collection & Purpose:
We process candidate resumes, spoken responses, and interview transcripts solely for evaluating job-related competencies requested by the employer.

2. No Discriminatory Biometrics:
HireNexa AI does not score candidates based on protected characteristics, accent, facial geometry, or emotion detection. Assessments evaluate objective skills and structured answers against predefined job rubrics.

3. Human in the Loop:
AI scores and recommendations serve as structured decision support. Final hiring choices, shortlisting, and offers remain under authorized human recruiter control.

4. Candidate Rights:
Candidates can review detected resume information, report technical audio issues, and request data deletion through their recruiting organization.`,
    });
  };

  const openTerms = () => {
    setModalContent({
      title: 'HireNexa AI Platform Terms of Service',
      body: `1. Service Scope:
HireNexa AI provides automated interview coordination, AI conversational screening, and analytical report generation for authorized recruiters and invited candidates.

2. Prohibited Use:
Users must not impersonate other individuals, upload malicious files, or attempt unauthorized cross-tenant data access.

3. Availability & Reliability:
While we strive for 99.9% uptime, session recovery mechanisms are integrated to resume interrupted sessions gracefully without data loss.`,
    });
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#05070e] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/branding/hirenexa-logo-trimmed.png"
            alt="HireNexa AI Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <button onClick={openPrivacy} className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            Privacy Notice & Consent
          </button>
          <button onClick={openTerms} className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Terms of Service
          </button>
          <a href="mailto:support@hirenexa.ai" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            support@hirenexa.ai
          </a>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1">
          HireNexa AI • Smarter Hiring. Brighter Futures.
        </p>
      </div>

      {/* Policy Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-panel-glow bg-[#0b1120] p-6 rounded-2xl border border-blue-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {modalContent.title}
              </h3>
              <button
                onClick={() => setModalContent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 text-xs leading-relaxed text-slate-300 whitespace-pre-line max-h-96 overflow-y-auto">
              {modalContent.body}
            </div>
            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
