import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },

  // Public voyage routes
  { path: 'voyages', loadComponent: () => import('./pages/voyage-list/voyage-list.component').then(m => m.VoyageListComponent) },
  { path: 'voyages/:id', loadComponent: () => import('./pages/voyage-detail/voyage-detail.component').then(m => m.VoyageDetailComponent) },

  // Admin-only voyage routes
  { path: 'voyages/nouveau', canActivate: [authGuard], loadComponent: () => import('./pages/voyage-form/voyage-form.component').then(m => m.VoyageFormComponent) },
  { path: 'voyages/:id/modifier', canActivate: [authGuard], loadComponent: () => import('./pages/voyage-form/voyage-form.component').then(m => m.VoyageFormComponent) },

  // Public destination routes (read-only)
  { path: 'destinations', loadComponent: () => import('./pages/destination-list/destination-list.component').then(m => m.DestinationListComponent) },

  // Admin-only destination routes
  { path: 'destinations/nouveau', canActivate: [authGuard], loadComponent: () => import('./pages/destination-form/destination-form.component').then(m => m.DestinationFormComponent) },
  { path: 'destinations/:id/modifier', canActivate: [authGuard], loadComponent: () => import('./pages/destination-form/destination-form.component').then(m => m.DestinationFormComponent) },

  // Admin auth & dashboard
  { path: 'admin/login', loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'admin/dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },

  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
