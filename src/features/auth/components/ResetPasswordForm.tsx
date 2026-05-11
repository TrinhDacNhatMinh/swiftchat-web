import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useResetPassword } from '@/features/auth/hooks/useAuthMutations';
import styles from '@/features/auth/components/LoginForm.module.css';
import { ResetPasswordDto } from '@/features/auth/types';

import { useTranslation } from 'react-i18next';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/features/auth/schemas/auth.schema';

interface Props {
  token: string; // Passed from URL params in the page component
}

export function ResetPasswordForm({ token }: Props) {
  const { t } = useTranslation();
  const mutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: {
      token: token,
    }
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    const dto: ResetPasswordDto = {
      token: data.token,
      newPassword: data.newPassword,
    };
    mutation.mutate(dto);
  };

  if (mutation.isSuccess) {
    return (
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--secondary)' }}>check_circle</span>
        <h3 style={{ color: 'var(--on-surface)', marginTop: '1rem', fontSize: '18px' }}>Mật khẩu đã được thay đổi</h3>
        <a href="/login" className={styles.submitBtn} style={{ marginTop: '2rem', textDecoration: 'none' }}>
          Đến trang Đăng nhập
        </a>
      </div>
    );
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register('token')} />

      <div className={styles.inputGroup}>
        <div className={styles.labelContainer}>
          <label className={styles.label} htmlFor="newPassword">New Password</label>
        </div>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>lock</span>
          <input
            className={styles.input}
            id="newPassword"
            type="password"
            placeholder="••••••••"
            {...register('newPassword')}
          />
        </div>
        {errors.newPassword && <span className={styles.errorText}>{errors.newPassword.message}</span>}
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.labelContainer}>
          <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
        </div>
        <div className={styles.inputWrapper}>
          <span className={`material-symbols-outlined ${styles.icon}`}>lock_reset</span>
          <input
            className={styles.input}
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword.message}</span>}
      </div>

      <button 
        className={styles.submitBtn} 
        type="submit" 
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}
      </button>

      {mutation.isError && (
        <span className={styles.errorText} style={{ textAlign: 'center' }}>
          Lỗi: Token không hợp lệ hoặc đã hết hạn.
        </span>
      )}
    </form>
  );
};
