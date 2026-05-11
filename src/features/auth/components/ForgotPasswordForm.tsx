import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForgotPassword } from '@/features/auth/hooks/useAuthMutations';
import styles from '@/features/auth/components/LoginForm.module.css';

import { useTranslation } from 'react-i18next';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas/auth.schema';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const mutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema(t)),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return (
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--secondary)' }}>mark_email_read</span>
        <h3 style={{ color: 'var(--on-surface)', marginTop: '1rem', fontSize: '18px' }}>Kiểm tra Email</h3>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
          Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
        </p>
        <a href="/login" className={styles.submitBtn} style={{ marginTop: '2rem', textDecoration: 'none' }}>
          Quay lại Đăng nhập
        </a>
      </div>
    );
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.inputGroup}>
        <div className={styles.labelContainer}>
          <label className={styles.label} htmlFor="email">Registered Email</label>
        </div>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>mail</span>
          <input
            className={styles.input}
            id="email"
            type="email"
            placeholder="name@company.com"
            {...register('email')}
          />
        </div>
        {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
      </div>

      <button 
        className={styles.submitBtn} 
        type="submit" 
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Sending...' : 'Gửi Yêu Cầu'}
      </button>

      {mutation.isError && (
        <span className={styles.errorText} style={{ textAlign: 'center' }}>
          Lỗi: Không thể gửi email đặt lại mật khẩu.
        </span>
      )}
    </form>
  );
};
