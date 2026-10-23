import { RegisterForm } from '@/features/auth-register';
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

describe('RegisterForm', () => {
  beforeEach(() => {
    resetAuthState();
    apiPost.mockReset();
  });

  it('не регистрирует пользователя, если пароли не совпали', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);
    await user.type(screen.getByLabelText('Name'), 'Ann');
    await user.type(screen.getByLabelText('Email'), 'ann@quizoo.test');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.type(screen.getByLabelText('Confirm password'), 'Password2!');
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passwords do not match',
    );
    expect(apiPost).not.toHaveBeenCalled();
  });
});
