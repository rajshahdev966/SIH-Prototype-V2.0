import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { RiAlertLine } from '@remixicon/react';
import { coursesApi, caseStudiesApi } from './api';
import {
  Navbar,
  Footer,
  DeveloperFooter,
  HeroSection,
  MetricStatsBar,
  NationalGovernanceGrid,
  ShowcasedCoursesSection,
  CaseStudiesSection,
  LandingExtras,
  LoginView,
  RegisterView,
  LoadingState,
  CourseCatalog,
  CourseSummaryReader,
  Quiz,
  AnalysisDashboard,
  CumulativeGrowthDashboard,
  AdminLogin,
  AdminPortal
} from './components';

// ==========================================
// 1. LEARNER LAYOUT (Includes Authentic Navbar)
// ==========================================
function LearnerLayout({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-[#0B5C9E] selection:text-white">
      <Navbar
        currentUser={currentUser}
        currentView={location.pathname}
        onLoginClick={() => navigate('/login')}
        onRegisterClick={() => navigate('/register')}
        onLogoutClick={onLogout}
        onViewGrowth={() => navigate('/growth')}
        onGoHome={() => navigate('/')}
      />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <DeveloperFooter />
    </div>
  );
}

// ==========================================
// 2. LANDING PAGE VIEW
// ==========================================
function LandingPage({ courses, caseStudies, currentUser, onRefreshCourses }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (onRefreshCourses) onRefreshCourses();
  }, []);

  const handleRequireAuth = ({ action, courseId }) => {
    if (currentUser) {
      if (action === 'reader') navigate(`/courses/${courseId}`);
      else if (action === 'quiz') navigate(`/quiz/${courseId}`);
      return;
    }
    const targetUrl = action === 'reader' ? `/courses/${courseId}` : `/quiz/${courseId}`;
    navigate('/login', {
      state: {
        returnTo: targetUrl,
        notice: 'Please sign in with your official credentials to access civil service learning modules.'
      }
    });
  };

  return (
    <div>
      <HeroSection
        onRegisterClick={() => navigate('/register')}
        onLoginClick={() => navigate('/login')}
        currentUser={currentUser}
      />

      <MetricStatsBar courseCount={courses.length} />

      <NationalGovernanceGrid />

      <ShowcasedCoursesSection
        courses={courses}
        onReadSummary={(courseId) => navigate(`/courses/${courseId}`)}
        onTakeQuiz={(courseId) => navigate(`/quiz/${courseId}`)}
        currentUser={currentUser}
        onRequireAuth={handleRequireAuth}
      />

      <CaseStudiesSection
        caseStudies={caseStudies}
        currentUser={currentUser}
        onRequireAuth={() => {
          navigate('/login', {
            state: {
              returnTo: '/',
              notice: 'Please sign in to access Amrit Gyaan Kosh governance case studies.'
            }
          });
        }}
      />

      <LandingExtras />
    </div>
  );
}

// ==========================================
// 3. COURSE CATALOG PAGE VIEW
// ==========================================
function CourseCatalogPage({ courses, loading }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold text-[#0B5C9E] hover:underline flex items-center gap-1 cursor-pointer"
        >
          ← Return to Official Landing Page
        </button>
      </div>

      {loading ? (
        <LoadingState
          message="Loading Governance Modules..."
          subMessage="Synchronizing published courses from iGOT"
        />
      ) : (
        <CourseCatalog
          courses={courses}
          onReadSummary={(courseId) => navigate(`/courses/${courseId}`)}
          onTakeQuiz={(courseId) => navigate(`/quiz/${courseId}`)}
          onViewCourseHistory={(courseId) => navigate(`/quiz/${courseId}`)}
        />
      )}
    </div>
  );
}

// ==========================================
// 4. COURSE SUMMARY READER PAGE (Auth Gated)
// ==========================================
function CourseReaderPage({ currentUser }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', {
        replace: true,
        state: {
          returnTo: `/courses/${courseId}`,
          notice: 'Please sign in to read official course summaries.'
        }
      });
      return;
    }

    let isMounted = true;
    setLoading(true);
    coursesApi.getById(courseId)
      .then((data) => {
        if (isMounted && data.success) {
          setCourse(data.course);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [courseId, currentUser, navigate]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="py-16">
        <LoadingState
          message="Loading Module Summary..."
          subMessage="Fetching authorized content from iGOT Karmayogi"
        />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
          <RiAlertLine size={18} className="shrink-0" />
          <span>{error || 'Module not found'}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-[#0B5C9E] font-bold text-sm hover:underline cursor-pointer"
        >
          ← Back to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CourseSummaryReader
        course={course}
        onBackToCatalog={() => navigate('/courses')}
        onProceedToQuiz={() => navigate(`/quiz/${courseId}`)}
      />
    </div>
  );
}

// ==========================================
// 5. QUIZ ASSESSMENT ROOM PAGE (Auth Gated)
// ==========================================
function QuizPage({ currentUser, onQuizComplete }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', {
        replace: true,
        state: {
          returnTo: `/quiz/${courseId}`,
          notice: 'Please sign in to take this assessment.'
        }
      });
      return;
    }

    let isMounted = true;
    setLoading(true);
    coursesApi.getById(courseId)
      .then((data) => {
        if (isMounted && data.success) {
          setCourse(data.course);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [courseId, currentUser, navigate]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="py-16">
        <LoadingState
          message="Preparing Assessment Room..."
          subMessage="Setting up 15-question evaluation environment"
        />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
          <RiAlertLine size={18} className="shrink-0" />
          <span>{error || 'Module not found'}</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-[#0B5C9E] font-bold text-sm hover:underline cursor-pointer"
        >
          ← Back to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Quiz
        courseId={course.courseId}
        courseTitle={course.title}
        mcqs={course.mcqs || []}
        currentUser={currentUser}
        onQuizComplete={(payload) => onQuizComplete(course.courseId, payload)}
        onBackToSummary={() => navigate(`/courses/${courseId}`)}
      />
    </div>
  );
}

// ==========================================
// 6. RESULT ANALYSIS DASHBOARD PAGE
// ==========================================
function ResultPage({ activeSubmission, activeProfile }) {
  const navigate = useNavigate();

  const submission = activeSubmission || (() => {
    try {
      const s = sessionStorage.getItem('sih_active_submission');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();

  const profile = activeProfile || (() => {
    try {
      const p = sessionStorage.getItem('sih_active_profile');
      return p ? JSON.parse(p) : null;
    } catch { return null; }
  })();

  if (!submission || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-lg mx-auto">
          <h3 className="text-base font-bold text-gray-800 mb-2">No Active Assessment Report Selected</h3>
          <p className="text-xs text-gray-500 mb-6">
            Please select an assessment from your Growth Analytics ledger to view its AI competency evaluation.
          </p>
          <button
            onClick={() => navigate('/growth')}
            className="bg-[#0B5C9E] hover:bg-[#0A387E] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            ← Go to Growth Analytics Ledger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnalysisDashboard
        submission={submission}
        profile={profile}
        onBackToCatalog={() => navigate('/')}
        onViewHistory={() => navigate('/growth')}
        onRetake={() => {
          if (submission.courseId) {
            navigate(`/quiz/${submission.courseId}`);
          }
        }}
      />
    </div>
  );
}

// ==========================================
// 7. CUMULATIVE GROWTH DASHBOARD PAGE (Auth Gated)
// ==========================================
function GrowthPage({ currentUser, onSelectSubmission }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', {
        replace: true,
        state: {
          returnTo: '/growth',
          notice: 'Please sign in to view your longitudinal growth profile.'
        }
      });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CumulativeGrowthDashboard
        currentUser={currentUser}
        onRequireAuth={() => navigate('/login')}
        onBack={() => navigate('/')}
        onBackToCatalog={() => navigate('/courses')}
        onSelectPastSubmission={(submission) => {
          if (onSelectSubmission) onSelectSubmission(submission);
          navigate('/result');
        }}
        onSelectSubmission={(submission) => {
          if (onSelectSubmission) onSelectSubmission(submission);
          navigate('/result');
        }}
      />
    </div>
  );
}

// ==========================================
// 8. DEDICATED LOGIN PAGE (No Navbar)
// ==========================================
function LoginPage({ currentUser, onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const returnTo = location.state?.returnTo || '/';
  const notice = location.state?.notice || '';
  const initialEmail = location.state?.email || '';

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <LoginView
        intendedNotice={notice}
        initialEmail={initialEmail}
        onSuccess={(user) => {
          onAuthSuccess(user);
          navigate(returnTo, { replace: true });
        }}
        onSwitchToRegister={(typedEmail) => navigate('/register', { state: { ...location.state, email: typedEmail || initialEmail } })}
        onGoHome={() => navigate('/')}
      />
      <DeveloperFooter />
    </div>
  );
}

// ==========================================
// 9. DEDICATED REGISTER PAGE (No Navbar)
// ==========================================
function RegisterPage({ currentUser, onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const returnTo = location.state?.returnTo || '/';
  const initialEmail = location.state?.email || '';

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <RegisterView
        initialEmail={initialEmail}
        onSuccess={(user) => {
          onAuthSuccess(user);
          navigate(returnTo, { replace: true });
        }}
        onSwitchToLogin={(typedEmail) => navigate('/login', { state: { ...location.state, email: typedEmail || initialEmail } })}
        onGoHome={() => navigate('/')}
      />
      <DeveloperFooter />
    </div>
  );
}

// ==========================================
// 10. DEDICATED ADMIN ROUTE (No Learner Navbar)
// ==========================================
function AdminRoute({ adminToken, adminUser, onLoginSuccess, onLogout, onCoursesChange }) {
  const navigate = useNavigate();

  // If not authenticated as admin, show Admin Login (without learner Navbar)
  if (!adminToken) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <AdminLogin
          onLoginSuccess={onLoginSuccess}
          onGoHome={() => navigate('/')}
        />
        <DeveloperFooter />
      </div>
    );
  }

  // If authenticated as admin, show Admin Portal (without learner Navbar)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <div className="p-4 sm:p-6 lg:p-8 flex-1">
        <AdminPortal
          adminUser={adminUser}
          adminToken={adminToken}
          onLogout={onLogout}
          onCoursesChange={onCoursesChange}
        />
      </div>
      <DeveloperFooter />
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
  const navigate = useNavigate();

  // Learner Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sih_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin Auth State
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('sih_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('sih_admin_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  // Courses & Data State
  const [courses, setCourses] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(() => {
    try {
      const s = sessionStorage.getItem('sih_active_submission');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const p = sessionStorage.getItem('sih_active_profile');
      return p ? JSON.parse(p) : null;
    } catch {
      return null;
    }
  });
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    fetchPublishedCourses();
    fetchCaseStudies();
  }, []);

  const fetchPublishedCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = await coursesApi.getAll();
      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.warn('Courses fetch note:', err.message);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchCaseStudies = async () => {
    try {
      const data = await caseStudiesApi.getAll();
      if (data.success) {
        setCaseStudies(data.caseStudies || []);
      }
    } catch (err) {
      console.warn('Case studies fetch note:', err.message);
    }
  };

  const handleRefreshAll = () => {
    fetchPublishedCourses();
    fetchCaseStudies();
  };

  const handleLearnerLoginSuccess = (user) => {
    localStorage.setItem('sih_current_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLearnerLogout = () => {
    localStorage.removeItem('sih_current_user');
    setCurrentUser(null);
    navigate('/');
  };

  const handleAdminLoginSuccess = (token, user) => {
    sessionStorage.setItem('sih_admin_token', token);
    sessionStorage.setItem('sih_admin_user', JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('sih_admin_token');
    sessionStorage.removeItem('sih_admin_user');
    setAdminToken('');
    setAdminUser(null);
  };

  const handleQuizSubmit = async (courseId, quizPayload) => {
    try {
      const payload = {
        ...quizPayload,
        phone: currentUser?.phone || null,
        learnerName: currentUser?.name || 'Civil Servant Learner'
      };

      const data = await coursesApi.submitQuiz(courseId, payload);
      setActiveProfile(data.profile);
      setActiveSubmission(data.submission);
      try {
        sessionStorage.setItem('sih_active_submission', JSON.stringify(data.submission));
        sessionStorage.setItem('sih_active_profile', JSON.stringify(data.profile));
      } catch (e) {}
      fetchPublishedCourses();
      navigate('/result');
    } catch (err) {
      console.error('Quiz submission error:', err.message);
      alert('Failed to submit quiz: ' + err.message);
    }
  };

  const handleSelectPastSubmission = (submission) => {
    if (!submission) return;
    const profile = submission.profile || {};
    setActiveSubmission(submission);
    setActiveProfile(profile);
    try {
      sessionStorage.setItem('sih_active_submission', JSON.stringify(submission));
      sessionStorage.setItem('sih_active_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Session save note:', e);
    }
  };

  return (
    <Routes>
      {/* 1. Dedicated Authentication Routes (No Navbar) */}
      <Route
        path="/login"
        element={
          <LoginPage
            currentUser={currentUser}
            onAuthSuccess={handleLearnerLoginSuccess}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            currentUser={currentUser}
            onAuthSuccess={handleLearnerLoginSuccess}
          />
        }
      />

      {/* 2. Dedicated Admin Route (No Learner Navbar) */}
      <Route
        path="/admin"
        element={
          <AdminRoute
            adminToken={adminToken}
            adminUser={adminUser}
            onLoginSuccess={handleAdminLoginSuccess}
            onLogout={handleAdminLogout}
            onCoursesChange={handleRefreshAll}
          />
        }
      />

      {/* 3. Learner Portal Layout Routes (With Authentic Karmayogi Navbar) */}
      <Route
        element={
          <LearnerLayout
            currentUser={currentUser}
            onLogout={handleLearnerLogout}
          />
        }
      >
        <Route
          path="/"
          element={
            <LandingPage
              courses={courses}
              caseStudies={caseStudies}
              currentUser={currentUser}
              onRefreshCourses={handleRefreshAll}
            />
          }
        />
        <Route
          path="/courses"
          element={
            <CourseCatalogPage
              courses={courses}
              loading={loadingCourses}
            />
          }
        />
        <Route
          path="/courses/:courseId"
          element={<CourseReaderPage currentUser={currentUser} />}
        />
        <Route
          path="/quiz/:courseId"
          element={
            <QuizPage
              currentUser={currentUser}
              onQuizComplete={handleQuizSubmit}
            />
          }
        />
        <Route
          path="/result"
          element={
            <ResultPage
              activeSubmission={activeSubmission}
              activeProfile={activeProfile}
            />
          }
        />
        <Route
          path="/growth"
          element={
            <GrowthPage
              currentUser={currentUser}
              onSelectSubmission={handleSelectPastSubmission}
            />
          }
        />
      </Route>

      {/* 4. Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
