import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  
  console.log('=== INTERCEPTOR RUNNING ===');
  console.log('1. AuthService injected:', auth);
  console.log('2. AuthService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(auth)));
  
  const token = auth.getToken();
  console.log('3. Token from getToken():', token);
  console.log('4. Token type:', typeof token);
  console.log('5. Token truthy?:', !!token);

  if (token) {
    console.log('6. Token exists, cloning request with Authorization header');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('7. New request headers:', req.headers);
  } else {
    console.log('6. No token found');
  }

  return next(req);
};