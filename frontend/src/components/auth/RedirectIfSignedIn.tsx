import { useAuth } from '@clerk/react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLoadingState } from './AuthLoadingState';

type Props = {
  children: ReactNode;
  /** Where to send signed-in users (default: app home). */
  to?: string;
};

/**
 * For guest-only areas (landing, login/register). Signed-in users are redirected away.
 */
export function RedirectIfSignedIn({ children, to = '/app' }: Props) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingState />;
  }

  if (isSignedIn) {
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}
