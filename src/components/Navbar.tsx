import React from 'react';
import { Shield, Briefcase, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import type { User } from '../types/index.js';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickSwitchRole: (role: 'super_admin' | 'recruiter' | 'candidate') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  onLogout,
  onQuickSwitchRole,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/[0.08] bg-[#070b14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo with Official HireNexa AI Asset */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group py-2"
        >
          <img
            src="/assets/branding/hirenexa-logo-trimmed.png"
            alt="HireNexa AI - Smarter Hiring. Brighter Futures."
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-white ${
              currentView === 'landing' ? 'text-blue-400 font-bold' : ''
            }`}
          >
            Platform Overview
          </button>
          <button
            onClick={() => onNavigate('recruiter')}
            className={`flex items-center gap-1.5 transition-colors hover:text-white ${
              currentView === 'recruiter' ? 'text-blue-400 font-bold' : ''
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            Recruiter Hub
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-1.5 transition-colors hover:text-white ${
              currentView === 'admin' ? 'text-indigo-400 font-bold' : ''
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            Super Admin
          </button>
          <button
            onClick={() => onQuickSwitchRole('candidate')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Candidate Room
          </button>
        </nav>

        {/* Right Section: User Profile & Auth */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{currentUser.name}</span>
                <span className="text-[10px] text-blue-400 uppercase tracking-wider font-mono">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                Sign In / Access
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
