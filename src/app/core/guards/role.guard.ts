import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const user = inject(AuthService).currentUser();
  const router = inject(Router);
  if (!user) return router.createUrlTree(['/auth/login']);
  return roles.includes(user.role) ? true : router.createUrlTree(['/auth/access-denied']);
};
