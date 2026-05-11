import { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslation } from 'react-i18next';
import { useVerifyEmail, useResendVerification } from '@/features/auth/hooks/useAuthMutations';
import styles from '@/features/auth/components/LoginForm.module.css';
import { getErrorMessage } from '@/shared/utils/errorMessages';

import { getOtpSchema, type OTPFormData } from '@/features/auth/schemas/auth.schema';

export function OTPVerifyForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(getOtpSchema(t)),
  });

  useEffect(() => {
    if (verifyMutation.isSuccess) {
      navigate('/chat', { 
        replace: true,
        state: { message: t('auth.verifyEmailSuccess') }
      });
    }
  }, [verifyMutation.isSuccess, navigate]);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = (data: OTPFormData) => {
    verifyMutation.mutate({ email, otp: data.otp });
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>pin</span>
          <input
            className={styles.input}
            id="otp"
            type="text"
            placeholder=" "
            maxLength={6}
            {...register('otp')}
          />
          <label className={styles.floatingLabel} htmlFor="otp">{t('auth.otpLabel')}</label>
          {errors.otp && <span className={styles.inlineErrorText}>{errors.otp.message as string}</span>}
        </div>
      </div>

      <button 
        className={styles.submitBtn} 
        type="submit" 
        disabled={verifyMutation.isPending}
      >
        {verifyMutation.isPending ? t('auth.verifying') : t('auth.verifyEmail')}
      </button>

      {verifyMutation.isError && (
        <span className={styles.errorText} style={{ textAlign: 'center', marginTop: '8px' }}>
          {getErrorMessage(verifyMutation.error) || t('auth.otpFailed')}
        </span>
      )}

      {resendMutation.isSuccess && (
        <span style={{ color: 'var(--secondary)', fontSize: '14px', textAlign: 'center', marginTop: '8px' }}>
          {t('auth.otpResentSuccess')}
        </span>
      )}

      {resendMutation.isError && (
        <span className={styles.errorText} style={{ textAlign: 'center', marginTop: '8px' }}>
          {getErrorMessage(resendMutation.error) || t('auth.otpResendFailed')}
        </span>
      )}

      {verifyMutation.isSuccess && (
        <span style={{ color: 'var(--secondary)', fontSize: '14px', textAlign: 'center', marginTop: '8px' }}>
          {t('auth.verifySuccessRedirecting')}
        </span>
      )}

      <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '1rem' }}>
        {t('auth.didntReceiveCode')}{' '}
        <button 
          type="button" 
          onClick={() => resendMutation.mutate({ email })} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
          disabled={resendMutation.isPending}
        >
          {resendMutation.isPending ? t('auth.sending') : t('auth.resend')}
        </button>
      </p>
    </form>
  );
};
