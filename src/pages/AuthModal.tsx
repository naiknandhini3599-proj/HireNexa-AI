import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building, Shield, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Briefcase } from 'lucide-react';
import type { User } from '../types/index.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register_recruiter' | 'bootstrap_admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [adminSetupKey, setAdminSetupKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = '/api/auth/login';
      let body: any = { email, password };

      if (authMode === 'register_recruiter') {
        endpoint = '/api/auth/register';
        body = { name, email, organization, password };
      } else if (authMode === 'bootstrap_admin') {
        endpoint = '/api/auth/setup-admin';
        body = { name, email, password, adminSetupKey };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication request failed');
      }

      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'super_admin' | 'recruiter') => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail = role === 'super_admin' ? 'admin@hirenexa.ai' : 'sarah.recruiter@hirenexa.ai';
      const demoPass = role === 'super_admin' ? 'admin123' : 'recruiter123';
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-glow bg-[#0b0f1d] p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/assets/branding/hirenexa-logo-trimmed.png"
            alt="HireNexa AI"
            className="h-10 w-auto mx-auto mb-3 object-contain"
          />
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {authMode === 'bootstrap_admin'
              ? 'Super Admin Initialization'
              : authMode === 'register_recruiter'
              ? 'Register Recruiter Account'
              : 'Sign In to HireNexa AI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'bootstrap_admin'
              ? 'Authorize executive platform governance with master setup key'
              : authMode === 'register_recruiter'
              ? 'Create your organization recruiter workspace'
              : 'Enter your credentials to manage candidate pipelines'}
          </p>
        </div>

        {/* Quick Role Fill Demo Buttons */}
        {authMode === 'login' && (
          <div className="mb-5 p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20">
            <span className="text-[11px] font-semibold text-blue-300 block mb-2 text-center">
              Instant 1-Click Role Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('super_admin')}
                className="py-2 px-2.5 rounded-xl text-[11px] font-bold text-white bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('recruiter')}
                className="py-2 px-2.5 rounded-xl text-[11px] font-bold text-white bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                Recruiter
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode !== 'login' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nandhini SuperAdmin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {authMode === 'register_recruiter' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="TechVision Labs"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {authMode === 'bootstrap_admin' && (
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                Master Admin Setup Key
              </label>
              <input
                type="password"
                required
                value={adminSetupKey}
                onChange={(e) => setAdminSetupKey(e.target.value)}
                placeholder="ADMIN_SETUP_KEY from .env"
                className="w-full p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {authMode === 'bootstrap_admin'
                  ? 'Bootstrap Super Admin'
                  : authMode === 'register_recruiter'
                  ? 'Register Recruiter Account'
                  : 'Sign In to HireNexa AI'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switchers */}
        <div className="mt-5 flex flex-col gap-2 text-center text-xs text-slate-400">
          {authMode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register_recruiter');
                  setError(null);
                }}
                className="hover:text-blue-400 transition-colors"
              >
                Need a Recruiter account? Register here
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('bootstrap_admin');
                  setError(null);
                }}
                className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors"
              >
                Executive Admin Setup
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              className="hover:text-blue-400 transition-colors"
            >
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
