import { useAuthContext } from '@/auth/AuthContext';
import { GuestOnlyOutlet } from '@/components/auth/GuestOnlyOutlet';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { RedirectIfSignedIn } from '@/components/auth/RedirectIfSignedIn';
import { RequireAuth } from '@/components/auth/RequireAuth';
import type { ReactElement } from 'react';
import type { DataRouter } from 'react-router-dom';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import LandingLayout from './layouts/LandingLayout';
import ServiceLayout from './layouts/ServiceLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminModulesPage from './pages/AdminModulesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import CreateModulePage from './pages/CreateModulePage';
import EditFlashcardModulePage from './pages/EditFlashcardModulePage';
import EditQuizModulePage from './pages/EditQuizModulePage';
import FlashcardStudyPage from './pages/FlashcardStudyPage';
import QuizStudyPage from './pages/QuizStudyPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import NotFoundPage from './pages/NotFoundPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import RouteErrorPage from './pages/RouteErrorPage';
import StatisticsPage from './pages/statistics';

function UserHomeRoute() {
  const { user } = useAuthContext();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/app/admin" replace />;
  }
  return <DashboardPage />;
}

function LearnerOnlyRoute({ children }: { children: ReactElement }) {
  const { user } = useAuthContext();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/app/admin" replace />;
  }
  return children;
}

function StatisticsRoute() {
  const { user } = useAuthContext();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/app/admin" replace />;
  }
  return <StatisticsPage />;
}

export const router: DataRouter = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    element: (
      <RedirectIfSignedIn>
        <LandingLayout />
      </RedirectIfSignedIn>
    ),
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    path: '/auth',
    errorElement: <RouteErrorPage />,
    element: <AuthLayout />,
    children: [
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'oauth/callback', element: <OAuthCallbackPage /> },
      {
        element: <GuestOnlyOutlet />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    path: '/app',
    errorElement: <RouteErrorPage />,
    element: (
      <RequireAuth>
        <ServiceLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <UserHomeRoute /> },
      {
        path: 'modules/create',
        element: (
          <LearnerOnlyRoute>
            <CreateModulePage />
          </LearnerOnlyRoute>
        ),
      },
      {
        path: 'modules/:moduleId/edit',
        element: (
          <LearnerOnlyRoute>
            <EditFlashcardModulePage />
          </LearnerOnlyRoute>
        ),
      },
      {
        path: 'modules/:moduleId/flash-study',
        element: (
          <LearnerOnlyRoute>
            <FlashcardStudyPage />
          </LearnerOnlyRoute>
        ),
      },
      {
        path: 'modules/:moduleId/quiz-study',
        element: (
          <LearnerOnlyRoute>
            <QuizStudyPage />
          </LearnerOnlyRoute>
        ),
      },
      {
        path: 'modules/:moduleId/quiz-edit',
        element: (
          <LearnerOnlyRoute>
            <EditQuizModulePage />
          </LearnerOnlyRoute>
        ),
      },
      { path: 'statistics', element: <StatisticsRoute /> },
      {
        path: 'settings',
        element: <Navigate to="/app" replace />,
      },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      {
        path: 'admin',
        element: (
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/modules',
        element: (
          <RequireAdmin>
            <AdminModulesPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/analytics',
        element: <Navigate to="/app/admin" replace />,
      },
      { path: '*', element: <NotFoundPage inService /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
