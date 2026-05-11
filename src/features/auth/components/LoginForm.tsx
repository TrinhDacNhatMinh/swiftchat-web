import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslation } from 'react-i18next';
import { useLogin } from '@/features/auth/hooks/useAuthMutations';
import styles from '@/features/auth/components/LoginForm.module.css';
import { getErrorMessage } from '@/shared/utils/errorMessages';

import { createLoginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schema';

export function LoginForm() {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  // Schema created once per language change, not every render
  const loginSchema = createLoginSchema(t);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const usernameValue = watch('username');
  const passwordValue = watch('password');

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>person</span>
          <input
            className={styles.input}
            id="username"
            type="text"
            placeholder=" "
            {...register('username')}
          />
          <label className={styles.floatingLabel} htmlFor="username">{t('auth.username')}</label>
          {errors.username && <span className={styles.inlineErrorText}>{errors.username.message}</span>}
        </div>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>lock</span>
          <input
            className={styles.input}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder=" "
            {...register('password')}
          />
          <label className={styles.floatingLabel} htmlFor="password">{t('auth.password')}</label>
          {passwordValue && passwordValue.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
              style={{ zIndex: 10 }}
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          )}
          {errors.password && usernameValue && usernameValue.length > 0 && (
            <span className={styles.inlineErrorText}>{errors.password.message}</span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1.3rem' }}>
          <a href="/forgot-password" className={styles.forgotLink}>{t('auth.forgotPassword')}</a>
        </div>
      </div>

      <button 
        className={styles.submitBtn} 
        type="submit" 
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? t('auth.signingIn') : t('auth.login')}
        {!loginMutation.isPending && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
      </button>

      {loginMutation.isError && (
        <span className={styles.errorText} style={{ textAlign: 'center' }}>
          {getErrorMessage(loginMutation.error)}
        </span>
      )}
    </form>
  );
};
