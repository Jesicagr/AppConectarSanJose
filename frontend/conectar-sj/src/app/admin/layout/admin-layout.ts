import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  sidebarOpen = false;
  toast$ = inject(ToastService).toast$;

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Actividades', icon: 'calendar_today', route: '/admin/activities' },
    { label: 'Sedes', icon: 'location_on', route: '/admin/sedes' },
    { label: 'Áreas', icon: 'apartment', route: '/admin/areas' },
    { label: 'Contactos', icon: 'contacts', route: '/admin/contactos' },
  ];

  openSidebar(): void {
    this.sidebarOpen = true;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  private toastService = inject(ToastService);
  hideToast(): void {
    this.toastService.hide();
  }
}
