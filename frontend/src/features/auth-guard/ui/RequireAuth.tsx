import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/auth/AuthContext';
import { AuthLoadingState } from './AuthLoadingState';

type Props = { children: ReactNode };

export function RequireAuth({ children }: Props) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingState />;
  }

  if (!user) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}
