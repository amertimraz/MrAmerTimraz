import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import type { UserRole } from './types';

import LandingLayout         from './components/landing/LandingLayout';
import HomePage              from './pages/landing/HomePage';
import CoursesPage           from './pages/landing/CoursesPage';
import AboutPage             from './pages/landing/AboutPage';
import ContactPage           from './pages/landing/ContactPage';

import DashboardLayout       from './components/layout/DashboardLayout';
import LoginPage             from './pages/LoginPage';
import RegisterPage          from './pages/RegisterPage';

import StudentDashboard      from './pages/student/StudentDashboard';
import StudentCourses        from './pages/student/StudentCourses';
import CourseDetail          from './pages/student/CourseDetail';
import TakeTest              from './pages/student/TakeTest';
import StudentResults        from './pages/student/StudentResults';
import GamesPage             from './pages/student/GamesPage';
import NotificationsPage     from './pages/student/NotificationsPage';

import TeacherDashboard      from './pages/teacher/TeacherDashboard';
import TeacherCourses        from './pages/teacher/TeacherCourses';
import CourseManager         from './pages/teacher/CourseManager';
import TestManager           from './pages/teacher/TestManager';
import TeacherStudents       from './pages/teacher/TeacherStudents';
import AddCoursePage         from './pages/teacher/AddCoursePage';
import AddLessonPage         from './pages/teacher/AddLessonPage';
import CreateTestPage        from './pages/teacher/CreateTestPage';
import AddQuestionPage       from './pages/teacher/AddQuestionPage';
import QuestionBankPage      from './pages/teacher/QuestionBankPage';
import TestGeneratorPage     from './pages/teacher/TestGeneratorPage';

import AdminDashboard        from './pages/admin/AdminDashboard';
import AdminUsers            from './pages/admin/AdminUsers';
import AdminCourses          from './pages/admin/AdminCourses';
import AdminSettings         from './pages/admin/AdminSettings';
import AdminCategories       from './pages/admin/AdminCategories';
import AdminPayments         from './pages/admin/AdminPayments';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
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
        <Routes>
          {/* Landing / Public Routes */}
          <Route element={<LandingLayout />}>
            <Route path="/"         element={<HomePage />} />
            <Route path="/courses"  element={<CoursesPage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/contact"  element={<ContactPage />} />
          </Route>

          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Routes */}
          <Route path="/student" element={<RequireAuth roles={['Student']}><DashboardLayout /></RequireAuth>}>
            <Route index                  element={<StudentDashboard />} />
            <Route path="courses"         element={<StudentCourses />} />
            <Route path="courses/:id"     element={<CourseDetail />} />
            <Route path="tests"           element={<StudentCourses />} />
            <Route path="tests/:id"       element={<TakeTest />} />
            <Route path="results"         element={<StudentResults />} />
            <Route path="games"           element={<GamesPage />} />
            <Route path="notifications"   element={<NotificationsPage />} />
          </Route>

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
            <Route path="courses"         element={<AdminCourses />} />
            <Route path="payments"        element={<AdminPayments />} />
            <Route path="tests"           element={<AdminCourses />} />
            <Route path="notifications"   element={<NotificationsPage />} />
            <Route path="settings"        element={<AdminSettings />} />
            <Route path="categories"      element={<AdminCategories />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Arial' } }} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
