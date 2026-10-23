import { RedirectIfSignedIn } from '@/features/auth-guard/ui/RedirectIfSignedIn';
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

function renderLanding() {
  return renderWithI18n(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/app" element={<p>learner home</p>} />
        <Route path="/app/admin" element={<p>admin home</p>} />
        <Route
          path="/"
          element={
            <RedirectIfSignedIn>
              <p>landing</p>
            </RedirectIfSignedIn>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RedirectIfSignedIn', () => {
  beforeEach(() => {
    resetAuthState();
  });

  it('оставляет гостя на странице', () => {
    renderLanding();
    expect(screen.getByText('landing')).toBeInTheDocument();
  });

  it('уводит пользователя в кабинет, а админа в панель', () => {
    authState.user = publicUser('USER');
    renderLanding();
    expect(screen.getByText('learner home')).toBeInTheDocument();
  });

  it('уводит администратора в панель', () => {
    authState.user = publicUser('ADMIN');
    renderLanding();
    expect(screen.getByText('admin home')).toBeInTheDocument();
  });
});
