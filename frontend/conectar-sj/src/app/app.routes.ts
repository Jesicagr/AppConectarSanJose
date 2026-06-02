import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./login/login-page').then(m => m.LoginPage) 
  },

  {
    path: 'admin',
    loadComponent: () => import('./admin/layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./admin/pages/dashboard/dashboard-page').then(m => m.DashboardPage) 
      },
      { 
        path: 'sedes', 
        loadComponent: () => import('./admin/pages/sedes/sedes-page').then(m => m.SedesPage) 
      },
      { 
        path: 'activities', 
        loadComponent: () => import('./admin/pages/activities/activities-page').then(m => m.ActivitiesPage) 
      },
      { 
        path: 'areas', 
        loadComponent: () => import('./admin/pages/areas/areas-page').then(m => m.AreasPage) 
      },
      { 
        path: 'contactos', 
        loadComponent: () => import('./admin/pages/contacts/contacts-page').then(m => m.ContactsPage) 
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];