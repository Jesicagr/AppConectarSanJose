import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActividadService, ActividadPayload } from '../../../services/actividad.service';
import { SedeService, Sede } from '../../../services/sede.service';
import { AreaService, Area } from '../../../services/area.service';
import { VisitaService } from '../../../services/visita.service';
import { getAreaTone, sortByAreaOrder } from '../../../shared/area-tones';
import { ToastService } from '../../../shared/toast.service';

type ActivityStatus = 'Confirmado' | 'En Revisión' | 'Cancelado';

interface Activity {
  id?: number;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  date: string;
  time: string;
  location: string;
  status: ActivityStatus;
  statusTone: string;
  imageUrl?: string;
  visitas?: number;
}

@Component({
  selector: 'app-activities-page',
  imports: [FormsModule],
  templateUrl: './activities-page.html',
  styleUrl: './activities-page.css',
})
export class ActivitiesPage implements OnInit {
  private actividadService = inject(ActividadService);
  private sedeService = inject(SedeService);
  private areaService = inject(AreaService);
  private visitaService = inject(VisitaService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  loading = true;
  sedesBackend: Sede[] = [];
  areasBackend: Area[] = [];

  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';

  categories: any[] = [];

  activities: Activity[] = [];

  ngOnInit(): void {
    this.sedeService.obtenerTodas().subscribe({
      next: sedes => { this.sedesBackend = sedes; this.cdr.detectChanges(); },
      error: err => console.error('Error al cargar sedes en activities:', err)
    });
    this.areaService.obtenerTodas().subscribe({
      next: areas => {
        const sorted = sortByAreaOrder(areas);
        this.areasBackend = sorted;
        this.categories = sorted.map((a, i) => ({
          id: a.id,
          label: a.nombre,
          icon: a.icono || 'assets/comunidad.webp',
          tone: getAreaTone(a.nombre, i)
        }));
        this.cdr.detectChanges();
      },
      error: err => console.error('Error al cargar areas en activities:', err)
    });
    this.cargarActividades();
  }

  cargarActividades(): void {
    this.actividadService.obtenerTodas().subscribe({
      next: acts => {
        this.activities = acts.map(a => {
          const primaryArea = (a.areas && a.areas.length > 0) ? a.areas[0] : null;
          return {
            id: a.id,
            title: a.titulo,
            description: a.descripcion || a.descripcion_corta || 'Sin descripción',
            category: primaryArea ? primaryArea.nombre : 'Sin Área',
            categoryIcon: primaryArea ? primaryArea.icono : 'assets/comunidad.webp',
            date: a.fechaInicio || '',
            time: (a.horarios && a.horarios.length > 0) ? `${a.horarios[0].diaSemana} ${a.horarios[0].horaInicio}` : 'Sin horario',
            location: a.sede ? a.sede.nombre : 'Sin Sede',
            status: a.status || 'Confirmado',
            statusTone: a.statusTone || 'success',
            visitas: 0
          };
        });
        this.visitaService.visitasPorActividad().subscribe({
          next: visitasMap => {
            this.activities.forEach(a => {
              if (a.id != null && visitasMap[a.id] != null) {
                a.visitas = visitasMap[a.id];
              }
            });
            this.cdr.detectChanges();
          },
          error: () => this.cdr.detectChanges()
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error al cargar actividades:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

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

  deleteActivity(activity: Activity): void {
    if (!confirm(`¿Eliminar la actividad "${activity.title}"?`)) return;
    if (activity.id == null) return;
    this.toast.show('Eliminando actividad…', 'info');
    this.actividadService.eliminar(activity.id).subscribe({
      next: () => {
        this.cargarActividades();
        this.toast.show('Actividad eliminada con éxito', 'success');
      },
      error: (err: unknown) => {
        console.error('Error al eliminar actividad:', err);
        this.toast.show('Error al eliminar la actividad', 'error');
      }
    });
  }

  categoryToneClass(category: string): string {
    const found = this.categories.find(c => c.label === category);
    return found ? found.tone : 'surface-variant';
  }

  statusPillClass(status: string): string {
    if (status === 'Confirmado') return 'status-confirmed';
    if (status === 'En Revisión') return 'status-review';
    return 'status-cancelled';
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  soloNumeros(value: string): string {
    return value.replace(/\D/g, '');
  }

  isModalOpen = false;
  editingId: number | null = null;
  saving = false;

  newActivityForm = {
    title: '',
    sedeId: null as number | null,
    startDate: '',
    endDate: '',
    repeatYearly: true,
    schedules: [
      { day: 'Martes', startTime: '10:00', endTime: '12:00' }
    ],
    selectedCategory: null as string | null,
    whatsapp: ''
  };

  openModal(): void {
    this.editingId = null;
    this.newActivityForm = {
      title: '',
      sedeId: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      repeatYearly: true,
      schedules: [
        { day: 'Martes', startTime: '10:00', endTime: '12:00' }
      ],
      selectedCategory: null,
      whatsapp: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(activity: Activity): void {
    this.editingId = activity.id ?? null;
    const relatedSede = this.sedesBackend.find(s => s.nombre === activity.location);
    this.newActivityForm = {
      title: activity.title,
      sedeId: relatedSede?.id ?? null,
      startDate: activity.date || new Date().toISOString().split('T')[0],
      endDate: '',
      repeatYearly: true,
      schedules: activity.time !== 'Sin horario'
        ? [{ day: activity.time.split(' ')[0] || 'Martes', startTime: activity.time.split(' ')[1]?.slice(0, 5) || '10:00', endTime: '12:00' }]
        : [{ day: 'Martes', startTime: '10:00', endTime: '12:00' }],
      selectedCategory: activity.category !== 'Sin Área' ? activity.category : null,
      whatsapp: ''
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  addSchedule(): void {
    this.newActivityForm.schedules.push({ day: 'Lunes', startTime: '10:00', endTime: '12:00' });
  }

  removeSchedule(index: number): void {
    this.newActivityForm.schedules.splice(index, 1);
  }

  pickCategory(categoryLabel: string): void {
    this.newActivityForm.selectedCategory = categoryLabel;
  }

  saveActivity(): void {
    if (!this.newActivityForm.title || !this.newActivityForm.sedeId) {
      this.toast.show('Completa el título y la sede', 'error');
      return;
    }

    const selectedAreaId = this.newActivityForm.selectedCategory
      ? (this.categories.find(c => c.label === this.newActivityForm.selectedCategory)?.id ?? null)
      : null;

    const payload: ActividadPayload = {
      titulo: this.newActivityForm.title,
      descripcion: 'Nueva actividad creada desde el panel.',
      sede: { id: Number(this.newActivityForm.sedeId) },
      fechaInicio: this.newActivityForm.startDate,
      fechaFin: this.newActivityForm.endDate || null,
      repetirTodoAnio: this.newActivityForm.repeatYearly,
      areas: selectedAreaId ? [{ id: selectedAreaId }] : [],
      horarios: this.newActivityForm.schedules.map(sch => ({
        diaSemana: sch.day.toUpperCase(),
        horaInicio: sch.startTime + ':00'
      })),
      descripcion_corta: 'Creado desde el panel admin'
    };

    this.saving = true;
    const request$ = this.editingId
      ? this.actividadService.actualizar(this.editingId, payload)
      : this.actividadService.crear(payload);

    request$.subscribe({
      next: () => {
        this.cargarActividades();
        this.closeModal();
        this.saving = false;
        this.toast.show(this.editingId ? 'Actividad actualizada con éxito' : 'Actividad creada con éxito', 'success');
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.saving = false;
        this.toast.show('Error al guardar la actividad', 'error');
      }
    });
  }
}
