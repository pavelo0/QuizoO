import { GuestOnlyOutlet } from '@/components/auth/GuestOnlyOutlet';
import { RedirectIfSignedIn } from '@/components/auth/RedirectIfSignedIn';
import { RequireAuth } from '@/components/auth/RequireAuth';
import type { DataRouter } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import LandingLayout from './layouts/LandingLayout';
import ServiceLayout from './layouts/ServiceLayout';
import CreateModulePage from './pages/CreateModulePage';
import EditFlashcardModulePage from './pages/EditFlashcardModulePage';
import EditQuizModulePage from './pages/EditQuizModulePage';
import FlashcardStudyPage from './pages/FlashcardStudyPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
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
      { path: 'modules/:moduleId/quiz-edit', element: <EditQuizModulePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
]);
