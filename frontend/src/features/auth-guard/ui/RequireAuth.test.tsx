import {
  publicUser,
  resetAuthState,
  authState,
} from '@/features/auth-session/model/authTestState';
import { RequireAuth } from '@/features/auth-guard/ui/RequireAuth';
import { renderWithI18n } from '@/shared/test/render';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/features/auth-session', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/auth-session')
  >('@/features/auth-session');
  const state = await import('@/features/auth-session/model/authTestState');
  return {
    ...actual,
    useAuthContext: () => state.authState,
  };
});

function renderAtSecret() {
  return renderWithI18n(
    <MemoryRouter initialEntries={['/app/secret']}>
      <Routes>
        <Route path="/auth/login" element={<p>login page</p>} />
        <Route
          path="/app/secret"
          element={
            <RequireAuth>
              <p>secret</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    resetAuthState();
  });

  it('показывает загрузку', () => {
    authState.loading = true;
    renderAtSecret();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('отправляет гостя на вход', () => {
    renderAtSecret();
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('показывает страницу авторизованному пользователю', () => {
    authState.user = publicUser('USER');
    renderAtSecret();
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
