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
const passwordSchema = z
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
