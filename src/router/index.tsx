import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/router/ProtectedRoute';
import { useAuthStore } from '@/stores/auth.store';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OTPVerifyPage } from '@/pages/auth/OTPVerifyPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ChatPage } from '@/pages/chat/ChatPage';

import type React from 'react';

// GuestRoute wrapper to prevent logged-in users from accessing auth pages
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <ChatPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: '/register',
    element: <GuestRoute><RegisterPage /></GuestRoute>,
  },
  {
    path: '/verify-email',
    element: <GuestRoute><OTPVerifyPage /></GuestRoute>,
  },
  {
    path: '/forgot-password',
    element: <GuestRoute><ForgotPasswordPage /></GuestRoute>,
  },
  {
    path: '/reset-password',
    element: <GuestRoute><ResetPasswordPage /></GuestRoute>,
  },
]);
