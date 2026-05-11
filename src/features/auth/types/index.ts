export interface RegisterDto {
  email: string;
  password?: string;
  username: string;
}

export interface LoginDto {
  username: string;
  password?: string;
}

export interface GoogleAuthDto {
  idToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
