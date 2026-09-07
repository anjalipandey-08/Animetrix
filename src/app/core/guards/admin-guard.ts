import {
  CanActivateFn,
  Router
} from '@angular/router';

import { inject } from '@angular/core';

import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = async () => {

  const auth = inject(Auth);
  const router = inject(Router);

  const isAdmin =
    await auth.isAdmin();

  if (isAdmin) {
    return true;
  }

  return router.createUrlTree(['/login']);
};