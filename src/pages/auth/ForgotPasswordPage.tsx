import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  return (
    <AuthLayout 
      title="Forgot Password" 
      subtitle="Enter your email to receive a reset link."
    >
      <ForgotPasswordForm />
      
      <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: '15px', color: 'var(--on-surface-variant)', marginTop: '2.5rem' }}>
        Remembered your password?{' '}
        <Link 
          to="/login" 
          style={{ color: 'var(--on-surface)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
