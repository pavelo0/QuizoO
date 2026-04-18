import { RedirectIfSignedIn } from '@/components/auth/RedirectIfSignedIn';
import { RequireAuth } from '@/components/auth/RequireAuth';
import type { DataRouter } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import LandingLayout from './layouts/LandingLayout';
import ServiceLayout from './layouts/ServiceLayout';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
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
    element: (
      <RedirectIfSignedIn>
        <AuthLayout />
      </RedirectIfSignedIn>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
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
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
]);
