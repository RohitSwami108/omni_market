import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = 'https://localhost:7237';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  let targetUrl = req.url;
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    if (req.url.startsWith('/api/')) {
      targetUrl = `${baseUrl}${req.url}`;
    } else if (req.url.startsWith('api/')) {
      targetUrl = `${baseUrl}/${req.url}`;
    } else {
      targetUrl = `${baseUrl}/api/${req.url.replace(/^\/+/, '')}`;
    }
  }

  let clonedRequest = req.clone({ url: targetUrl });

  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest);
};
