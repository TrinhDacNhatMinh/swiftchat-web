import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegister } from '@/features/auth/hooks/useAuthMutations';
import styles from '@/features/auth/components/LoginForm.module.css';
import { getErrorMessage } from '@/shared/utils/errorMessages';

import { getRegisterSchema, type RegisterFormData } from '@/features/auth/schemas/auth.schema';

export function RegisterForm() {
  const { t } = useTranslation();
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(getRegisterSchema(t)),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        navigate('/verify-email', { state: { email: data.email } });
      },
      onError: (error) => {
        const message = getErrorMessage(error);
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('email already in use') || lowerMessage.includes('email đã được sử dụng')) {
          setError('email', { type: 'server', message: t('auth.emailAlreadyInUse') });
        } else if (lowerMessage.includes('username already taken') || lowerMessage.includes('tên đăng nhập đã tồn tại')) {
          setError('username', { type: 'server', message: t('auth.usernameAlreadyTaken') });
        }
      }
    });
  };

  const isGenericError = registerMutation.isError && (() => {
    const msg = getErrorMessage(registerMutation.error).toLowerCase();
    return !msg.includes('email already in use') && 
           !msg.includes('email đã được sử dụng') &&
           !msg.includes('username already taken') && 
           !msg.includes('tên đăng nhập đã tồn tại');
  })();

  return (
    <form className={`${styles.container} ${styles.compactContainer}`} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>mail</span>
          <input
            className={styles.input}
            id="email"
            type="email"
            placeholder=" "
            {...register('email')}
          />
          <label className={styles.floatingLabel} htmlFor="email">{t('auth.emailAddress')}</label>
          {errors.email && <span className={styles.inlineErrorText}>{errors.email.message as string}</span>}
        </div>
      </div>

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
          {errors.username && <span className={styles.inlineErrorText}>{errors.username.message as string}</span>}
        </div>
      </div>


      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>lock</span>
          <input
            className={styles.input}
            id="password"
            type="password"
            placeholder=" "
            {...register('password')}
          />
          <label className={styles.floatingLabel} htmlFor="password">{t('auth.password')}</label>
          {errors.password && <span className={styles.inlineErrorText}>{errors.password.message as string}</span>}
        </div>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>lock_reset</span>
          <input
            className={styles.input}
            id="confirmPassword"
            type="password"
            placeholder=" "
            {...register('confirmPassword')}
          />
          <label className={styles.floatingLabel} htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
          {errors.confirmPassword && <span className={styles.inlineErrorText}>{errors.confirmPassword.message as string}</span>}
        </div>
      </div>

      <button 
        className={styles.submitBtn} 
        type="submit" 
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? t('auth.signingUp') : t('auth.signUp')}
        {!registerMutation.isPending && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
      </button>

      {isGenericError && (
        <span className={styles.errorText} style={{ textAlign: 'center' }}>
          {getErrorMessage(registerMutation.error) || t('auth.signUpFailed')}
        </span>
      )}
      
      {registerMutation.isSuccess && (
        <span style={{ color: 'var(--secondary)', fontSize: '14px', textAlign: 'center' }}>
          {t('auth.signUpSuccess')}
        </span>
      )}
    </form>
  );
};
