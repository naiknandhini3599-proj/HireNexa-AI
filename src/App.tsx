import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { RecruiterDashboard } from './pages/RecruiterDashboard.js';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard.js';
import { CandidateInterviewPortal } from './pages/CandidateInterviewPortal.js';
import { AuthModal } from './pages/AuthModal.js';
import type { User } from './types/index.js';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'recruiter' | 'admin' | 'candidate'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [candidateToken, setCandidateToken] = useState<string>('tok_demo_alex_chen');

  // Check URL path or local session on mount
  useEffect(() => {
    // 1. Check path for /interview/:token
    const path = window.location.pathname;
    if (path.startsWith('/interview/')) {
      const token = path.replace('/interview/', '').split('/')[0];
      if (token) {
        setCandidateToken(token);
        setCurrentView('candidate');
        return;
      }
    }

    // 2. Check stored session
    try {
      const stored = localStorage.getItem('hirenexa_user');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      }
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    }
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('hirenexa_user', JSON.stringify(user));
      localStorage.setItem('hirenexa_token', token);
    } catch (e) {}

    if (user.role === 'super_admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('recruiter');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('hirenexa_user');
      localStorage.removeItem('hirenexa_token');
    } catch (e) {}
    setCurrentView('landing');
  };

  const handleQuickSwitchRole = (role: 'super_admin' | 'recruiter' | 'candidate') => {
    if (role === 'candidate') {
      setCurrentView('candidate');
    } else if (role === 'super_admin') {
      const adminUser: User = {
        id: 'usr_admin_1',
        name: 'Nandhini SuperAdmin',
        email: 'admin@hirenexa.ai',
        role: 'super_admin',
        organization: 'HireNexa Global Enterprise',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminUser);
      setCurrentView('admin');
    } else {
      const recUser: User = {
        id: 'usr_recruiter_1',
        name: 'Sarah Jenkins',
        email: 'sarah.recruiter@hirenexa.ai',
        role: 'recruiter',
        organization: 'TechVision Labs',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(recUser);
      setCurrentView('recruiter');
    }
  };

  const handleOpenCandidateLink = (token: string) => {
    setCandidateToken(token);
    setCurrentView('candidate');
  };

  // If in candidate portal view, render dedicated portal without distracting headers
  if (currentView === 'candidate') {
    return (
      <CandidateInterviewPortal
        invitationToken={candidateToken}
        onExit={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Universal Navigation Header */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view: string) => setCurrentView(view as any)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onQuickSwitchRole={handleQuickSwitchRole}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartRecruiter={() => {
              if (currentUser?.role === 'super_admin') {
                setCurrentView('admin');
              } else if (currentUser) {
                setCurrentView('recruiter');
              } else {
                handleQuickSwitchRole('recruiter');
              }
            }}
            onStartCandidateDemo={() => handleOpenCandidateLink('tok_demo_alex_chen')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentView === 'recruiter' && (
          <RecruiterDashboard
            currentUser={
              currentUser || {
                id: 'usr_recruiter_1',
                name: 'Sarah Jenkins',
                email: 'sarah.recruiter@hirenexa.ai',
                role: 'recruiter',
                organization: 'TechVision Labs',
                isActive: true,
                createdAt: new Date().toISOString(),
              }
            }
            onOpenCandidateLink={handleOpenCandidateLink}
          />
        )}

        {currentView === 'admin' && (
          <SuperAdminDashboard
            currentUser={
              currentUser || {
                id: 'usr_admin_1',
                name: 'Nandhini SuperAdmin',
                email: 'admin@hirenexa.ai',
                role: 'super_admin',
                organization: 'HireNexa Global Enterprise',
                isActive: true,
                createdAt: new Date().toISOString(),
              }
            }
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
export default App;
