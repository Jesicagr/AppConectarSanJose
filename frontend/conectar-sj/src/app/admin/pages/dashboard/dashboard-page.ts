import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActividadService } from '../../../services/actividad.service';
import { AreaService, Area } from '../../../services/area.service';
import { VisitaService } from '../../../services/visita.service';
import { getAreaTone, sortByAreaOrder, WEBP_MAP } from '../../../shared/area-tones';

interface DashboardActivity {
  title: string;
  place: string;
  category: string;
  categoryIcon: string;
  date: string;
  status: string;
  statusTone: string;
}

interface CategoryFilter {
  label: string;
  icon: string;
  tone: string;
}



@Component({
  selector: 'app-dashboard-page',
  imports: [FormsModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  private actividadService = inject(ActividadService);
  private areaService = inject(AreaService);
  private visitaService = inject(VisitaService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm = '';
  selectedCategory = '';

  metrics = [
    { label: 'Actividades Totales', value: '0', icon: 'confirmation_number', tone: 'primary', detail: 'Cargando...', change: '' },
    { label: 'En Revisión', value: '0', icon: 'history_edu', tone: 'warning', detail: 'Requieren validación técnica', badge: 'Pendientes' },
    { label: 'Visitas Hoy', value: '0', icon: 'visibility', tone: 'success', detail: 'Cargando...', change: '' },
  ];

  categories: CategoryFilter[] = [];
  private areaToneMap: Record<string, string> = {};

  activities: DashboardActivity[] = [];

  ngOnInit(): void {
    this.visitaService.obtenerStats().subscribe({
      next: (s) => {
        this.metrics[2].value = String(s.hoy);
        this.metrics[2].detail = `${s.total} visitas totales · ${s.semana} esta semana`;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
    this.areaService.obtenerTodas().subscribe({
      next: (areas) => {
        const sorted = sortByAreaOrder(areas);
        this.areaToneMap = {};
        sorted.forEach((a, i) => {
            this.areaToneMap[a.nombre] = getAreaTone(a.nombre, i);
        });
        this.cargarActividades();
      },
      error: () => this.cargarActividades(),
    });
  }

  private cargarActividades(): void {
    this.actividadService.obtenerTodas().subscribe({
      next: (acts) => {
        this.activities = acts.map((a: any) => {
          const primaryArea = (a.areas && a.areas.length > 0) ? a.areas[0] : null;
          return {
            title: a.titulo,
            place: a.sede ? a.sede.nombre : 'Sin Sede',
            category: primaryArea ? primaryArea.nombre : 'Sin Área',
            categoryIcon: primaryArea ? primaryArea.icono : 'help',
            date: a.fechaInicio || '',
            status: a.status || 'Confirmado',
            statusTone: a.statusTone || 'success',
          };
        });

        this.metrics[0].value = String(this.activities.length);
        this.metrics[0].detail = 'Actividades registradas';

        const uniqueCats = [...new Set(this.activities.map((a) => a.category).filter(Boolean))];
        this.categories = uniqueCats.map((cat, i) => ({
          label: cat,
          icon: WEBP_MAP[cat] || 'assets/comunidad.webp',
            tone: this.areaToneMap[cat] || getAreaTone(cat, i),
        }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar actividades', err),
    });
  }

  categoryTone(category: string): string {
    return this.areaToneMap[category] || 'surface-variant';
  }

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
