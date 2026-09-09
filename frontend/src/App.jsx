import { API_BASE_URL } from './config';
﻿import React, { useState, useEffect } from 'react';
import CourseCatalog from './components/CourseCatalog';
import CourseSummaryReader from './components/CourseSummaryReader';
import Quiz from './components/Quiz';
import AnalysisDashboard from './components/AnalysisDashboard';
import CumulativeGrowthDashboard from './components/CumulativeGrowthDashboard';
import PhoneAuthModal from './components/PhoneAuthModal';
import AdminLogin from './components/AdminLogin';
import AdminPortal from './components/AdminPortal';

function App() {
  // Check if current URL route is /admin
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin');
  });

  // Admin Session State (Scoped strictly to /admin)
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('sih_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('sih_admin_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Learner Views: 'catalog' | 'reader' | 'quiz' | 'result' | 'growth'
  const [learnerView, setLearnerView] = useState('catalog');

  // Learner Profile State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sih_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Data States
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [error, setError] = useState('');

  // Handle route change listener (e.g. popstate or pushState)
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    if (!isAdminRoute) {
      fetchPublishedCourses();
    }
  }, [isAdminRoute]);

  const fetchPublishedCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleOpenCourseReader = async (courseId) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch course');

      setActiveCourse(data.course);
      setLearnerView('reader');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenQuiz = async (courseId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch course');

      setActiveCourse(data.course);
      setLearnerView('quiz');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuizSubmit = async (quizPayload) => {
    if (!activeCourse) return;
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${activeCourse.courseId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quizPayload,
          phone: currentUser?.phone || null,
          learnerName: currentUser?.name || 'Civil Servant Learner'
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Quiz evaluation failed');

      setActiveProfile(data.profile);
      setActiveSubmission(data.submission);
      setLearnerView('result');
      fetchPublishedCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewPastSubmission = (submission) => {
    setActiveSubmission(submission);
    setActiveProfile(submission.profile);
    setLearnerView('result');
  };

  const handleLearnerLogout = () => {
    localStorage.removeItem('sih_current_user');
    setCurrentUser(null);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('sih_admin_token');
    sessionStorage.removeItem('sih_admin_user');
    setAdminToken('');
    setAdminUser(null);
  };
  // =========================================================================
  // 1. ADMIN ROUTE (/admin): Strictly Authenticated Admin Gateway & Hub
  // =========================================================================
  if (isAdminRoute) {
    if (!adminToken || !adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(authData) => {
            setAdminToken(authData.token);
            setAdminUser(authData.admin);
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
        <AdminPortal
          adminUser={adminUser}
          adminToken={adminToken}
          onLogout={handleAdminLogout}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. PUBLIC LEARNER ROUTE (/): Zero Admin Presence
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/80 text-gray-800 font-sans">
      {/* Learner Public Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setLearnerView('catalog')}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                iG
              </div>
              <div>
                <h1 className="text-base font-extrabold text-gray-900 leading-none tracking-tight">
                  iGOT Karmayogi Hub
                </h1>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Civil Service Competency Evaluation Platform
                </p>
              </div>
            </div>

            {/* Learner Navigation */}
            <nav className="hidden sm:flex items-center gap-2 bg-gray-100/70 p-1 rounded-2xl">
              <button
                onClick={() => {
                  setLearnerView('catalog');
                  fetchPublishedCourses();
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  learnerView === 'catalog'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Courses ({courses.length})
              </button>

              {activeCourse && (
                <>
                  <button
                    onClick={() => setLearnerView('reader')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      learnerView === 'reader'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Summary Reader
                  </button>
                  <button
                    onClick={() => setLearnerView('quiz')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      learnerView === 'quiz'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Assessment Room
                  </button>
                </>
              )}

              {activeProfile && (
                <button
                  onClick={() => setLearnerView('result')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    learnerView === 'result'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Test Evaluation
                </button>
              )}

              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowAuthModal(true);
                  } else {
                    setLearnerView('growth');
                  }
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  learnerView === 'growth'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🌱</span>
                <span>My Growth & All Tests</span>
              </button>
            </nav>

            {/* Officer Profile Chip */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-2xl cursor-pointer transition-colors"
                    title="Click to edit profile"
                  >
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-bold text-gray-900 leading-none">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono leading-none mt-1">{currentUser.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLearnerLogout}
                    className="text-gray-400 hover:text-red-600 text-sm p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out Officer"
                  >
                    🚪
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Sign In (Phone)
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* View 1: Catalog */}
        {learnerView === 'catalog' && (
          <CourseCatalog
            courses={courses}
            onReadSummary={handleOpenCourseReader}
            onTakeQuiz={handleOpenQuiz}
            onViewCourseHistory={(courseId) => handleOpenCourseReader(courseId)}
          />
        )}

        {/* View 2: Dedicated Course Summary Reader */}
        {learnerView === 'reader' && activeCourse && (
          <CourseSummaryReader
            course={activeCourse}
            onProceedToQuiz={() => {
              if (!currentUser) {
                setShowAuthModal(true);
              } else {
                setLearnerView('quiz');
              }
            }}
            onBackToCatalog={() => setLearnerView('catalog')}
          />
        )}

        {/* View 3: Dedicated Assessment Room */}
        {learnerView === 'quiz' && activeCourse && (
          <Quiz
            mcqs={activeCourse.mcqs || []}
            courseId={activeCourse.courseId}
            currentUser={currentUser}
            onQuizComplete={handleQuizSubmit}
            onBackToSummary={() => setLearnerView('reader')}
          />
        )}

        {/* View 4: Test Evaluation */}
        {learnerView === 'result' && activeProfile && (
          <AnalysisDashboard
            profile={activeProfile}
            submission={activeSubmission}
            onRetake={() => setLearnerView('quiz')}
            onBackToCatalog={() => setLearnerView('catalog')}
            onViewHistory={() => setLearnerView('growth')}
          />
        )}

        {/* View 5: Longitudinal Cumulative Growth Dashboard */}
        {learnerView === 'growth' && (
          <CumulativeGrowthDashboard
            currentUser={currentUser}
            onSelectPastSubmission={handleViewPastSubmission}
            onBackToCatalog={() => setLearnerView('catalog')}
          />
        )}
      </main>

      {/* Phone Auth Modal */}
      <PhoneAuthModal
        isOpen={showAuthModal}
        currentUser={currentUser}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}

export default App;
