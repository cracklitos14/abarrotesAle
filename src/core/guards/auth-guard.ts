import { CanActivateFn, CanActivateChildFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { AlertService } from '../services/alert';

const checkAccess = (route?: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const alertService = inject(AlertService);

  // 1️ Sesión
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 2️Rol (solo si hay data)
  const allowedRoles = route?.data?.['roles'];
  const userRole = authService.getRole();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    alertService.show(
      'No tienes permisos para acceder a este apartado',
      'error'
    );
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn = (route) => checkAccess(route);
export const authChildGuard: CanActivateChildFn = (childRoute) =>
  checkAccess(childRoute);