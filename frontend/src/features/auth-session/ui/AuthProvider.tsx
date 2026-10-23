import {
  resetSessionExpiredNotification,
  setSessionExpiredHandler,
} from '@/shared/api/client';
import { fetchCurrentUser, type ApiPublicUser } from '@/entities/user';
import { useI18n } from '@/shared/i18n/useI18n';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';

type AuthContextValue = {
  user: ApiPublicUser | null;
  loading: boolean;
  refresh: () => Promise<ApiPublicUser | null>;
  signOutLocal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiPublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<ApiPublicUser | null>(null);
  const { t } = useI18n();

  const refresh = useCallback(async () => {
    try {
      const data = await fetchCurrentUser();
      setUser(data);
      resetSessionExpiredNotification();
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const signOutLocal = useCallback(() => {
    userRef.current = null;
    setUser(null);
    resetSessionExpiredNotification();
  }, []);

  useEffect(() => {
    userRef.current = user;
    if (user) {
      resetSessionExpiredNotification();
    }
  }, [user]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      if (!userRef.current) {
        return false;
      }

      userRef.current = null;
      setUser(null);
      toast.error(t('auth.sessionExpired'));
      return true;
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchCurrentUser();
        if (!cancelled) {
          setUser(data);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, signOutLocal }),
    [user, loading, refresh, signOutLocal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
