import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm, GoogleLoginButton } from '@/features/auth/components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout 
      title={t('auth.loginTitle')} 
      subtitle={t('auth.enterDetails')}
    >
      <LoginForm />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(65, 71, 84, 0.3)' }} />
        <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>
          {t('auth.orContinueWith')}
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(65, 71, 84, 0.3)' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <GoogleLoginButton />
      </div>

      <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: '15px', color: 'var(--on-surface-variant)', marginTop: '1.5rem' }}>
        {t('auth.dontHaveAccount')}{' '}
        <Link 
          to="/register" 
          style={{ color: 'var(--on-surface)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
        >
          {t('auth.signUp')}
        </Link>
      </p>
    </AuthLayout>
  );
};
