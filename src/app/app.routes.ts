import { Routes } from '@angular/router';
import { authGuard, authChildGuard } from '../core/guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('../features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: '',
    loadComponent: () =>
      import('../shared/layout/layout.component')
        .then(m => m.LayoutComponent),
    children: [

      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../features/dashboard/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'sale',
        canActivate: [authGuard],
        data: { roles: ['Administrador', 'Encargado de Caja'] },
        loadComponent: () =>
          import('../features/sales/sale/sale')
            .then(m => m.SaleComponent)
      },

      {
        path: 'products',
        canActivate: [authGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () =>
          import('../features/products/product-list/product-list')
            .then(m => m.ProductListComponent)
      },
        {
        path: 'categories',
        canActivate: [authGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () =>
          import('../features/categories/categories/categories')
            .then(m => m.CategoriesComponent)
      }
      ,
        {
        path: 'box',
        canActivate: [authGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () =>
          import('../features/box/box/box')
            .then(m => m.BoxComponent)
      }
      ,
        {
        path: 'reports',
        canActivate: [authGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () =>
          import('../features/reports/reports/reports')
            .then(m => m.ReportesComponent)
      }
    ]
  }
];