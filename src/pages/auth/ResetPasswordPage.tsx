import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/components';
import { useSearchParams } from 'react-router-dom';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Please enter your new password below."
    >
      {!token ? (
        <div style={{ textAlign: 'center', color: 'var(--error, #ffb4ab)' }}>
          Lỗi: Không tìm thấy token xác thực. Vui lòng kiểm tra lại link trong email.
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthLayout>
  );
};
