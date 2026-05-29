import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  sidebarOpen = false;

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Actividades', icon: 'calendar_today', route: '/admin/actividades' },
    { label: 'Sedes', icon: 'location_on', route: '/admin/sedes' },
    { label: 'Áreas', icon: 'apartment', route: '/admin/areas' },
    { label: 'Contactos', icon: 'contacts', route: '/admin/contactos' },
    { label: 'Ajustes', icon: 'settings', route: '/admin/ajustes' },
  ];

  openSidebar(): void {
    this.sidebarOpen = true;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
