import { AuthProvider } from '@/features/auth-session';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { ThemeProvider } from '@/shared/ui/theme/ThemeProvider';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
