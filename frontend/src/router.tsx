import type { DataRouter } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import LandingLayout from './layouts/LandingLayout';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';

export const router: DataRouter = createBrowserRouter([
  {
    path: '/',
    element: <LandingLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/app',
    element: <AuthLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
]);
