import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActividadService, ActividadPayload } from '../../../services/actividad.service';
import { SedeService, Sede } from '../../../services/sede.service';
import { AreaService, Area } from '../../../services/area.service';

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
export class ActivitiesPage implements OnInit {
  private actividadService = inject(ActividadService);
  private sedeService = inject(SedeService);
  private areaService = inject(AreaService);

  sedesBackend: Sede[] = [];
  areasBackend: Area[] = [];

  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';

  categories: any[] = [];

  activities: Activity[] = [];

  ngOnInit(): void {
    this.sedeService.obtenerTodas().subscribe(sedes => this.sedesBackend = sedes);
    this.areaService.obtenerTodas().subscribe(areas => {
      this.areasBackend = areas;
      const tones = ['rose', 'amber', 'indigo', 'emerald', 'blue', 'red', 'cyan', 'orange', 'purple', 'teal'];
      this.categories = areas.map((a, i) => ({
        id: a.id,
        label: a.nombre,
        icon: a.icono || 'assets/comunidad.webp',
        tone: tones[i % tones.length]
      }));
    });
    this.cargarActividades();
  }

  cargarActividades(): void {
    this.actividadService.obtenerTodas().subscribe(acts => {
      this.activities = acts.map(a => {
        const primaryArea = (a.areas && a.areas.length > 0) ? a.areas[0] : null;
        return {
          id: a.id,
          title: a.titulo,
          description: a.descripcion || a.descripcion_corta || 'Sin descripción',
          category: primaryArea ? primaryArea.nombre : 'Sin Área',
          categoryIcon: primaryArea ? primaryArea.icono : 'assets/comunidad.webp',
          categoryTone: 'emerald',
          date: a.fechaInicio || '',
          time: (a.horarios && a.horarios.length > 0) ? `${a.horarios[0].diaSemana} ${a.horarios[0].horaInicio}` : 'Sin horario',
          location: a.sede ? a.sede.nombre : 'Sin Sede',
          status: a.status || 'Confirmado',
          statusTone: a.statusTone || 'success'
        };
      });
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

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  isModalOpen = false;

  newActivityForm = {
    title: '',
    sedeId: null as number | null,
    startDate: '',
    endDate: '',
    repeatYearly: true,
    schedules: [
      { day: 'Martes', startTime: '10:00', endTime: '12:00' }
    ],
    selectedCategories: [] as string[],
    whatsapp: ''
  };

  openModal(): void {
    this.newActivityForm = {
      title: '',
      sedeId: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      repeatYearly: true,
      schedules: [
        { day: 'Martes', startTime: '10:00', endTime: '12:00' }
      ],
      selectedCategories: [],
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

  toggleCategory(categoryLabel: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.newActivityForm.selectedCategories.push(categoryLabel);
    } else {
      this.newActivityForm.selectedCategories = this.newActivityForm.selectedCategories.filter(c => c !== categoryLabel);
    }
  }

  saveActivity(): void {
    if (!this.newActivityForm.title || !this.newActivityForm.sedeId) {
      alert('Por favor completa el título y la sede.');
      return;
    }

    const areasToSend = this.newActivityForm.selectedCategories.map(catLabel => {
       const found = this.categories.find(c => c.label === catLabel);
       return { id: found ? found.id : 1 };
    });

    const payload: ActividadPayload = {
      titulo: this.newActivityForm.title,
      descripcion: 'Nueva actividad creada desde el panel.',
      sede: { id: Number(this.newActivityForm.sedeId) },
      fechaInicio: this.newActivityForm.startDate,
      fechaFin: this.newActivityForm.endDate || null,
      repetirTodoAnio: this.newActivityForm.repeatYearly,
      areas: areasToSend,
      horarios: this.newActivityForm.schedules.map(sch => ({
        diaSemana: sch.day.toUpperCase(),
        horaInicio: sch.startTime + ':00'
      })),
      descripcion_corta: 'Creado desde el panel admin'
    };

    this.actividadService.crear(payload).subscribe({
      next: () => {
        this.cargarActividades();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Hubo un error al guardar la actividad en la base de datos.');
      }
    });
  }
}
