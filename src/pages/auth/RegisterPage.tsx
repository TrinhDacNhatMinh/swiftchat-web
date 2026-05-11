import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm, GoogleLoginButton } from '@/features/auth/components';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Join SwiftChat today."
    >
      <RegisterForm />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(65, 71, 84, 0.3)' }} />
        <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>
          Or sign up with
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(65, 71, 84, 0.3)' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <GoogleLoginButton />
      </div>

      <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: '15px', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>
        Already have an account?{' '}
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
