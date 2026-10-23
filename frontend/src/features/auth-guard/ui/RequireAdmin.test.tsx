import { RequireAdmin } from '@/features/auth-guard/ui/RequireAdmin';
import {
  authState,
  publicUser,
  resetAuthState,
} from '@/features/auth-session/model/authTestState';
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

function renderAtAdmin() {
  return renderWithI18n(
    <MemoryRouter initialEntries={['/app/admin/users']}>
      <Routes>
        <Route path="/auth/login" element={<p>login page</p>} />
        <Route path="/app" element={<p>learner home</p>} />
        <Route
          path="/app/admin/users"
          element={
            <RequireAdmin>
              <p>admin users</p>
            </RequireAdmin>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAdmin', () => {
  beforeEach(() => {
    resetAuthState();
  });

  it('отправляет гостя на вход', () => {
    renderAtAdmin();
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('уводит обычного пользователя в кабинет', () => {
    authState.user = publicUser('USER');
    renderAtAdmin();
    expect(screen.getByText('learner home')).toBeInTheDocument();
  });

  it('показывает раздел администратору', () => {
    authState.user = publicUser('ADMIN');
    renderAtAdmin();
    expect(screen.getByText('admin users')).toBeInTheDocument();
  });
});
