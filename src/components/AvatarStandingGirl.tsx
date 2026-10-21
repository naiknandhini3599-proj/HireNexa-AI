import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Sparkles, Brain, Maximize2, Radio } from 'lucide-react';
import { Avatar3D } from './Avatar3D.js';

interface AvatarStandingGirlProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking?: boolean;
  audioLevel?: number; // 0 to 1
  spokenText?: string;
  className?: string;
  allowModeSwitch?: boolean;
}

export const AvatarStandingGirl: React.FC<AvatarStandingGirlProps> = ({
  isSpeaking,
  isListening,
  isThinking = false,
  audioLevel = 0,
  spokenText,
  className = '',
  allowModeSwitch = true,
}) => {
  const [avatarMode, setAvatarMode] = useState<'official_fullbody' | 'webgl_3d'>('official_fullbody');
  const [mouthOpen, setMouthOpen] = useState(0); // 0 to 1
  const [blink, setBlink] = useState(false);

  // Dynamic lip viseme animation loop when speaking
  useEffect(() => {
    let animId: any;
    if (isSpeaking) {
      let t = 0;
      const loop = () => {
        t += 0.25;
        // Natural phonetic modulation: combination of speech wave and audioLevel
        const level = (audioLevel || 0.4) * 0.6 + Math.abs(Math.sin(t * 3)) * 0.4;
        setMouthOpen(Math.min(1, Math.max(0, level)));
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    } else {
      setMouthOpen(0);
    }
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, audioLevel]);

  // Natural eye blink interval
  useEffect(() => {
    let blinkTimeout: any;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => {
        setBlink(false);
        blinkTimeout = setTimeout(triggerBlink, 2800 + Math.random() * 3000);
      }, 150);
    };
    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Top Status & Mode Toggle */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl glass-panel text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? 'bg-emerald-400 animate-ping'
                : isListening
                ? 'bg-blue-400 animate-pulse'
                : isThinking
                ? 'bg-purple-400 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          <span className="font-semibold text-white text-[11px]">
            {isSpeaking
              ? 'Speaking Question...'
              : isListening
              ? 'Listening to Candidate...'
              : isThinking
              ? 'Evaluating Response...'
              : 'HireNexa AI Virtual Interviewer'}
          </span>
        </div>

        {allowModeSwitch && (
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setAvatarMode('official_fullbody')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                avatarMode === 'official_fullbody'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full-Body Official
            </button>
            <button
              onClick={() => setAvatarMode('webgl_3d')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                avatarMode === 'webgl_3d'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D WebGL
            </button>
          </div>
        )}
      </div>

      {/* Main Avatar Container */}
      {avatarMode === 'official_fullbody' ? (
        <div className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center overflow-hidden rounded-3xl glass-panel-glow border border-blue-500/25 bg-gradient-to-b from-[#0b1022]/90 via-[#070b16]/95 to-[#04060d]">
          {/* Subtle Ambient Radial Backlight */}
          <div
            className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isSpeaking
                ? 'bg-blue-500/20 scale-110'
                : isListening
                ? 'bg-emerald-500/15 scale-105'
                : isThinking
                ? 'bg-purple-500/25 scale-120'
                : 'bg-blue-600/10 scale-100'
            }`}
          />

          {/* Full-Body Standing AI Girl Image with Interactive Dynamic Breathing & Head Sway */}
          <div
            className="relative h-full flex items-end justify-center transition-transform duration-300"
            style={{
              transform: isSpeaking
                ? 'translateY(-2px) scale(1.01)'
                : isListening
                ? 'rotate(-0.5deg)'
                : 'translateY(0)',
            }}
          >
            <img
              src="/assets/branding/avatar-girl-standing.png"
              alt="HireNexa AI Standing Female Virtual Interviewer"
              className="h-[96%] w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,163,255,0.22)] select-none pointer-events-none"
            />

            {/* Dynamic Mouth Lip-Sync Viseme Overlay when speaking */}
            {isSpeaking && (
              <div
                className="absolute pointer-events-none rounded-full bg-[#9f1239]/70 transition-all duration-75"
                style={{
                  top: '14.8%',
                  left: '49.2%',
                  transform: 'translate(-50%, -50%)',
                  width: `${8 + mouthOpen * 6}px`,
                  height: `${3 + mouthOpen * 8}px`,
                  boxShadow: '0 0 6px rgba(244, 63, 94, 0.4)',
                }}
              />
            )}

            {/* Natural Eye Blink Overlay */}
            {blink && (
              <div
                className="absolute pointer-events-none bg-[#3b211d] rounded-full transition-opacity duration-75"
                style={{
                  top: '11.8%',
                  left: '49.2%',
                  transform: 'translate(-50%, -50%)',
                  width: '38px',
                  height: '3px',
                }}
              />
            )}
          </div>

          {/* Real-time Voice Audio Visualizer Waveform Bar */}
          {isSpeaking && (
            <div className="absolute bottom-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-blue-500/30">
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-blue-400 rounded-full animate-wave-1 h-full" />
                <span className="w-1 bg-indigo-400 rounded-full animate-wave-2 h-full" />
                <span className="w-1 bg-purple-400 rounded-full animate-wave-3 h-full" />
                <span className="w-1 bg-blue-400 rounded-full animate-wave-4 h-full" />
                <span className="w-1 bg-cyan-400 rounded-full animate-wave-5 h-full" />
              </div>
              <span className="text-[10px] text-blue-200 font-mono ml-1">Live Viseme</span>
            </div>
          )}

          {isListening && (
            <div className="absolute bottom-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30">
              <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-semibold">Active Microphone Input</span>
            </div>
          )}

          {isThinking && (
            <div className="absolute bottom-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/30">
              <Brain className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span className="text-[10px] text-purple-300 font-semibold">Analyzing Candidate Response</span>
            </div>
          )}
        </div>
      ) : (
        /* 3D WebGL Canvas Mode */
        <div className="relative w-full h-[380px] sm:h-[460px] rounded-3xl glass-panel-glow border border-indigo-500/25 bg-[#080d1a] overflow-hidden flex items-center justify-center">
          <Avatar3D
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
            audioLevel={audioLevel}
          />
        </div>
      )}

      {/* Current Spoken Question Subtitle Bar */}
      {spokenText && (
        <div className="w-full mt-3 p-3 rounded-2xl glass-panel border border-white/[0.08] text-xs text-slate-200 text-center">
          <p className="line-clamp-2 italic leading-relaxed">
            "{spokenText}"
          </p>
        </div>
      )}
    </div>
  );
};
