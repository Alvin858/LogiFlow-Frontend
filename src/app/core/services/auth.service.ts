import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, throwError } from 'rxjs';

import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse
} from '../models/auth.models';

import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorageService);

  private readonly base = '/api/auth';

  // -----------------------------
  // LOGIN
  // -----------------------------
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, request)
      .pipe(
        tap(response => {
          this.storage.saveAuth(response);
        })
      );
  }

  // -----------------------------
  // REGISTER
  // -----------------------------
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, request)
      .pipe(
        tap(response => {
          this.storage.saveAuth(response);
        })
      );
  }

  // -----------------------------
  // REFRESH TOKEN
  // -----------------------------
  refreshToken(): Observable<AuthResponse> {

    const refreshToken = this.storage.getRefreshToken();

    // Prevent sending null to the backend
    if (!refreshToken) {
      this.storage.clear();

      return throwError(() => new Error('Refresh token not found.'));
    }

    const request: RefreshTokenRequest = {
      refreshToken: refreshToken
    };

    return this.http
      .post<AuthResponse>(
        `${this.base}/refresh-token`,
        request
      )
      .pipe(
        tap(response => {
          this.storage.saveTokens(response);
        })
      );
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  logout(): Observable<void> {

    const refreshToken = this.storage.getRefreshToken();

    // If there is no refresh token,
    // simply clear local authentication data.
    if (!refreshToken) {
      this.storage.clear();

      return of(void 0);
    }

    const request: LogoutRequest = {
      refreshToken: refreshToken
    };

    return this.http
      .post<void>(
        `${this.base}/logout`,
        request
      )
      .pipe(
        tap(() => {
          this.storage.clear();
        })
      );
  }

  // -----------------------------
  // FORGOT PASSWORD
  // -----------------------------
  forgotPassword(
    request: ForgotPasswordRequest
  ): Observable<ForgotPasswordResponse> {

    return this.http.post<ForgotPasswordResponse>(
      `${this.base}/forgot-password`,
      request
    );
  }

  // -----------------------------
  // RESET PASSWORD
  // -----------------------------
  resetPassword(
    request: ResetPasswordRequest
  ): Observable<MessageResponse> {

    return this.http.post<MessageResponse>(
      `${this.base}/reset-password`,
      request
    );
  }

  // -----------------------------
  // CHANGE PASSWORD
  // -----------------------------
  changePassword(
    request: ChangePasswordRequest
  ): Observable<MessageResponse> {

    return this.http.post<MessageResponse>(
      `${this.base}/change-password`,
      request
    );
  }

  // -----------------------------
  // CURRENT USER
  // -----------------------------
  me(): Observable<UserResponse> {

    return this.http.get<UserResponse>(
      `${this.base}/me`
    );
  }

  // -----------------------------
  // GET STORED USER
  // -----------------------------
  currentUser(): UserResponse | null {

    return this.storage.getUser();
  }

  // -----------------------------
  // CHECK LOGIN STATUS
  // -----------------------------
  isLoggedIn(): boolean {

    return this.storage.isAuthenticated();
  }
}