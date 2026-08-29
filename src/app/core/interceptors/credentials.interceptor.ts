import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // A 401 mid-session means the token was rejected (expired or invalid).
      // Don't force-logout on the login request itself.
      if (err.status === 401 && !req.url.includes('/account/login')) {
        auth.forceLogout();
      }
      return throwError(() => err);
    })
  );
};
