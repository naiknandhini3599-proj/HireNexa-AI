import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building,
  Briefcase,
  UserCheck,
  UserX,
  Plus,
  Activity,
  FileText,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import type { User, SuperAdminAnalytics } from '../types/index.js';

interface SuperAdminDashboardProps {
  currentUser: User;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentUser }) => {
  const [recruiters, setRecruiters] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recruiters' | 'analytics' | 'logs' | 'settings'>('recruiters');

  // New recruiter form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [savingRecruiter, setSavingRecruiter] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r1 = await fetch('/api/admin/recruiters').then((r) => r.json());
      const r2 = await fetch('/api/admin/analytics').then((r) => r.json());
      const r3 = await fetch('/api/admin/logs').then((r) => r.json());
      const r4 = await fetch('/api/admin/settings').then((r) => r.json());

      if (r1.recruiters) setRecruiters(r1.recruiters);
      if (r2.analytics) setAnalytics(r2.analytics);
      if (r3.logs) setLogs(r3.logs);
      if (r4.settings) setSettings(r4.settings);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRecruiterActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/recruiters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.recruiter) {
        setRecruiters((prev) => prev.map((r) => (r.id === id ? data.recruiter : r)));
      }
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleCreateRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRecruiter(true);
    try {
      const res = await fetch('/api/admin/recruiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, organization: newOrg }),
      });
      const data = await res.json();
      if (data.recruiter) {
        setRecruiters((prev) => [...prev, data.recruiter]);
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewOrg('');
      }
    } catch (e) {
      console.error('Failed to create recruiter:', e);
    } finally {
      setSavingRecruiter(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (e) {
      console.error('Failed to update settings:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Super Admin Control Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global governance: Recruiter accounts, tenant organizations, platform quotas, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Recruiter</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Bar */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
            <span className="text-[11px] text-slate-400 block mb-1">Total Recruiters</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{analytics.totalRecruiters}</span>
              <span className="text-xs text-emerald-400 font-mono">
                {analytics.activeRecruiters} Active
              </span>
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
            <span className="text-[11px] text-slate-400 block mb-1">Total Organizations</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-indigo-400">{analytics.totalOrganizations}</span>
              <span className="text-xs text-slate-400 font-mono">{analytics.totalJobs} Jobs</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
            <span className="text-[11px] text-slate-400 block mb-1">Platform Completion</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{analytics.platformCompletionRate}%</span>
              <span className="text-xs text-slate-400 font-mono">{analytics.completedInterviews} Done</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
            <span className="text-[11px] text-slate-400 block mb-1">System Health</span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {analytics.systemHealth}
              </span>
              <span className="text-xs text-slate-400 font-mono">{analytics.apiUsageCount} APIs</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-white/[0.08] gap-6 text-xs font-semibold text-slate-400 mb-6">
        <button
          onClick={() => setActiveTab('recruiters')}
          className={`py-3 transition-colors border-b-2 ${
            activeTab === 'recruiters'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Recruiter Accounts ({recruiters.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 transition-colors border-b-2 ${
            activeTab === 'analytics'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 transition-colors border-b-2 ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Operational Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Platform Settings
        </button>
      </div>

      {/* TAB 1: RECRUITERS TABLE */}
      {activeTab === 'recruiters' && (
        <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Authorized Recruiter Profiles</h3>
            <span className="text-[11px] text-slate-400">Total: {recruiters.length} accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Name & Email</th>
                  <th className="py-3 px-4 font-semibold">Assigned Organization</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recruiters.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{rec.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rec.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/[0.06]">
                        <Building className="w-3 h-3 text-indigo-400" />
                        {rec.organization || 'Independent'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {rec.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleRecruiterActive(rec.id, rec.isActive)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                          rec.isActive
                            ? 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {rec.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {recruiters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-300">No recruiter accounts provisioned yet</p>
                      <p className="text-[11px] text-slate-500 mt-1">Click "Create Recruiter" above to authorize a new organization recruiter workspace.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/[0.08]">
              <h4 className="text-xs font-bold text-white mb-2">Platform Funnel Health</h4>
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Completion Rate:</span>
                  <span className="font-bold text-emerald-400">{analytics.platformCompletionRate}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Abandonment Rate:</span>
                  <span className="font-bold text-amber-400">{analytics.abandonmentRate}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Average Candidate Score:</span>
                  <span className="font-bold text-blue-400">{analytics.avgInterviewScore}/100</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/[0.08]">
              <h4 className="text-xs font-bold text-white mb-2">API Consumption & Quotas</h4>
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Total AI API Invocations:</span>
                  <span className="font-mono font-bold text-white">{analytics.apiUsageCount}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Voice Avatar Synthesized Clips:</span>
                  <span className="font-mono text-indigo-400">{analytics.completedInterviews * 8}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Resume Screenings Run:</span>
                  <span className="font-mono text-blue-400">{analytics.totalCandidates}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/[0.08]">
              <h4 className="text-xs font-bold text-white mb-2">System Infrastructure</h4>
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Runtime:</span>
                  <span className="font-mono text-slate-200">Node.js 22 LTS (Web)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Primary Port:</span>
                  <span className="font-mono text-emerald-400">3000 (0.0.0.0)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>AI Engine:</span>
                  <span className="font-mono text-blue-400">gemini-3.8-flash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-panel rounded-2xl border border-white/[0.08] p-5">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-white">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Real-time System Audit & Event Stream</span>
          </div>
          <div className="bg-[#05070f] p-4 rounded-xl border border-white/[0.05] font-mono text-[11px] space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3 text-slate-300">
                <span className="text-slate-500 shrink-0">{log.timestamp.slice(11, 19)}</span>
                <span
                  className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded ${
                    log.level === 'error'
                      ? 'bg-red-500/20 text-red-400'
                      : log.level === 'warn'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {log.level}
                </span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && settings && (
        <div className="glass-panel rounded-2xl border border-white/[0.08] p-6 max-w-xl">
          <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Platform Configuration</span>
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Max Interviews Per Job</label>
              <input
                type="number"
                value={settings.maxInterviewsPerJob}
                onChange={(e) => setSettings({ ...settings, maxInterviewsPerJob: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Default Interview Pipeline</label>
              <select
                value={settings.defaultStructure}
                onChange={(e) => setSettings({ ...settings, defaultStructure: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="5_rounds">Standard (5 Rounds)</option>
                <option value="8_rounds">Comprehensive (8 Rounds)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="allowReg"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                className="rounded bg-slate-900 border-white/[0.1] text-indigo-600 focus:ring-0"
              />
              <label htmlFor="allowReg" className="text-slate-300">Allow Public Recruiter Registration</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableAudio"
                checked={settings.enableAudioRecording}
                onChange={(e) => setSettings({ ...settings, enableAudioRecording: e.target.checked })}
                className="rounded bg-slate-900 border-white/[0.1] text-indigo-600 focus:ring-0"
              />
              <label htmlFor="enableAudio" className="text-slate-300">Enable Candidate Voice Recording & Transcription</label>
            </div>
            <div className="pt-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Save Global Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Recruiter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel-glow bg-[#0b0f1d] p-6 rounded-2xl border border-indigo-500/30 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Provision New Recruiter Account</h3>
            <form onSubmit={handleCreateRecruiter} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recruiter Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. David Vance"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="david@company.com"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Organization</label>
                <input
                  type="text"
                  required
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  placeholder="TechVision Labs"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRecruiter}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  {savingRecruiter ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
