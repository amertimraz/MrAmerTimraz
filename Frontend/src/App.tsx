import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import type { UserRole } from './types';

// Layouts (Static)
import LandingLayout from './components/landing/LandingLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Shared Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy Pages
const HomePage = lazy(() => import('./pages/landing/HomePage'));
const CoursesPage = lazy(() => import('./pages/landing/CoursesPage'));
const AboutPage = lazy(() => import('./pages/landing/AboutPage'));
const ContactPage = lazy(() => import('./pages/landing/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/landing/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/landing/TermsPage'));
const LibraryPage = lazy(() => import('./pages/landing/LibraryPage'));
const PathsGuidePage = lazy(() => import('./pages/landing/PathsGuidePage'));
const PublicLevelsPage = lazy(() => import('./pages/PublicLevelsPage'));
const InteractiveTheoryPage = lazy(() => import('./pages/landing/InteractiveTheoryPage'));
const TofasExamPage = lazy(() => import('./pages/TofasExamPage'));

const PublicQuizPage = lazy(() => import('./pages/PublicQuizPage'));
const PublicCertificatePage = lazy(() => import('./pages/PublicCertificatePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentCourses = lazy(() => import('./pages/student/StudentCourses'));
const CourseDetail = lazy(() => import('./pages/student/CourseDetail'));
const TakeTest = lazy(() => import('./pages/student/TakeTest'));
const StudentResults = lazy(() => import('./pages/student/StudentResults'));
const GamesPage = lazy(() => import('./pages/student/GamesPage'));
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage'));
const LessonPage = lazy(() => import('./pages/student/LessonPage'));
const LiveSessionsPage = lazy(() => import('./pages/student/LiveSessionsPage'));
const BookletsPage = lazy(() => import('./pages/student/BookletsPage'));
const BookletDetailsPage = lazy(() => import('./pages/student/BookletDetailsPage'));
const MyBookletsPage = lazy(() => import('./pages/student/MyBookletsPage'));
const ChallengesList = lazy(() => import('./pages/student/ChallengesList'));
const ChallengePage = lazy(() => import('./pages/student/ChallengePage'));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'));
const LevelAssessmentsPage = lazy(() => import('./pages/student/LevelAssessmentsPage'));
const LevelCertificatePage = lazy(() => import('./pages/student/LevelCertificatePage'));
const LevelCodeExamPage = lazy(() => import('./pages/student/LevelCodeExamPage'));

const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherCourses = lazy(() => import('./pages/teacher/TeacherCourses'));
const CourseManager = lazy(() => import('./pages/teacher/CourseManager'));
const TestManager = lazy(() => import('./pages/teacher/TestManager'));
const TeacherStudents = lazy(() => import('./pages/teacher/TeacherStudents'));
const AddCoursePage = lazy(() => import('./pages/teacher/AddCoursePage'));
const AddLessonPage = lazy(() => import('./pages/teacher/AddLessonPage'));
const CreateTestPage = lazy(() => import('./pages/teacher/CreateTestPage'));
const AddQuestionPage = lazy(() => import('./pages/teacher/AddQuestionPage'));
const QuestionBankPage = lazy(() => import('./pages/teacher/QuestionBankPage'));
const TestGeneratorPage = lazy(() => import('./pages/teacher/TestGeneratorPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
import AdminUsers           from './pages/admin/AdminUsers';
import AdminUserDetails     from './pages/admin/AdminUserDetails';
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminLibrary = lazy(() => import('./pages/admin/AdminLibrary'));
const AdminLibraryStudentStats = lazy(() => import('./pages/admin/AdminLibraryStudentStats'));
const AdminQuizzes = lazy(() => import('./pages/admin/AdminQuizzes'));
const AdminChallenges = lazy(() => import('./pages/admin/AdminChallenges'));
const AdminLiveSessions = lazy(() => import('./pages/admin/AdminLiveSessions'));
const AdminBookletStats = lazy(() => import('./pages/admin/AdminBookletStats'));
const AdminPaymentSettings = lazy(() => import('./pages/admin/AdminPaymentSettings'));
const AdminAllResults = lazy(() => import('./pages/admin/AdminAllResults'));
const FileManagerPage = lazy(() => import('./pages/admin/FileManagerPage'));
const BookletsManager = lazy(() => import('./pages/admin/BookletsManager'));
const AdminLevelAssessments = lazy(() => import('./pages/admin/AdminLevelAssessments'));
const QuizPresenter = lazy(() => import('./pages/QuizPresenter'));
const RevisionPresenter = lazy(() => import('./pages/RevisionPresenter'));
const RevisionHub = lazy(() => import('./pages/RevisionHub'));

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: 1, 
      staleTime: 120_000, 
      refetchOnWindowFocus: false 
    } 
  },
});

function RequireAuth({ children, roles }: { children: React.ReactElement; roles?: UserRole[] }) {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  return children;
}

export default function App() {
  const { isDark } = useAuthStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Landing / Public Routes */}
            <Route element={<LandingLayout />}>
              <Route path="/"         element={<HomePage />} />
              <Route path="/courses"  element={<CoursesPage />} />
              <Route path="/about"    element={<AboutPage />} />
              <Route path="/contact"  element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/library"  element={<LibraryPage />} />
              <Route path="/masarat"  element={<PathsGuidePage />} />
              <Route path="/public-levels" element={<PublicLevelsPage />} />
              <Route path="/interactive-theory" element={<InteractiveTheoryPage />} />
            </Route>

            <Route path="/tofas-exam" element={<TofasExamPage />} />


            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/public-quiz/:quizId" element={<PublicQuizPage />} />
            <Route path="/public-certificate/:quizId" element={<PublicCertificatePage />} />

            {/* Student Routes */}
            <Route path="/student" element={<RequireAuth roles={['Student']}><DashboardLayout /></RequireAuth>}>
              <Route index                  element={<StudentDashboard />} />
              <Route path="courses"         element={<StudentCourses />} />
              <Route path="courses/:id"     element={<CourseDetail />} />
              <Route path="tests"           element={<StudentCourses />} />
              <Route path="tests/:id"       element={<TakeTest />} />
              <Route path="results"         element={<StudentResults />} />
              <Route path="games"           element={<GamesPage />} />
              <Route path="live-sessions"   element={<LiveSessionsPage />} />
              <Route path="my-booklets"     element={<MyBookletsPage />} />
              <Route path="notifications"   element={<NotificationsPage />} />
              <Route path="profile"         element={<ProfilePage />} />
              <Route path="levels"          element={<LevelAssessmentsPage />} />
              <Route path="levels/take/:id" element={<LevelCodeExamPage />} />
              <Route path="levels/certificate/:quizId" element={<LevelCertificatePage />} />
            </Route>

            {/* Common Authenticated Routes (Booklets, etc.) */}
            <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route path="/booklets"        element={<BookletsPage />} />
              <Route path="/booklets/:id"    element={<BookletDetailsPage />} />
              <Route path="/challenges"      element={<ChallengesList />} />
            </Route>

            {/* Full Screen Challenges (Outside DashboardLayout for Print support) */}
            <Route path="/challenges/:slug" element={<RequireAuth><ChallengePage /></RequireAuth>} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={<RequireAuth roles={['Teacher', 'Admin']}><DashboardLayout /></RequireAuth>}>
              <Route index                                         element={<TeacherDashboard />} />
              <Route path="courses"                               element={<TeacherCourses />} />
              <Route path="courses/new"                           element={<AddCoursePage />} />
              <Route path="courses/:id"                           element={<CourseManager />} />
              <Route path="courses/:courseId/lessons/new"         element={<AddLessonPage />} />
              <Route path="courses/:courseId/tests/new"           element={<CreateTestPage />} />
              <Route path="tests/generate"                        element={<TestGeneratorPage />} />
              <Route path="tests"                                 element={<TeacherCourses />} />
              <Route path="tests/:id"                             element={<TestManager />} />
              <Route path="tests/:testId/questions/new"           element={<AddQuestionPage />} />
              <Route path="question-bank"                         element={<QuestionBankPage />} />
              <Route path="students"                              element={<TeacherStudents />} />
              <Route path="notifications"                         element={<NotificationsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<RequireAuth roles={['Admin']}><DashboardLayout /></RequireAuth>}>
              <Route index                  element={<AdminDashboard />} />
              <Route path="users"           element={<AdminUsers />} />
            <Route path="users/:id"       element={<AdminUserDetails />} />
              <Route path="courses"         element={<AdminCourses />} />
              <Route path="payments"        element={<AdminPayments />} />
              <Route path="tests"           element={<AdminCourses />} />
              <Route path="notifications"   element={<AdminNotifications />} />
              <Route path="settings"        element={<AdminSettings />} />
              <Route path="categories"      element={<AdminCategories />} />
              <Route path="library"         element={<AdminLibrary />} />
              <Route path="library-stats"   element={<AdminLibraryStudentStats />} />
              <Route path="quizzes"         element={<AdminQuizzes />} />
              <Route path="challenges"      element={<AdminChallenges />} />
              <Route path="all-results"     element={<AdminAllResults />} />
              <Route path="booklets"        element={<BookletsManager />} />
              <Route path="booklet-stats"    element={<AdminBookletStats />} />
              <Route path="payment-settings" element={<AdminPaymentSettings />} />
              <Route path="levels"          element={<AdminLevelAssessments />} />
              <Route path="live-sessions"   element={<AdminLiveSessions />} />
              <Route path="files"           element={<FileManagerPage />} />
            </Route>

            <Route path="/quiz-presenter/:id" element={<RequireAuth roles={['Admin', 'Teacher']}><QuizPresenter /></RequireAuth>} />
            <Route path="/interactive-revision" element={<RevisionHub />} />
            <Route path="/interactive-revision/:id" element={<RevisionPresenter />} />
            <Route path="/interactive-revision/slug/:slug" element={<RevisionPresenter />} />
            <Route path="/quiz/:id" element={<QuizPresenter />} />

            <Route path="/lessons/:slug" element={<RequireAuth><LessonPage /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Arial' } }} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
