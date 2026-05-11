import { z } from 'zod';
import { TFunction } from 'i18next';

// Export type helpers if needed
type TFunc = TFunction<"translation", undefined>;

export const createLoginSchema = (t: TFunc | ((key: string) => string)) => z.object({
  username: z.string().min(1, t('auth.usernameRequired')),
  password: z.string().min(1, t('auth.passwordRequired')),
});

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export const getRegisterSchema = (t: TFunc | ((key: string) => string)) => z.object({
  email: z.string().min(1, t('auth.emailRequired')).email(t('auth.invalidEmail')),
  password: z.string().min(6, t('auth.passwordMinLength')),
  confirmPassword: z.string().min(6, t('auth.confirmPasswordRequired')),
  username: z.string().min(3, t('auth.usernameMinLength')),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.passwordsDoNotMatch'), // this will not work with dynamic t() perfectly inside refine at module scope if not careful, but since it returns a schema, it's fine.
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<ReturnType<typeof getRegisterSchema>>;

export const forgotPasswordSchema = (t: TFunc | ((key: string) => string)) => z.object({
  email: z.string().min(1, t('auth.emailRequired')).email(t('auth.emailInvalid')),
});

export type ForgotPasswordFormData = z.infer<ReturnType<typeof forgotPasswordSchema>>;

export const resetPasswordSchema = (t: TFunc | ((key: string) => string)) => z.object({
  token: z.string().min(1, t('auth.tokenRequired') || 'Token is required'),
  newPassword: z.string().min(6, t('auth.passwordMin') || 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, t('auth.confirmPasswordRequired') || 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('auth.passwordsDoNotMatch') || "Passwords don't match",
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<ReturnType<typeof resetPasswordSchema>>;

export const getOtpSchema = (t: TFunc | ((key: string) => string)) => z.object({
  otp: z.string().length(6, t('auth.otpLength')),
});

export type OTPFormData = z.infer<ReturnType<typeof getOtpSchema>>;
