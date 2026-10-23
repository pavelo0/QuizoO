import { z } from 'zod';

const rememberSchema = z.preprocess(
  (v: unknown) => v === true || v === 'on',
  z.boolean(),
);

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email');

/** One non-letter, non-digit (any common symbol allowed; not only @$!%*?&). */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: rememberSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Name is too short')
      .max(100, 'Name is too long'),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    remember: rememberSchema,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordEmailSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordEmailValues = z.infer<
  typeof forgotPasswordEmailSchema
>;

export const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

/** Пустая строка (после trim) → сброс display name на сервере (null). */
export const profileDisplayNameSchema = z.object({
  displayName: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.union([
      z.literal(''),
      z
        .string()
        .min(3, 'Display name is too short')
        .max(80, 'Display name is too long'),
    ]),
  ),
});

export type ProfileDisplayNameValues = z.infer<typeof profileDisplayNameSchema>;

export const profileChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });

export type ProfileChangePasswordValues = z.infer<
  typeof profileChangePasswordSchema
>;

export const profileChangeEmailSchema = z.object({
  newEmail: emailSchema,
  currentPassword: z.string().min(1, 'Current password is required'),
});

export type ProfileChangeEmailValues = z.infer<typeof profileChangeEmailSchema>;
