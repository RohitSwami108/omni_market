import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = 'https://localhost:7237';
  const authService = inject(AuthService);
  const token = authService.token();

  const formattedUrl = req.url.startsWith('http')
    ? req.url
    : `${baseUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;

  let clonedRequest = req.clone({
    url: formattedUrl
  });

  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(clonedRequest);
};
