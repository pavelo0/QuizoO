import { AuthProvider } from '@/auth/AuthContext';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { store } from '@/store/store';
import { ThemeProvider } from '@/shared/ui/theme/ThemeProvider';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <Provider store={store}>
            {children}
            <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
          </Provider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
