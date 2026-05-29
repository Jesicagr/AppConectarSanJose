import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DashboardActivity {
  title: string;
  place: string;
  category: string;
  categoryIcon: string;
  date: string;
  status: string;
  statusTone: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [FormsModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  searchTerm = '';
  selectedCategory = '';

  metrics = [
    { label: 'Actividades Totales', value: '124', icon: 'confirmation_number', tone: 'primary', detail: 'Nuevos registros este mes', change: '+12%' },
    { label: 'En Revisión', value: '18', icon: 'history_edu', tone: 'warning', detail: 'Requieren validación técnica', badge: 'Pendientes' },
    { label: 'Usuarios Activos', value: '3.2k', icon: 'group', tone: 'success', detail: 'Crecimiento semanal estable', change: '+5%' },
  ];

  categories = [
    { label: 'Mujer', icon: 'assets/mujer.webp', tone: 'danger' },
    { label: 'Niñez', icon: 'assets/ninez.webp', tone: 'warning' },
    { label: 'Personas Mayores', icon: 'assets/mayores.webp', tone: 'muted' },
    { label: 'Desarrollo Comunitario', icon: 'assets/comunidad.webp', tone: 'primary' },
    { label: 'Discapacidad', icon: 'assets/discapacidad.webp', tone: 'primary' },
    { label: 'Salud', icon: 'assets/salud.webp', tone: 'success' },
    { label: 'Trabajo', icon: 'assets/trabajo.webp', tone: 'warning' },
    { label: 'Deportes', icon: 'assets/deportes.webp', tone: 'success' },
    { label: 'Turismo', icon: 'assets/turismo.webp', tone: 'primary' },
    { label: 'Cultura', icon: 'assets/cultura.webp', tone: 'warning' },
    { label: 'Educación', icon: 'assets/educacion.webp', tone: 'primary' },
  ];

  activities: DashboardActivity[] = [
    { title: 'Taller de Inclusión Laboral', place: 'Parque Metropolitano', category: 'Discapacidad', categoryIcon: 'accessible', date: '15 Oct, 2024', status: 'Confirmada', statusTone: 'success' },
    { title: 'Jornada de Salud Preventiva', place: 'Clínica Central', category: 'Salud', categoryIcon: 'monitor_heart', date: '22 Oct, 2024', status: 'En Revisión', statusTone: 'warning' },
    { title: 'Festival Cultural Juvenil', place: 'Plaza de la Cultura', category: 'Niñez', categoryIcon: 'child_care', date: '05 Nov, 2024', status: 'Confirmada', statusTone: 'success' },
    { title: 'Charla: Emprendedurismo Femenino', place: 'Casa de la Cultura', category: 'Mujer', categoryIcon: 'female', date: '18 Oct, 2024', status: 'En Revisión', statusTone: 'warning' },
    { title: 'Caminata Histórica', place: 'Oficina de Turismo', category: 'Turismo', categoryIcon: 'travel_explore', date: '28 Oct, 2024', status: 'Confirmada', statusTone: 'success' },
  ];

  get filteredActivities(): DashboardActivity[] {
    const query = this.normalize(this.searchTerm);

    return this.activities.filter((activity) => {
      const matchesCategory = !this.selectedCategory || activity.category === this.selectedCategory;
      const searchable = this.normalize(`${activity.title} ${activity.place} ${activity.category} ${activity.status}`);
      const matchesSearch = !query || searchable.includes(query);

      return matchesCategory && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
