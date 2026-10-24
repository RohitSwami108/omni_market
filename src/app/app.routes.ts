import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard/products'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth-portal.component').then(m => m.AuthPortalComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/auth-portal.component').then(m => m.AuthPortalComponent)
  },
  {
    path: 'dashboard/products',
    loadComponent: () => import('./features/products/product-catalog.component').then(m => m.ProductCatalogComponent)
  },
  {
    path: 'dashboard/security',
    loadComponent: () => import('./features/security/security-matrix.component').then(m => m.SecurityMatrixComponent)
  },
  {
    path: 'dashboard/logs',
    loadComponent: () => import('./features/logs/activity-logs.component').then(m => m.ActivityLogsComponent)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/fallback/error-pages.component').then(m => m.ErrorPagesComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/fallback/error-pages.component').then(m => m.ErrorPagesComponent)
  }
];
