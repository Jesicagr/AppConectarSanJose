import { Routes } from '@angular/router';
import { AdminLayout } from './admin/layout/admin-layout';
import { ActivitiesPage } from './admin/pages/activities/activities-page';
import { DashboardPage } from './admin/pages/dashboard/dashboard-page';
import { AreasPage } from './admin/pages/areas/areas-page';
import { ContactsPage } from './admin/pages/contacts/contacts-page';
import { SedesPage } from './admin/pages/sedes/sedes-page';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'actividades', component: ActivitiesPage },
      { path: 'sedes', component: SedesPage },
      { path: 'areas', component: AreasPage },
      { path: 'contactos', component: ContactsPage },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  { path: '**', redirectTo: 'admin/dashboard' },
];
