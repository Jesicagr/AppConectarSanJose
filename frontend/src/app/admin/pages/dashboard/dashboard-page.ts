import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActividadService } from '../../../services/actividad.service';
import { AreaService } from '../../../services/area.service';
import { VisitaService } from '../../../services/visita.service';
import { InstagramService, CuentaInstagram } from '../../../services/instagram.service';

import { getAreaTone, sortByAreaOrder, WEBP_MAP } from '../../../shared/area-tones';
import { DateFormatPipe } from '../../../shared/date-format.pipe';
import { ToastService } from '../../../shared/toast.service';
import { LoggerService } from '../../../shared/logger.service';
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
  visitas: number;
}

interface Metric {
  label: string;
  value: string;
  icon: string;
  tone: string;
  detail: string;
  change?: string;
  badge?: string;
}

interface CategoryFilter {
  label: string;
  icon: string;
  tone: string;
  count: number;
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
  private instagramService = inject(InstagramService);
  private toast = inject(ToastService);
  private logger = inject(LoggerService);

  loading = signal(true);
  metrics = signal<Metric[]>([
    { label: 'Actividades', value: '—', icon: 'calendar_today', tone: 'primary', detail: '' },
    { label: 'Sedes', value: '—', icon: 'location_on', tone: 'warning', detail: '' },
    { label: 'Visitas', value: '—', icon: 'visibility', tone: 'success', detail: '' },
  ]);
  categories = signal<CategoryFilter[]>([]);
  activities = signal<DashboardActivity[]>([]);
  selectedCategory = signal('');
  searchTerm = signal('');
  filteredActivities = computed(() => {
    const list = this.activities();
    const cat = this.selectedCategory();
    const query = this.normalize(this.searchTerm());
    return list.filter(a => {
      const matchesCategory = !cat || a.categories.includes(cat);
      const searchable = this.normalize(`${a.title} ${a.place} ${a.categories.join(' ')} ${a.status}`);
      const matchesSearch = !query || searchable.includes(query);
      return matchesCategory && matchesSearch;
    });
  });
  menuOpenIndex = signal<number | null>(null);
  modalOpen = signal(false);
  modalData = signal<ActividadModalData | null>(null);
  modalViewMode = signal(false);

  private areaToneMap: Record<string, string> = {};
  instagramCuentas = signal<CuentaInstagram[]>([]);
  instagramEditando = signal<Record<number, string>>({});

  get instagramSlots() {
    return this.instagramCuentas().filter(c => c.activo);
  }

  get displayedVisitas() {
    return this.activities().filter(a => a.visitas > 0).sort((a, b) => b.visitas - a.visitas);
  }

  private buildInstagramEditMap(cuentas: CuentaInstagram[]): Record<number, string> {
    const map: Record<number, string> = {};
    cuentas.forEach(c => { map[c.id] = c.username; });
    return map;
  }

  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Panel — Conectar San José');
    this.areaService.obtenerTodas().subscribe({
      next: (areas) => {
        const sorted = sortByAreaOrder(areas);
        this.areaToneMap = {};
        this.categories.set(sorted.map((a, i) => {
          this.areaToneMap[a.nombre] = getAreaTone(a.nombre, i);
          return {
            label: a.nombre,
            icon: WEBP_MAP[a.nombre] || 'assets/comunidad.webp',
            tone: getAreaTone(a.nombre, i),
            count: 0,
          };
        }));

        this.cargarActividades();
      },
      error: () => this.cargarActividades(),
    });
  }

  private cargarActividades(): void {
    this.actividadService.contar().subscribe({
      next: (res) => {
        this.metrics.update(m => {
          m[0].value = String(res.total);
          m[0].detail = 'Actividades registradas';
          return [...m];
        });
      },
      error: () => {}
    });
    this.visitaService.obtenerStats().subscribe({
      next: (stats) => {
        this.metrics.update(m => {
          m[2].value = stats.total.toLocaleString();
          m[2].detail = `${stats.hoy} hoy · ${stats.semana} esta semana`;
          return [...m];
        });
      },
      error: () => {}
    });
    this.actividadService.obtenerPaginadas(0, 100).subscribe({
      next: (page) => {
        const mapped = page.content.map((a: any) => ({
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
          visitas: 0,
        }));
        this.activities.set(mapped);

        const countMap: Record<string, number> = {};
        for (const a of mapped) {
          for (const cat of a.categories) {
            countMap[cat] = (countMap[cat] || 0) + 1;
          }
        }
        this.categories.update(cats => cats.map(c => ({ ...c, count: countMap[c.label] || 0 })));

        const enRevision = mapped.filter(a => a.status === 'En Revisión').length;
        this.metrics.update(m => {
          m[1].value = String(enRevision);
          return [...m];
        });

        this.visitaService.visitasPorActividad().subscribe({
          next: (visitasMap) => {
            this.activities.update(list => list.map(a => ({ ...a, visitas: visitasMap[a.id] || 0 })));
          },
          error: () => {}
        });

        this.loading.set(false);
      },
      error: (err) => {
        this.logger.error('Error al cargar actividades', err);
        this.loading.set(false);
      },
    });
    this.cargarInstagram();
  }

  categoryTone(category: string): string {
    return this.areaToneMap[category] || 'surface-variant';
  }

  selectCategory(category: string): void {
    this.selectedCategory.update(c => c === category ? '' : category);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
  }

  toggleMenu(index: number): void {
    this.menuOpenIndex.update(i => i === index ? null : index);
  }

  closeMenu(): void {
    this.menuOpenIndex.set(null);
  }

  viewActivity(activity: DashboardActivity): void {
    this.closeMenu();
    this.modalData.set({
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
      status: activity.status,
    });
    this.modalViewMode.set(true);
    this.modalOpen.set(true);
  }

  editActivity(activity: DashboardActivity): void {
    this.closeMenu();
    this.modalData.set({
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
    });
    this.modalViewMode.set(false);
    this.modalOpen.set(true);
  }

  onModalSaved(): void {
    this.modalOpen.set(false);
    this.modalData.set(null);
    this.modalViewMode.set(false);
    this.cargarActividades();
  }

  onModalClosed(): void {
    this.modalOpen.set(false);
    this.modalData.set(null);
    this.modalViewMode.set(false);
  }

  deleteActivity(activity: DashboardActivity): void {
    this.closeMenu();
    if (!confirm(`¿Eliminar la actividad "${activity.title}"?`)) return;
    this.toast.show('Eliminando actividad…', 'info');
    this.actividadService.eliminar(activity.id).subscribe({
      next: () => {
        this.activities.update(list => list.filter(a => a.id !== activity.id));
        this.toast.show('Actividad eliminada con éxito', 'success');
      },
      error: (err) => {
        this.logger.error('Error al eliminar actividad:', err);
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

  private cargarInstagram(): void {
    this.instagramService.obtenerCuentas().subscribe({
      next: (cuentas) => {
        this.instagramCuentas.set(cuentas);
        this.instagramEditando.set(this.buildInstagramEditMap(cuentas));
      },
      error: () => {},
    });
  }

  onInstagramInput(cuenta: CuentaInstagram, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.instagramEditando.update(m => {
      m[cuenta.id] = value;
      return m;
    });
  }

  guardarInstagram(cuenta: CuentaInstagram): void {
    const nuevo = this.instagramEditando()[cuenta.id]?.trim();
    if (!nuevo || nuevo === cuenta.username) return;
    this.instagramService.actualizarCuenta(cuenta.id, nuevo).subscribe({
      next: () => {
        this.cargarInstagram();
        this.toast.show(`Cuenta actualizada a @${nuevo}`, 'success');
      },
      error: (err) => {
        this.toast.show(err.error?.error || 'Error al actualizar', 'error');
        this.cargarInstagram();
      },
    });
  }

  toggleActivo(cuenta: CuentaInstagram): void {
    this.instagramService.actualizarCuenta(cuenta.id, undefined, !cuenta.activo).subscribe({
      next: () => {
        this.cargarInstagram();
        this.toast.show(cuenta.activo ? 'Cuenta desactivada' : 'Cuenta activada', 'success');
      },
      error: () => {
        this.toast.show('Error al cambiar estado', 'error');
      },
    });
  }

  refrescarInstagram(username: string): void {
    if (username === 'todas') {
      this.instagramService.refrescarTodas().subscribe({
        next: () => this.toast.show('Refrescando todas las cuentas…', 'info'),
        error: () => this.toast.show('Error al refrescar', 'error'),
      });
      return;
    }
    this.instagramService.refrescarCuenta(username).subscribe({
      next: () => this.toast.show(`Refrescando @${username}…`, 'info'),
      error: () => this.toast.show('Error al refrescar', 'error'),
    });
  }
}
