import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ActivityStatus = 'Confirmado' | 'En Revisión' | 'Cancelado';

interface Activity {
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  categoryTone: string;
  date: string;
  time: string;
  location: string;
  status: ActivityStatus;
  statusTone: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-activities-page',
  imports: [FormsModule],
  templateUrl: './activities-page.html',
  styleUrl: './activities-page.css',
})
export class ActivitiesPage {
  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';

  categories = [
    { label: 'Mujer', icon: 'assets/mujer.webp', tone: 'rose' },
    { label: 'Niñez', icon: 'assets/ninez.webp', tone: 'amber' },
    { label: 'Mayores', icon: 'assets/mayores.webp', tone: 'indigo' },
    { label: 'Comunidad', icon: 'assets/comunidad.webp', tone: 'emerald' },
    { label: 'Discapacidad', icon: 'assets/discapacidad.webp', tone: 'blue' },
    { label: 'Salud', icon: 'assets/salud.webp', tone: 'red' },
    { label: 'Trabajo', icon: 'assets/trabajo.webp', tone: 'cyan' },
    { label: 'Deportes', icon: 'assets/deportes.webp', tone: 'orange' },
    { label: 'Turismo', icon: 'assets/turismo.webp', tone: 'purple' },
    { label: 'Cultura', icon: 'assets/cultura.webp', tone: 'teal' },
    { label: 'Educación', icon: 'assets/educacion.webp', tone: 'amber' },
  ];

  activities: Activity[] = [
    {
      title: 'Taller de Juegos Tradicionales',
      description: 'Actividad lúdica para recuperar juegos clásicos.',
      category: 'Niñez',
      categoryIcon: 'child_care',
      categoryTone: 'amber',
      date: '15 Oct 2024',
      time: '14:00 - 16:30',
      location: 'Plaza Mitre',
      status: 'Confirmado',
      statusTone: 'success',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBaUAXsuWi40pCFe8haHijdbM5dJPCN7CSBy8TWZV_q2cjvkF8mfzzoR-n3hDKoUfLnBM1QNnh8OHBZmBzaOWiobjdBdYIRUjLT2ka4JmD732m4uV0uggkvzKFUbXnbIb8Xi6Ip0I5YvQmmD6Rq35uq-X_Ztg69NG5UyzHkdf6kz9SXwO54NpPAF8FDIavSG0oqfpv_09BBIP6vwfFZxyo-Y4LBUsOFovPH7o2Qmuot__KDJEpYd461Gmdhm21LmDBsJ3VVErM1Bz-M',
    },
    {
      title: 'Charla: Emprendedurismo Femenino',
      description: 'Herramientas financieras y de gestión.',
      category: 'Mujer',
      categoryIcon: 'female',
      categoryTone: 'rose',
      date: '18 Oct 2024',
      time: '18:00 - 20:00',
      location: 'Casa de la Cultura',
      status: 'En Revisión',
      statusTone: 'warning',
    },
    {
      title: 'Yoga al Aire Libre',
      description: 'Clases gratuitas para todas las edades.',
      category: 'Salud',
      categoryIcon: 'health_and_safety',
      categoryTone: 'red',
      date: '20 Oct 2024',
      time: '09:00 - 10:30',
      location: 'Parque Evita',
      status: 'Cancelado',
      statusTone: 'danger',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBxjJ-YyFboaSFlFdFJ8hSfH23Ym_QnqHmhX-h7nvHfh0X9dNHeEcFoxiL730wey_EZGSkhdx-GbxaRmKpFrgfm0tA6mXEHgzTJFBlXY9VssDKWQyzJLb1CUXppO88Vch_tpJApoqwhsMv-fGPagB8kGSPp1mojV8F0INzoCLI_oPzuTjeRfnq_vZKH3vD76v6bnENMBKOxk8wHJ1zlROnKzgRG4K5R9nqGo9EYyzt7QnWqzc7VTQ9yjljex1xWg12k3WocCdg_omXr',
    },
    {
      title: 'Taller de Inclusión Laboral',
      description: 'Capacitación para mejorar oportunidades de empleo.',
      category: 'Discapacidad',
      categoryIcon: 'accessible',
      categoryTone: 'blue',
      date: '23 Oct 2024',
      time: '10:00 - 12:00',
      location: 'Centro Integrador Comunitario',
      status: 'Confirmado',
      statusTone: 'success',
    },
    {
      title: 'Caminata Histórica',
      description: 'Recorrido guiado por espacios patrimoniales.',
      category: 'Turismo',
      categoryIcon: 'hiking',
      categoryTone: 'purple',
      date: '28 Oct 2024',
      time: '16:00 - 18:00',
      location: 'Oficina de Turismo',
      status: 'En Revisión',
      statusTone: 'warning',
    },
  ];

  get filteredActivities(): Activity[] {
    const query = this.normalize(this.searchTerm);

    return this.activities.filter((activity) => {
      const matchesCategory = !this.selectedCategory || activity.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || activity.status === this.selectedStatus;
      const searchable = this.normalize(
        `${activity.title} ${activity.description} ${activity.location} ${activity.category} ${activity.status}`,
      );
      const matchesSearch = !query || searchable.includes(query);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
