import { useRef, useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useGoogleAuth } from '@/features/auth/hooks/useAuthMutations';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';
import { getErrorMessage } from '@/shared/utils/errorMessages';

export function GoogleLoginButton() {
  const googleMutation = useGoogleAuth();
  const { i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Limit max width to 400px per Google's spec
        const newWidth = Math.min(Math.floor(entry.contentRect.width), 400);
        
        // Only update if difference is more than 10px to prevent flicker
        setButtonWidth((prev) => {
          if (prev === undefined || Math.abs(prev - newWidth) > 10) {
            return newWidth;
          }
          return prev;
        });
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <GoogleOAuthProvider 
      key={i18n.language} 
      clientId={env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id_for_now'}
      locale={i18n.language}
    >
      <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '8px' }}>
        {buttonWidth !== undefined && (
          <GoogleLogin
            key={buttonWidth} // Force remount to ensure Google re-renders cleanly
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                googleMutation.mutate({ idToken: credentialResponse.credential });
              }
            }}
            onError={() => {
              console.error('Google Login Failed');
            }}
            useOneTap={false}
            theme="filled_black" // Matches the dark theme nicely
            shape="pill"
            width={buttonWidth.toString()}
            text="continue_with"
          />
        )}
        {googleMutation.isError && (
          <span style={{ color: 'var(--error, #f44336)', fontSize: '13px', textAlign: 'center' }}>
            {getErrorMessage(googleMutation.error)}
          </span>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

