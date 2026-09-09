export interface RegisterRequest {
  firstName: string; lastName: string; email: string; password: string;
  phoneNumber?: string | null; companyName?: string | null;
}
export interface LoginRequest { email: string; password: string; }
export interface RefreshTokenRequest { refreshToken: string; }
export interface LogoutRequest { refreshToken: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { email: string; resetToken: string; newPassword: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }

export interface UserResponse {
  id: number; firstName: string; lastName: string; email: string;
  phoneNumber: string | null; role: string; isActive: boolean;
}
export interface AuthResponse {
  accessToken: string; refreshToken: string;
  accessTokenExpiresAtUtc: string; user: UserResponse;
}
export interface ForgotPasswordResponse { message: string; resetToken?: string | null; }
export interface MessageResponse { message: string; }
