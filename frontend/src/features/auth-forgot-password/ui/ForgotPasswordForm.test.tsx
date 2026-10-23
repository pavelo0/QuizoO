import { ForgotPasswordForm } from '@/features/auth-forgot-password';
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

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    resetAuthState();
    apiPost.mockReset();
  });

  it('не отправляет код на пустой email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);
    await user.click(screen.getByRole('button', { name: 'Send reset code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email is required',
    );
    expect(apiPost).not.toHaveBeenCalled();
  });
});
