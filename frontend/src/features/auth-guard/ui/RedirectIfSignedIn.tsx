import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/auth/AuthContext';
import { getHomeRouteForUser } from '@/lib/authRoute';
import { AuthLoadingState } from './AuthLoadingState';

type Props = {
  children: ReactNode;
  /** Where to send signed-in users (default: app home). */
  to?: string;
};

/**
 * For guest-only areas (landing, login/register). Signed-in users are redirected away.
 */
export function RedirectIfSignedIn({ children, to }: Props) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <AuthLoadingState />;
  }

  if (user) {
    return <Navigate to={to ?? getHomeRouteForUser(user)} replace />;
  }

  return <>{children}</>;
}
