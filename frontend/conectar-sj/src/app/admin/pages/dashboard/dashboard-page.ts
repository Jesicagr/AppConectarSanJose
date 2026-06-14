import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActividadService } from '../../../services/actividad.service';
import { AreaService, Area } from '../../../services/area.service';
import { VisitaService } from '../../../services/visita.service';
import { getAreaTone, sortByAreaOrder, WEBP_MAP } from '../../../shared/area-tones';
import { DateFormatPipe } from '../../../shared/date-format.pipe';
import { ToastService } from '../../../shared/toast.service';
import { ActividadModalComponent, ActividadModalData } from '../../shared/actividad-modal/actividad-modal.component';

interface DashboardActivity {
  id: number;
  title: string;
  place: string;
  categories: string[];
  categoryIcons: string[];
  date: string;
  endDate?: string;
  status: string;
  statusTone: string;
  telefono?: string;
}

interface CategoryFilter {
  label: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [FormsModule, DateFormatPipe, ActividadModalComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  private actividadService = inject(ActividadService);
  private areaService = inject(AreaService);
  private visitaService = inject(VisitaService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  loading = true;
  searchTerm = '';
  selectedCategory = '';
  menuOpenIndex: number | null = null;
  modalOpen = false;
  modalViewMode = false;
  modalData?: ActividadModalData | null = null;

  metrics = [
    { label: 'Actividades Totales', value: '0', icon: 'confirmation_number', tone: 'primary', detail: 'Cargando...', change: '' },
    { label: 'En Revisión', value: '0', icon: 'history_edu', tone: 'warning', detail: 'Requieren validación técnica', badge: 'Pendientes' },
    { label: 'Visitas Hoy', value: '0', icon: 'visibility', tone: 'success', detail: 'Cargando...', change: '' },
  ];

  categories: CategoryFilter[] = [];
  private areaToneMap: Record<string, string> = {};

  activities: DashboardActivity[] = [];

  ngOnInit(): void {
    forkJoin({
      visitStats: this.visitaService.obtenerStats(),
      areas: this.areaService.obtenerTodas(),
    }).subscribe({
      next: ({ visitStats, areas }) => {
        this.metrics[2].value = String(visitStats.hoy);
        this.metrics[2].detail = `${visitStats.total} visitas totales · ${visitStats.semana} esta semana`;

        const sorted = sortByAreaOrder(areas);
        this.areaToneMap = {};
        this.categories = sorted.map((a, i) => ({
          label: a.nombre,
          icon: WEBP_MAP[a.nombre] || 'assets/comunidad.webp',
          tone: getAreaTone(a.nombre, i),
        }));
        sorted.forEach((a, i) => {
          this.areaToneMap[a.nombre] = getAreaTone(a.nombre, i);
        });

        this.cargarActividades();
      },
      error: () => this.cargarActividades(),
    });
  }

  private cargarActividades(): void {
    this.actividadService.contar().subscribe({
      next: (res) => {
        this.metrics[0].value = String(res.total);
        this.metrics[0].detail = 'Actividades registradas';
      },
      error: () => {}
    });
    this.actividadService.obtenerPaginadas(0, 100).subscribe({
      next: (page) => {
        this.activities = page.content.map((a: any) => ({
          id: a.id,
          title: a.titulo,
          place: a.sedeNombre || 'Sin Sede',
          categories: a.areaNombres?.length ? a.areaNombres : ['Sin Área'],
          categoryIcons: a.areaIconos?.length ? a.areaIconos : ['help'],
          date: a.fechaInicio || '',
          endDate: a.fechaFin || '',
          status: a.status || 'Confirmado',
          statusTone: 'success',
          telefono: a.telefono || '',
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar actividades', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  categoryTone(category: string): string {
    return this.areaToneMap[category] || 'surface-variant';
  }

  get filteredActivities(): DashboardActivity[] {
    const query = this.normalize(this.searchTerm);

    return this.activities.filter((activity) => {
      const matchesCategory = !this.selectedCategory || activity.categories.includes(this.selectedCategory);
      const searchable = this.normalize(`${activity.title} ${activity.place} ${activity.categories.join(' ')} ${activity.status}`);
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

  toggleMenu(index: number): void {
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  closeMenu(): void {
    this.menuOpenIndex = null;
  }

  viewActivity(activity: DashboardActivity): void {
    this.closeMenu();
    this.modalData = {
      id: activity.id,
      title: activity.title,
      category: activity.categories[0],
      categoryIcon: activity.categoryIcons[0],
      categories: activity.categories,
      categoryIcons: activity.categoryIcons,
      date: activity.date,
      endDate: activity.endDate,
      location: activity.place,
      telefono: activity.telefono,
    };
    this.modalViewMode = true;
    this.modalOpen = true;
  }

  editActivity(activity: DashboardActivity): void {
    this.closeMenu();
    this.modalData = {
      id: activity.id,
      title: activity.title,
      category: activity.categories[0],
      categoryIcon: activity.categoryIcons[0],
      categories: activity.categories,
      categoryIcons: activity.categoryIcons,
      date: activity.date,
      endDate: activity.endDate,
      location: activity.place,
      telefono: activity.telefono,
    };
    this.modalViewMode = false;
    this.modalOpen = true;
  }

  onModalSaved(): void {
    this.modalOpen = false;
    this.modalData = null;
    this.modalViewMode = false;
    this.cargarActividades();
  }

  onModalClosed(): void {
    this.modalOpen = false;
    this.modalData = null;
    this.modalViewMode = false;
  }

  deleteActivity(activity: DashboardActivity): void {
    this.closeMenu();
    if (!confirm(`¿Eliminar la actividad "${activity.title}"?`)) return;
    this.toast.show('Eliminando actividad…', 'info');
    this.actividadService.eliminar(activity.id).subscribe({
      next: () => {
        this.activities = this.activities.filter((a) => a.id !== activity.id);
        this.toast.show('Actividad eliminada con éxito', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar actividad:', err);
        this.toast.show('Error al eliminar la actividad', 'error');
      },
    });
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
