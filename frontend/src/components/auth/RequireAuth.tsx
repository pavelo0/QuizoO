import { useAuth } from '@clerk/react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthLoadingState } from './AuthLoadingState';

type Props = { children: ReactNode };

export function RequireAuth({ children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <AuthLoadingState />;
  }

  if (!isSignedIn) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
}
