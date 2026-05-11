import { type ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styles from '@/features/auth/components/AuthLayout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.layoutContainer}>
      {/* Left Pane: Brand Visual (50%) */}
      <div className={styles.leftPane}>
        <div 
          className={styles.bgImage} 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')` }}
        />
        <div className={styles.gradientOverlay} />
        
        <div className={styles.brandHeader}>
          <div className={styles.logoIcon}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          </div>
          <span className={styles.brandName}>SwiftChat</span>
        </div>

        <div className={styles.taglineBox}>
          <h1 className={styles.taglineTitle}>
            <Trans i18nKey="auth.taglineTitle">
              Talk fast.<br/>Stay close.
            </Trans>
          </h1>
          <p className={styles.taglineDesc}>
            {t('auth.taglineDesc')}
          </p>
          <div className={styles.systemStatus}>
            <div className={styles.pulseDot} />
            <span className={styles.statusText}>{t('auth.systemOperational')}</span>
          </div>
        </div>
      </div>

      {/* Right Pane: Dynamic Form (50%) */}
      <div className={styles.rightPane}>
        <div className={styles.rightPaneBgDeco} />
        

        
        <div className={styles.formWrapper}>
          <div className={styles.mobileHeader}>
            <div className={styles.mobileLogoIcon}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
            <span className={styles.brandName}>SwiftChat</span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
              {title}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'var(--on-surface-variant)', minHeight: '45px' }}>
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
