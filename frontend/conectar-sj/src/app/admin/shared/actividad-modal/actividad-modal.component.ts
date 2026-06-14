import { Component, inject, ChangeDetectorRef, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActividadService, ActividadPayload } from '../../../services/actividad.service';
import { SedeService, Sede } from '../../../services/sede.service';
import { AreaService, Area } from '../../../services/area.service';
import { getAreaTone, sortByAreaOrder } from '../../../shared/area-tones';
import { ToastService } from '../../../shared/toast.service';
import { DateFormatPipe } from '../../../shared/date-format.pipe';

export interface ActividadModalData {
  id?: number;
  title: string;
  description?: string;
  category?: string;
  categoryIcon?: string;
  categories?: string[];
  categoryIcons?: string[];
  date?: string;
  endDate?: string;
  time?: string;
  location?: string;
  encargado?: string;
  telefono?: string;
  status?: string;
}

@Component({
  selector: 'app-actividad-modal',
  imports: [FormsModule, DateFormatPipe],
  templateUrl: './actividad-modal.component.html',
  styleUrl: './actividad-modal.component.css',
})
export class ActividadModalComponent implements OnInit, OnChanges {
  private actividadService = inject(ActividadService);
  private sedeService = inject(SedeService);
  private areaService = inject(AreaService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  @Input() data?: ActividadModalData | null = null;
  @Input() isOpen = false;
  @Input() viewMode = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  sedesBackend: Sede[] = [];
  categories: any[] = [];
  editingId: number | null = null;
  saving = false;
  categoriesLoaded = false;
  sedesLoaded = false;

  form = {
    title: '',
    descripcion: '',
    encargado: '',
    sedeId: null as number | null,
    startDate: '',
    endDate: '',
    repeatYearly: true,
    schedules: [
      { day: 'Martes', startTime: '10:00', endTime: '12:00' }
    ],
    selectedCategories: [] as string[],
    whatsapp: '',
    status: 'Confirmado'
  };

  ngOnInit(): void {
    this.sedeService.obtenerTodas().subscribe({
      next: sedes => { this.sedesBackend = sedes; this.sedesLoaded = true; this.cdr.detectChanges(); },
      error: err => console.error('Error al cargar sedes:', err)
    });
    this.areaService.obtenerTodas().subscribe({
      next: areas => {
        const sorted = sortByAreaOrder(areas);
        this.categories = sorted.map((a, i) => ({
          id: a.id,
          label: a.nombre,
          icon: a.icono || 'assets/comunidad.webp',
          tone: getAreaTone(a.nombre, i),
        }));
        this.categoriesLoaded = true;
        this.cdr.detectChanges();
      },
      error: err => console.error('Error al cargar areas:', err)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.initForm();
    }
  }

  private initForm(): void {
    if (this.data && this.data.id) {
      this.editingId = this.data.id;
      const relatedSede = this.sedesBackend.find(s => s.nombre === this.data!.location);
      this.form = {
        title: this.data.title,
        descripcion: this.data.description || '',
        encargado: this.data.encargado || '',
        sedeId: relatedSede?.id ?? null,
        startDate: this.data.date || new Date().toISOString().split('T')[0],
        endDate: this.data.endDate || '',
        repeatYearly: true,
        schedules: [{ day: 'Martes', startTime: '10:00', endTime: '12:00' }],
        selectedCategories: this.data.categories?.length ? [...this.data.categories] : [],
        whatsapp: this.data.telefono || '',
        status: (this.data as any)?.status || 'Confirmado'
      };
      this.actividadService.obtenerPorId(this.editingId).subscribe({
        next: (actividad) => {
          if (actividad.horarios?.length) {
            this.form.schedules = actividad.horarios.map((h: any) => ({
              day: this.formatDayFromResponse(h.diaSemana),
              startTime: h.horaInicio?.substring(0, 5) || '10:00',
              endTime: h.horaFin?.substring(0, 5) || ''
            }));
          }
          if (actividad.areas?.length) {
            this.form.selectedCategories = actividad.areas.map((a: any) => a.nombre);
          }
          this.cdr.detectChanges();
        },
        error: err => console.error('Error al cargar actividad completa:', err)
      });
    } else {
      this.editingId = null;
      this.form = {
        title: '',
        descripcion: '',
        encargado: '',
        sedeId: null,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        repeatYearly: true,
        schedules: [
          { day: 'Martes', startTime: '10:00', endTime: '12:00' }
        ],
        selectedCategories: [],
        whatsapp: '',
        status: 'Confirmado'
      };
    }
    this.cdr.detectChanges();
  }

  private formatDayFromResponse(dia: string): string {
    return dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
  }

  closeModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  addSchedule(): void {
    this.form.schedules.push({ day: 'Lunes', startTime: '10:00', endTime: '12:00' });
  }

  removeSchedule(index: number): void {
    this.form.schedules.splice(index, 1);
  }

  pickCategory(categoryLabel: string): void {
    const idx = this.form.selectedCategories.indexOf(categoryLabel);
    if (idx >= 0) {
      this.form.selectedCategories.splice(idx, 1);
    } else {
      this.form.selectedCategories.push(categoryLabel);
    }
  }

  soloNumeros(value: string): string {
    return value.replace(/\D/g, '');
  }

  onTelefonoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/\D/g, '');
    if (filtered !== input.value) {
      input.value = filtered;
      this.form.whatsapp = filtered;
    }
  }

  get statusClass(): string {
    const s = this.data?.status || 'Confirmado';
    return this.getStatusClass(s);
  }

  get statusLabel(): string {
    return this.data?.status || 'Confirmado';
  }

  getStatusClass(status: string): string {
    if (status === 'Confirmado') return 'confirmed';
    if (status === 'En Revisión') return 'review';
    return 'cancelled';
  }

  categoryToneClass(category: string): string {
    const found = this.categories.find(c => c.label === category);
    return found ? found.tone : 'surface-variant';
  }

  saveActivity(): void {
    if (!this.form.title || !this.form.sedeId) {
      this.toast.show('Completa el título y la sede', 'error');
      return;
    }

    const selectedAreaIds = this.form.selectedCategories
      .map(label => this.categories.find(c => c.label === label)?.id)
      .filter((id): id is number => id != null);

    const payload: ActividadPayload = {
      titulo: this.form.title,
      descripcion: this.form.descripcion || '',
      sede: { id: Number(this.form.sedeId) },
      fechaInicio: this.form.startDate,
      fechaFin: this.form.endDate || null,
      repetirTodoAnio: this.form.repeatYearly,
      areas: selectedAreaIds.map(id => ({ id })),
      horarios: this.form.schedules.map(sch => ({
        diaSemana: sch.day.toUpperCase(),
        horaInicio: sch.startTime + ':00',
        horaFin: sch.endTime ? sch.endTime + ':00' : null
      })),
      descripcion_corta: '',
      encargado: this.form.encargado || undefined,
      telefono: this.form.whatsapp || undefined,
      status: this.form.status
    };

    this.saving = true;
    const request$ = this.editingId
      ? this.actividadService.actualizar(this.editingId, payload)
      : this.actividadService.crear(payload);

    request$.subscribe({
      next: () => {
        this.closeModal();
        this.saving = false;
        this.saved.emit();
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
