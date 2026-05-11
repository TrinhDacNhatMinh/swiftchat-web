import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { OTPVerifyForm } from '@/features/auth/components';

export function OTPVerifyPage() {
  return (
    <AuthLayout 
      title="Verify your email" 
      subtitle="We've sent a 6-digit code to your email."
    >
      <OTPVerifyForm />
    </AuthLayout>
  );
};
