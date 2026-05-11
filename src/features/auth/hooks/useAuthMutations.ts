import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/shared/services/authApi';
import { useAuthStore } from '@/stores/auth.store';
import { axiosInstance } from '@/shared/lib/axios';
import {
  LoginDto,
  RegisterDto,
  GoogleAuthDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@/features/auth/types';
import type { AuthState } from '@/stores/auth.store';

const fetchAndSetUser = async (
  accessToken: string,
  refreshToken: string,
  setAuth: AuthState['setAuth'],
  setTokens: AuthState['setTokens'],
) => {
  // Lưu token trước để axiosInstance có thể dùng khi gọi /users/me
  setTokens(accessToken, refreshToken);
  try {
    const res = await axiosInstance.get('/users/me');
    const user = res.data?.data || res.data;
    if (user) {
      setAuth(user, accessToken, refreshToken);
    }
  } catch {
    // Nếu không lấy được user thì vẫn giữ token để ProtectedRoute hoạt động
    setTokens(accessToken, refreshToken);
  }
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: async (response: any) => {
      const tokens = response.data || response;
      if (tokens && tokens.accessToken) {
        await fetchAndSetUser(tokens.accessToken, tokens.refreshToken, setAuth, setTokens);
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    // onSuccess or onError will be handled by components (e.g. to navigate to OTP page)
  });
};

export const useGoogleAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (dto: GoogleAuthDto) => authApi.googleAuth(dto),
    onSuccess: async (response: any) => {
      const tokens = response.data || response;
      if (tokens && tokens.accessToken) {
        await fetchAndSetUser(tokens.accessToken, tokens.refreshToken, setAuth, setTokens);
      }
    },
  });
};

export const useVerifyEmail = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (dto: VerifyEmailDto) => authApi.verifyEmail(dto),
    onSuccess: async (response: any) => {
      const tokens = response.data || response;
      if (tokens && tokens.accessToken) {
        await fetchAndSetUser(tokens.accessToken, tokens.refreshToken, setAuth, setTokens);
      }
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (dto: { email: string }) => authApi.resendVerification(dto),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => authApi.forgotPassword(dto),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => authApi.resetPassword(dto),
  });
};
