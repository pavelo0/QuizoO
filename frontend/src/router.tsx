import { LandingPage } from '@/pages/LandingPage';
import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import ServiceLayout from './layouts/ServiceLayout';
import CreateNewPage from './pages/CreateNewPage';
import DashboardPage from './pages/DashboardPage';
import InProgressPage from './pages/InProgressPage';
import LoginPage from './pages/LoginPage';
import ModulePage from './pages/ModulePage';
import RegisterPage from './pages/RegisterPage';
import ResultsPage from './pages/ResultsPage';
import StatsPage from './pages/StatsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: 'service',
    element: <ServiceLayout />,
    children: [
      {
        path: 'modules',
        element: <DashboardPage />,
        children: [
          {
            path: ':id',
            element: <ModulePage />,
            children: [
              { path: 'in-progress', element: <InProgressPage /> },
              {
                path: 'results',
                element: <ResultsPage />,
              },
            ],
          },
          {
            path: 'new',
            element: <CreateNewPage />,
          },
        ],
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
    ],
  },
]);
