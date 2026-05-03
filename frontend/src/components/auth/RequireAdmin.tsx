import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/auth/AuthContext';
import { getHomeRouteForUser } from '@/lib/authRoute';
import { AuthLoadingState } from './AuthLoadingState';

type RequireAdminProps = {
  children: ReactNode;
};

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <AuthLoadingState />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to={getHomeRouteForUser(user)} replace />;
  }

  return <>{children}</>;
}
