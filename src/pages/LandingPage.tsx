import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  FileCheck,
  BarChart3,
  CheckCircle2,
  Mic,
  ArrowRight,
  ChevronDown,
  Award,
  Volume2,
  Shield,
  Bot,
  Brain,
  TrendingUp,
} from 'lucide-react';
import { AvatarStandingGirl } from '../components/AvatarStandingGirl.js';
import { SpeechService } from '../components/SpeechService.js';

interface LandingPageProps {
  onStartRecruiter: () => void;
  onStartCandidateDemo: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRecruiter,
  onStartCandidateDemo,
  onOpenAuth,
}) => {
  const [demoSpeaking, setDemoSpeaking] = useState(false);
  const [demoAudioLevel, setDemoAudioLevel] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const triggerAvatarGreeting = () => {
    SpeechService.stopSpeaking();
    SpeechService.speak(
      "Hello and welcome! I am your HireNexa AI interviewer. I conduct interactive voice-based interviews, evaluate candidate skills, and generate evidence-based hiring reports. Ready to transform your recruitment pipeline?",
      () => setDemoSpeaking(true),
      () => setDemoSpeaking(false),
      (level) => setDemoAudioLevel(level)
    );
  };

  const faqs = [
    {
      q: 'How does the full-body AI interviewer avatar work?',
      a: 'HireNexa AI pairs high-definition virtual interviewer rendering with dynamic speech synthesis and real-time lip-synchronization visemes. As questions are spoken, her expressions and mouth articulate naturally, tracking candidate audio input seamlessly without expensive third-party video subscriptions.',
    },
    {
      q: 'What is the difference between the 5-round and 8-round interview processes?',
      a: 'The 5-Round Standard pipeline includes Resume Screening, HR Screening, Technical Interview, Managerial Round, and Final HR Round. The 8-Round Comprehensive pipeline adds an Online Aptitude Assessment, Technical Screening, In-Depth Technical Deep Dive, and an HR Behavioral Round.',
    },
    {
      q: 'Are final hiring decisions automated by AI?',
      a: 'No. HireNexa AI strictly assists human hiring teams with evidence-based scoring, verbatim transcripts, and skill radar assessments. Final selection, offer approval, and contractual offers remain under authorized human recruiter control.',
    },
    {
      q: 'How does candidate voice transcription operate?',
      a: 'Candidates speak naturally into their browser microphone. The native speech recognition engine transcribes candidate words in real-time, displays them on screen, and stores the verbatim responses in MongoDB Atlas with exact timestamps for recruiter review.',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background ambient radial glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[550px] h-[550px] bg-indigo-600/10 blur-[130px] pointer-events-none -z-10" />

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold glass-panel border border-blue-500/30 text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Smarter Hiring. Brighter Futures.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Transform Recruitment with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Intelligent AI Interviews.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Automate resume screening, conduct lifelike voice interviews using an interactive full-body AI virtual interviewer, configure custom 5-round or 8-round pipelines, and generate intelligent evidence-based candidate evaluations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartRecruiter}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-98"
              >
                <span>Launch Recruiter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onStartCandidateDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 glass-panel hover:bg-white/[0.08] hover:text-white border border-white/[0.12] transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4 text-purple-400" />
                <span>Test Live Interview Room</span>
              </button>
            </div>

            {/* Trust stats pill */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full-Body AI Interviewer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Configurable 5 & 8 Rounds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Real-time Voice Transcription</span>
              </div>
            </div>
          </div>

          {/* Right Column: Full-Body AI Girl Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md glass-panel-glow bg-[#0a0f1d]/90 p-5 rounded-3xl border border-blue-500/30 shadow-2xl">
              {/* Interactive Standing Avatar */}
              <AvatarStandingGirl
                isSpeaking={demoSpeaking}
                isListening={false}
                audioLevel={demoAudioLevel}
                spokenText={
                  demoSpeaking
                    ? "Hello and welcome! I am your HireNexa AI interviewer. I conduct interactive voice-based interviews, evaluate candidate skills, and generate evidence-based hiring reports."
                    : undefined
                }
              />

              {/* Action Controls */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={triggerAvatarGreeting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{demoSpeaking ? 'Speaking...' : 'Test Voice & Lip-Sync'}</span>
                </button>
                <button
                  onClick={onStartCandidateDemo}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Enter Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">End-to-End Automation</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">How HireNexa AI Works</h2>
          <p className="text-sm text-slate-400 mt-2">
            From job opening configuration to executive reports in 4 streamlined steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Job & Round Config',
              desc: 'Select 5-round standard or 8-round comprehensive workflows. Customize required skills and rubrics.',
              icon: Layers,
            },
            {
              step: '02',
              title: 'AI Resume Match',
              desc: 'Candidate uploads resume. AI automatically extracts experience, calculates match score, and identifies skill gaps.',
              icon: FileCheck,
            },
            {
              step: '03',
              title: 'Voice Interview',
              desc: 'The standing avatar asks context-aware questions, transcribes candidate voice in real-time, and probes follow-ups.',
              icon: Bot,
            },
            {
              step: '04',
              title: 'Dossier & Decision',
              desc: 'Recruiters inspect skill radar charts, verbatim transcripts, and mark candidates as Shortlisted, On Hold, or Selected.',
              icon: Award,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative glass-panel p-6 rounded-2xl border border-white/[0.08] hover:border-blue-500/40 transition-all group"
            >
              <div className="text-2xl font-black text-slate-600 group-hover:text-blue-500 transition-colors mb-3 font-mono">
                {item.step}
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERVIEW PROCESS: 5-ROUND VS 8-ROUND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">Configurable Hiring Rigor</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Standard (5) vs Comprehensive (8) Rounds</h2>
          <p className="text-sm text-slate-400 mt-2">
            Choose the right depth of assessment based on the seniority and technical requirements of the position.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Option A: 5 Rounds */}
          <div className="glass-panel p-8 rounded-3xl border border-blue-500/30 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Option A
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">Standard Interview (5 Rounds)</h3>
                <p className="text-xs text-slate-400 mt-1">Recommended for standard engineering & operational roles</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Estimated Duration</span>
                <span className="text-lg font-bold text-blue-400">~60 Mins</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {[
                { num: 1, title: 'Resume Screening', desc: 'AI parsing, credential verification, and skill match scoring' },
                { num: 2, title: 'HR Screening', desc: 'Candidate introduction, motivation, availability, and communication' },
                { num: 3, title: 'Technical Interview', desc: 'Role-specific domain competencies and practical problem solving' },
                { num: 4, title: 'Managerial Interview', desc: 'Team collaboration, handling challenges, and situational judgment' },
                { num: 5, title: 'Final HR Round', desc: 'Career goals, culture alignment, compensation expectations, and Q&A' },
              ].map((round) => (
                <div key={round.num} className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-white/[0.05]">
                  <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-bold flex items-center justify-center shrink-0">
                    {round.num}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{round.title}</h4>
                    <p className="text-[11px] text-slate-400">{round.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Option B: 8 Rounds */}
          <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Option B
                </span>
                <h3 className="text-2xl font-bold text-white mt-2">Comprehensive Interview (8 Rounds)</h3>
                <p className="text-xs text-slate-400 mt-1">Ideal for Lead, Staff, and Mission-Critical Technical Hires</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Estimated Duration</span>
                <span className="text-lg font-bold text-purple-400">~120 Mins</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { num: 1, title: 'Resume Screening', desc: 'Deep credentials extraction and project analysis' },
                { num: 2, title: 'HR Telephonic Screening', desc: 'Initial voice screening of background & role suitability' },
                { num: 3, title: 'Aptitude & Online Assessment', desc: 'Logical reasoning, numerical analysis, and programming logic' },
                { num: 4, title: 'Technical Screening', desc: 'Fundamental concepts, resume-based questions, and algorithms' },
                { num: 5, title: 'In-Depth Technical Interview', desc: 'Scalable system architecture, databases, and fault tolerance' },
                { num: 6, title: 'Managerial Round', desc: 'Project ownership, cross-functional leadership, and conflict handling' },
                { num: 7, title: 'HR Behavioral Round', desc: 'Workplace values, ethical decisions, and adaptability' },
                { num: 8, title: 'Final HR & Offer Discussion', desc: 'Role expectations, joining timeline, and next steps' },
              ].map((round) => (
                <div key={round.num} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.05]">
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 border border-purple-500/40 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {round.num}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{round.title}</h4>
                    <p className="text-[11px] text-slate-400">{round.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Answers</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden transition-all"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-blue-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    faqOpen === idx ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-5 text-xs leading-relaxed text-slate-300 border-t border-white/[0.04] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-panel-glow bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-purple-950/80 p-8 sm:p-12 rounded-3xl border border-blue-500/40 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Hiring Workflow?
            </h2>
            <p className="text-sm text-slate-300">
              Launch interviews in minutes with zero setup friction. Invite candidates and let our AI interviewer conduct the preliminary rounds.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartRecruiter}
                className="px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/30 transition-all active:scale-98"
              >
                Open Recruiter Workspace
              </button>
              <button
                onClick={onOpenAuth}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-200 glass-panel hover:bg-white/[0.1] border border-white/[0.12] transition-colors"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
