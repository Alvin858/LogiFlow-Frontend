import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';

let refreshing = false;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(TokenStorageService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = storage.getAccessToken();
  const authRequest = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 ||
          request.url.includes('/api/auth/login') || request.url.includes('/api/auth/refresh-token') ||
          request.url.includes('/api/auth/logout') || refreshing || !storage.getRefreshToken()) {
        return throwError(() => error);
      }

      refreshing = true;
      return auth.refreshToken().pipe(
        switchMap(response => {
          refreshing = false;
          const retry = request.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } });
          return next(retry);
        }),
        catchError(refreshError => {
          refreshing = false;
          storage.clear();
          void router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
