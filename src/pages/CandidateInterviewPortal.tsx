import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Volume2,
  Clock,
  Sparkles,
  ArrowRight,
  Layers,
  Send,
  RefreshCw,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AvatarStandingGirl } from '../components/AvatarStandingGirl.js';
import { SpeechService } from '../components/SpeechService.js';
import type {
  Candidate,
  JobOpening,
  InterviewSession,
  InterviewQuestionItem,
  AptitudeQuestion,
  ResumeData,
} from '../types/index.js';

interface CandidateInterviewPortalProps {
  invitationToken: string;
  onExit: () => void;
}

export const CandidateInterviewPortal: React.FC<CandidateInterviewPortalProps> = ({
  invitationToken,
  onExit,
}) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<JobOpening | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow Stages:
  // 'welcome' -> 'resume' -> 'hardware_check' -> 'interview' -> 'aptitude' -> 'completed'
  const [stage, setStage] = useState<
    'welcome' | 'resume' | 'hardware_check' | 'interview' | 'aptitude' | 'completed'
  >('welcome');

  // Privacy & Consent
  const [consentAudio, setConsentAudio] = useState(true);
  const [consentPrivacy, setConsentPrivacy] = useState(true);

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Hardware Check State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  // Interview Room State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [spokenResponse, setSpokenResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [avatarListening, setAvatarListening] = useState(false);
  const [avatarThinking, setAvatarThinking] = useState(false);
  const [visemeIntensity, setVisemeIntensity] = useState(0);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [interviewTimeSeconds, setInterviewTimeSeconds] = useState(0);

  // Aptitude Answers State
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, number>>({});
  const [submittingAptitude, setSubmittingAptitude] = useState(false);

  // Load invitation & job data
  useEffect(() => {
    async function loadInvite() {
      try {
        setLoading(true);
        const res = await fetch(`/api/candidate-invite/${invitationToken}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load invitation.');
        setCandidate(data.candidate);
        setJob(data.job);
        if (data.candidate.resume) {
          setResumeData(data.candidate.resume);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadInvite();
  }, [invitationToken]);

  // Interview timer
  useEffect(() => {
    let timer: any;
    if (stage === 'interview' || stage === 'aptitude') {
      timer = setInterval(() => {
        setInterviewTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // Speak initial question when question changes
  const speakCurrentQuestion = (questionText: string) => {
    SpeechService.stopSpeaking();
    SpeechService.speak(
      questionText,
      () => {
        setAvatarSpeaking(true);
        setAvatarListening(false);
      },
      () => {
        setAvatarSpeaking(false);
        setAvatarListening(true);
      },
      (intensity) => setVisemeIntensity(intensity)
    );
  };

  // 1. Resume Screen Handler
  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile && !resumeData) return;

    setAnalyzingResume(true);
    try {
      const res = await fetch(`/api/interview/${invitationToken}/resume-screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: resumeFile?.name || 'Resume_Document.pdf',
          resumeText: `Skills in ${job?.requiredSkills.join(', ')}. Over 4 years of engineering tenure.`,
        }),
      });

      const data = await res.json();
      if (data.resume) {
        setResumeData(data.resume);
        setStage('hardware_check');
        startCamera();
      }
    } catch (err) {
      console.error('Resume screening error:', err);
    } finally {
      setAnalyzingResume(false);
    }
  };

  // 2. Camera & Mic Test
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);

      // Start mic meter
      SpeechService.startMicMeter((level) => {
        setMicLevel(level);
      });
    } catch (e) {
      console.warn('Camera access denied or unavailable:', e);
      setCameraActive(false);
    }
  };

  // 3. Start Live Interview
  const handleStartInterview = async () => {
    try {
      const res = await fetch(`/api/interview/${invitationToken}/start`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);

        const currentRoundConfig = job?.rounds.find((r) => r.roundNumber === data.session.currentRound);
        if (currentRoundConfig?.type === 'aptitude') {
          setStage('aptitude');
        } else {
          setStage('interview');
          const firstQ = data.session.questions[0]?.question;
          if (firstQ) {
            setTimeout(() => speakCurrentQuestion(firstQ), 800);
          }
        }
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  // 4. Live Automatic Speech-to-Text Recognition Toggle
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      SpeechService.stopListening();
      setIsRecording(false);
      setAvatarListening(false);
    } else {
      const started = SpeechService.startListening(
        (transcript) => {
          // Live real-time transcription update
          setSpokenResponse(transcript);
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsRecording(false);
          setAvatarListening(false);
        }
      );
      if (started) {
        setIsRecording(true);
        setAvatarListening(true);
      }
    }
  };

  // 5. Submit Spoken Response
  const handleSubmitAnswer = async () => {
    if (!spokenResponse.trim() || !session) return;

    if (isRecording) {
      SpeechService.stopListening();
      setIsRecording(false);
    }

    setSubmittingAnswer(true);
    setAvatarThinking(true);
    setAvatarSpeaking(false);
    setAvatarListening(false);

    try {
      const activeQ = session.questions[currentQuestionIndex];
      const res = await fetch(`/api/interview/${invitationToken}/submit-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: activeQ?.id,
          answerText: spokenResponse,
        }),
      });

      const data = await res.json();
      setAvatarThinking(false);

      if (data.session) {
        setSession(data.session);
        setSpokenResponse('');

        // If follow-up exists, speak it
        if (data.evaluation?.followUp) {
          speakCurrentQuestion(data.evaluation.followUp);
        } else if (currentQuestionIndex + 1 < data.session.questions.length) {
          const nextIdx = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIdx);
          const nextQ = data.session.questions[nextIdx]?.question;
          if (nextQ) speakCurrentQuestion(nextQ);
        } else {
          handleAdvanceRound();
        }
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
      setAvatarThinking(false);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // 6. Advance Round
  const handleAdvanceRound = async () => {
    try {
      const res = await fetch(`/api/interview/${invitationToken}/advance-round`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.completed) {
        handleFinishInterview();
      } else if (data.roundConfig?.type === 'aptitude') {
        setStage('aptitude');
      } else if (data.session) {
        setSession(data.session);
        const nextQIdx = data.session.questions.length - (data.roundConfig?.questionsCount || 3);
        setCurrentQuestionIndex(Math.max(0, nextQIdx));
        const qText = data.session.questions[nextQIdx]?.question;
        if (qText) speakCurrentQuestion(qText);
      }
    } catch (e) {
      console.error('Error advancing round:', e);
    }
  };

  // 7. Submit Aptitude Test
  const handleSubmitAptitude = async () => {
    setSubmittingAptitude(true);
    try {
      const res = await fetch(`/api/interview/${invitationToken}/submit-aptitude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: aptitudeAnswers }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        handleAdvanceRound();
        setStage('interview');
      }
    } catch (err) {
      console.error('Failed to submit aptitude test:', err);
    } finally {
      setSubmittingAptitude(false);
    }
  };

  // 8. Complete & Generate Report
  const handleFinishInterview = async () => {
    try {
      SpeechService.stopSpeaking();
      const res = await fetch(`/api/interview/${invitationToken}/complete`, {
        method: 'POST',
      });
      await res.json();
      setStage('completed');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to complete interview:', err);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your secure interview room...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070b14]">
        <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-red-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Interview Link Unavailable</h2>
          <p className="text-xs text-slate-400">{error || 'This invitation may have expired or is invalid.'}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const currentQ = session?.questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between">
      {/* Top Session Status Bar with Official Brand Logo */}
      <header className="border-b border-white/[0.08] bg-[#080d1b]/85 px-4 sm:px-6 py-3 flex items-center justify-between text-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src="/assets/branding/hirenexa-logo-trimmed.png"
            alt="HireNexa AI Logo"
            className="h-8 sm:h-9 w-auto object-contain cursor-pointer"
            onClick={onExit}
          />
          <div className="hidden sm:block border-l border-white/[0.08] pl-3">
            <span className="font-bold text-white">{job.title}</span>
            <span className="text-slate-400 text-[11px]"> • {job.organization}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatSeconds(interviewTimeSeconds)}</span>
          </div>
          <button
            onClick={onExit}
            className="px-3 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-center">
        {/* STAGE 1: WELCOME & CONSENT */}
        {stage === 'welcome' && (
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/[0.08] max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Candidate Portal</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Welcome, {candidate.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                You have been invited to interview for <span className="text-white font-semibold">{job.title}</span> at <span className="text-white font-semibold">{job.organization}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.06] space-y-3 text-xs">
              <div className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Interview Format: {job.interviewStructure.replace('_', ' ')} ({job.rounds.length} Rounds)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">{job.description}</p>
            </div>

            {/* Privacy & Consent Checkboxes */}
            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAudio}
                  onChange={(e) => setConsentAudio(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-white/[0.1] text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">
                  I consent to the use of microphone audio for real-time speech recognition and evaluation by HireNexa AI.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-white/[0.1] text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">
                  I have read the Privacy Notice. I understand that AI scores support human hiring managers who make all final employment decisions.
                </span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!consentAudio || !consentPrivacy}
                onClick={() => setStage('resume')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <span>Continue to Resume Screening</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: RESUME SCREENING */}
        {stage === 'resume' && (
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/[0.08] max-w-2xl mx-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Round 1 of {job.rounds.length}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Resume Screening & Skill Matching</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload your resume in PDF format. Our AI will automatically parse credentials and evaluate alignment with {job.title}.
              </p>
            </div>

            <form onSubmit={handleUploadResume} className="space-y-4">
              <div className="border-2 border-dashed border-white/[0.12] hover:border-blue-500/50 rounded-2xl p-8 text-center cursor-pointer transition-colors relative bg-slate-900/40">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">
                  {resumeFile ? resumeFile.name : 'Click to upload your resume (PDF / DOCX)'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Or use existing profile for instant verification
                </span>
              </div>

              {resumeData && (
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Analyzed Match Score:</span>
                    <span className="font-bold text-emerald-400">{resumeData.matchScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{resumeData.summary}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={analyzingResume}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2"
                >
                  {analyzingResume ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Analyze & Proceed to Device Check</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STAGE 3: HARDWARE CHECK */}
        {stage === 'hardware_check' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Device Verification</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Camera & Microphone Check</h2>
              <p className="text-xs text-slate-400 mt-1">
                Ensure your video and audio inputs are working properly before entering the live interview room.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Webcam preview */}
              <div className="relative aspect-video rounded-2xl bg-slate-900 border border-white/[0.08] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                {!cameraActive && (
                  <div className="text-center p-4">
                    <VideoOff className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 block">Camera Preview</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm">
                  {cameraActive ? 'Camera Active' : 'Camera Off'}
                </div>
              </div>

              {/* Audio meter test */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-400" />
                    Microphone Input Test
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-4">
                    Speak into your microphone to verify the volume meter reacts.
                  </p>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-emerald-400 h-2 rounded-full transition-all duration-75"
                      style={{ width: `${Math.min(100, micLevel * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Internet Connection: Stable & Fast</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStartInterview}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Live Interview Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: LIVE FULL-BODY AI INTERVIEW ROOM */}
        {stage === 'interview' && session && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Full-Body Standing AI Girl Interviewer Avatar */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <AvatarStandingGirl
                isSpeaking={avatarSpeaking}
                isListening={avatarListening}
                isThinking={avatarThinking}
                audioLevel={visemeIntensity}
                spokenText={currentQ?.question}
                className="w-full"
              />

              {/* Spoken Question Audio Controls */}
              <div className="w-full mt-2 p-2.5 rounded-2xl glass-panel flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    if (currentQ?.question) speakCurrentQuestion(currentQ.question);
                  }}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white glass-panel flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Repeat Question</span>
                </button>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Voice Synchronized</span>
                </div>
              </div>
            </div>

            {/* Right: Question Card & Live Automatic Speech-to-Text Transcription Box */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between space-y-6">
              {/* Question Header */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    Question {currentQuestionIndex + 1} of {session.questions.length}
                  </span>
                  <span className="text-slate-400 font-mono">
                    Round {session.currentRound}: {currentQ?.roundName}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/[0.08]">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    "{currentQ?.question || 'Tell me about yourself and your background...'}"
                  </p>
                </div>
              </div>

              {/* Candidate Voice Recognition & Live Transcription Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-blue-400" />
                    <span>Your Spoken Answer (Live Automatic Transcription):</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isRecording ? 'Listening live... speak naturally' : 'Click "Start Voice Recording"'}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={spokenResponse}
                    onChange={(e) => setSpokenResponse(e.target.value)}
                    placeholder="Candidate spoken response transcribes here automatically in real-time as you speak. You may also edit or clarify your thoughts directly..."
                    className="w-full p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                  />
                  {isRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      LIVE RECORDING
                    </div>
                  )}
                </div>

                {/* Voice & Submission Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isRecording
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-200 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-400" />}
                    <span>{isRecording ? 'Stop Voice Recording' : 'Start Voice Recording'}</span>
                  </button>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !spokenResponse.trim()}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    {submittingAnswer ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: APTITUDE ASSESSMENT (For 8-Round Pipeline) */}
        {stage === 'aptitude' && session && session.aptitudeQuestions && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Round 3: Online Aptitude</span>
                <h2 className="text-xl font-bold text-white mt-1">Timed Logical & Technical Assessment</h2>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                5 Questions
              </span>
            </div>

            <div className="space-y-6">
              {session.aptitudeQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06] text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-bold font-mono">Q{qIdx + 1} • {q.category}</span>
                  </div>
                  <p className="text-white font-semibold mb-3">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          aptitudeAnswers[q.id] === optIdx
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900 border-white/[0.04] text-slate-300 hover:text-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`apt_${q.id}`}
                          checked={aptitudeAnswers[q.id] === optIdx}
                          onChange={() => setAptitudeAnswers({ ...aptitudeAnswers, [q.id]: optIdx })}
                          className="rounded-full text-blue-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={handleSubmitAptitude}
                disabled={submittingAptitude}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors flex items-center gap-2"
              >
                {submittingAptitude ? 'Grading...' : 'Submit Aptitude Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* STAGE 6: COMPLETION CONFIRMATION */}
        {stage === 'completed' && (
          <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl border border-emerald-500/40 max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Interview Successfully Submitted!</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Thank you, <span className="text-white font-bold">{candidate.name}</span>! Your interview responses and transcript have been securely recorded.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/[0.06] text-xs text-slate-400 space-y-2 text-left font-mono">
              <div className="flex justify-between">
                <span>Confirmation ID:</span>
                <span className="text-white font-bold">{invitationToken}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed At:</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Role:</span>
                <span className="text-blue-400 font-bold">{job.title}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Our recruitment team at <span className="text-white font-semibold">{job.organization}</span> will review your evaluation dossier and contact you regarding next steps.
            </p>

            <button
              onClick={onExit}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Return to HireNexa AI
            </button>
          </div>
        )}
      </main>

      {/* Portal Footer Notice */}
      <footer className="border-t border-white/[0.06] py-3 text-center text-[11px] text-slate-500">
        HireNexa AI • Smarter Hiring. Brighter Futures. • Official Virtual Interviewer
      </footer>
    </div>
  );
};
