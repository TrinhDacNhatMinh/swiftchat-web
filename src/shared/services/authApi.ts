import { axiosInstance } from '@/shared/lib/axios';
import { ApiResponse } from '@/shared/types/api';
import {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  TokenPair,
} from '@/features/auth/types';

export const authApi = {
  register: async (dto: RegisterDto) => {
    const response = await axiosInstance.post<ApiResponse<null>>('/auth/register', dto);
    return response.data;
  },

  login: async (dto: LoginDto) => {
    const response = await axiosInstance.post<ApiResponse<TokenPair>>('/auth/login', dto);
    return response.data;
  },

  googleAuth: async (dto: GoogleAuthDto) => {
    const response = await axiosInstance.post<ApiResponse<TokenPair>>('/auth/google', dto);
    return response.data;
  },

  refreshToken: async (dto: RefreshTokenDto) => {
    const response = await axiosInstance.post<ApiResponse<TokenPair>>('/auth/refresh-token', dto);
    return response.data;
  },

  forgotPassword: async (dto: ForgotPasswordDto) => {
    const response = await axiosInstance.post<ApiResponse<null>>('/auth/forgot-password', dto);
    return response.data;
  },

  resetPassword: async (dto: ResetPasswordDto) => {
    const response = await axiosInstance.post<ApiResponse<null>>('/auth/reset-password', dto);
    return response.data;
  },

  verifyEmail: async (dto: VerifyEmailDto) => {
    const response = await axiosInstance.post<ApiResponse<TokenPair>>('/auth/verify-email', dto);
    return response.data;
  },

  resendVerification: async (dto: { email: string }) => {
    const response = await axiosInstance.post<ApiResponse<null>>('/auth/resend-verification', dto);
    return response.data;
  },

  logout: async (dto: RefreshTokenDto) => {
    const response = await axiosInstance.post<ApiResponse<null>>('/auth/logout', dto);
    return response.data;
  },
};
