import { Injectable } from '@angular/core';
import { AuthResponse, UserResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly accessKey = 'logiflow_access_token';
  private readonly refreshKey = 'logiflow_refresh_token';
  private readonly userKey = 'logiflow_user';

  saveAuth(response: AuthResponse): void {
    localStorage.setItem(this.accessKey, response.accessToken);
    localStorage.setItem(this.refreshKey, response.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }
  getAccessToken(): string | null { return localStorage.getItem(this.accessKey); }
  getRefreshToken(): string | null { return localStorage.getItem(this.refreshKey); }
  getUser(): UserResponse | null {
    const value = localStorage.getItem(this.userKey);
    if (!value) return null;
    try { return JSON.parse(value) as UserResponse; } catch { return null; }
  }
  saveTokens(response: AuthResponse): void { this.saveAuth(response); }
  clear(): void {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
  }
  isAuthenticated(): boolean { return !!this.getAccessToken(); }
}
