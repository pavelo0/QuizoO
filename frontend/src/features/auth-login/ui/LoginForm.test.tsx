import { LoginForm } from '@/features/auth-login';
import { resetAuthState } from '@/features/auth-session/model/authTestState';
import { apiPost } from '@/shared/test/apiMock';
import { renderWithProviders } from '@/shared/test/render';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth-session', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/auth-session')
  >('@/features/auth-session');
  const { authState } =
    await import('@/features/auth-session/model/authTestState');
  return {
    ...actual,
    useAuthContext: () => authState,
  };
});

vi.mock('@/shared/api/client', async () => {
  const { apiPost: post } = await import('@/shared/test/apiMock');
  return { apiClient: { post } };
});

describe('LoginForm', () => {
  beforeEach(() => {
    resetAuthState();
    apiPost.mockReset();
  });

  it('не отправляет запрос при пустой форме', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(apiPost).not.toHaveBeenCalled();
  });

  it('отправляет POST /auth/login с валидными данными', async () => {
    const user = userEvent.setup();
    apiPost.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'ann@quizoo.test',
        username: 'Ann',
        role: 'USER',
        isBlocked: false,
        emailVerified: true,
        avatarMime: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    });
    renderWithProviders(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'ann@quizoo.test');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(apiPost).toHaveBeenCalledWith('/auth/login', {
      email: 'ann@quizoo.test',
      password: 'Password1!',
      rememberMe: false,
    });
  });
});
