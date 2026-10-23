import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithI18n(ui: ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

export function renderWithProviders(ui: ReactElement, route = '/') {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </I18nProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
