import { describe, expect, it } from 'vitest';
import { fieldErrorsFromZod } from '@/shared/lib/zodFieldErrors';
import {
  forgotPasswordEmailSchema,
  loginSchema,
  profileChangeEmailSchema,
  profileChangePasswordSchema,
  profileDisplayNameSchema,
  registerSchema,
} from './authSchemas';

const validPassword = 'Password1!';

describe('auth schemas', () => {
  it('принимает вход с remember как checkbox', () => {
    expect(
      loginSchema.safeParse({
        email: '  Ann@Quizoo.test ',
        password: validPassword,
        remember: 'on',
      }).success,
    ).toBe(true);
  });

  it('требует email, регистр, цифру и символ в пароле', () => {
    const empty = loginSchema.safeParse({
      email: '  ',
      password: 'short',
      remember: false,
    });
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(fieldErrorsFromZod(empty.error)).toMatchObject({
        email: 'Email is required',
        password: 'Password must be at least 8 characters',
      });
    }

    expect(
      loginSchema.safeParse({
        email: 'ann@quizoo.test',
        password: 'password1!',
        remember: false,
      }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({
        email: 'ann@quizoo.test',
        password: 'Password!',
        remember: false,
      }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({
        email: 'not-an-email',
        password: validPassword,
        remember: true,
      }).success,
    ).toBe(false);
  });

  it('сверяет подтверждение пароля при регистрации', () => {
    const mismatch = registerSchema.safeParse({
      name: 'Ann',
      email: 'ann@quizoo.test',
      password: validPassword,
      passwordConfirm: 'Password2!',
      remember: false,
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(fieldErrorsFromZod(mismatch.error).passwordConfirm).toBe(
        'Passwords do not match',
      );
    }
    expect(
      registerSchema.safeParse({
        name: 'Ab',
        email: 'ann@quizoo.test',
        password: validPassword,
        passwordConfirm: validPassword,
        remember: false,
      }).success,
    ).toBe(false);
  });

  it('проверяет почту для сброса, имя профиля и смену пароля', () => {
    expect(forgotPasswordEmailSchema.safeParse({ email: '' }).success).toBe(
      false,
    );
    expect(
      profileDisplayNameSchema.safeParse({ displayName: '  ' }).success,
    ).toBe(true);
    expect(
      profileDisplayNameSchema.safeParse({ displayName: 'Ann' }).success,
    ).toBe(true);
    expect(
      profileDisplayNameSchema.safeParse({ displayName: 'ab' }).success,
    ).toBe(false);

    const same = profileChangePasswordSchema.safeParse({
      currentPassword: validPassword,
      newPassword: validPassword,
      passwordConfirm: validPassword,
    });
    expect(same.success).toBe(false);

    expect(
      profileChangeEmailSchema.safeParse({
        newEmail: 'next@quizoo.test',
        currentPassword: '',
      }).success,
    ).toBe(false);
    expect(
      profileChangeEmailSchema.safeParse({
        newEmail: 'next@quizoo.test',
        currentPassword: 'secret',
      }).success,
    ).toBe(true);
  });
});
