import { GuestOnlyOutlet } from '@/components/auth/GuestOnlyOutlet';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { RedirectIfSignedIn } from '@/components/auth/RedirectIfSignedIn';
import { RequireAuth } from '@/components/auth/RequireAuth';
import type { DataRouter } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import LandingLayout from './layouts/LandingLayout';
import ServiceLayout from './layouts/ServiceLayout';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
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
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import StatisticsPage from './pages/statistics';
import SettingsPage from './pages/SettingsPage';

export const router: DataRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <RedirectIfSignedIn>
        <LandingLayout />
      </RedirectIfSignedIn>
    ),
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
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
    element: (
      <RequireAuth>
        <ServiceLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'modules/create', element: <CreateModulePage /> },
      { path: 'modules/:moduleId/edit', element: <EditFlashcardModulePage /> },
      {
        path: 'modules/:moduleId/flash-study',
        element: <FlashcardStudyPage />,
      },
      { path: 'modules/:moduleId/quiz-study', element: <QuizStudyPage /> },
      { path: 'modules/:moduleId/quiz-edit', element: <EditQuizModulePage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
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
        element: (
          <RequireAdmin>
            <AdminAnalyticsPage />
          </RequireAdmin>
        ),
      },
      { path: '*', element: <NotFoundPage inService /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
