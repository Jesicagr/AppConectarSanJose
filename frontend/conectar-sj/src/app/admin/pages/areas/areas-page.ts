import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AreaService, Area } from '../../../services/area.service';
import { getAreaTone, sortByAreaOrder } from '../../../shared/area-tones';
import { ToastService } from '../../../shared/toast.service';

interface AreaCard {
  name: string;
  description: string;
  icon: string;
  tone: string;
  status: string;
  statusTone: string;
  phone?: string;
  esWhatsapp?: boolean;
}

@Component({
  selector: 'app-areas-page',
  imports: [FormsModule],
  templateUrl: './areas-page.html',
  styleUrl: './areas-page.css',
})
export class AreasPage implements OnInit {
  private areaService = inject(AreaService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  loading = true;
  searchTerm = '';
  isModalOpen = false;
  editId: number | null = null;
  saving = false;

  iconos = [
    { icono: 'female', label: 'Mujer' },
    { icono: 'child_care', label: 'Niñez' },
    { icono: 'elderly', label: 'Adulto Mayor' },
    { icono: 'diversity_3', label: 'Comunidad' },
    { icono: 'accessible', label: 'Discapacidad' },
    { icono: 'monitor_heart', label: 'Salud' },
    { icono: 'work', label: 'Trabajo' },
    { icono: 'sports_soccer', label: 'Deportes' },
    { icono: 'travel_explore', label: 'Turismo' },
    { icono: 'theater_comedy', label: 'Cultura' },
    { icono: 'school', label: 'Educación' },
    { icono: 'park', label: 'Ambiente' },
    { icono: 'handshake', label: 'Gestión' },
    { icono: 'groups', label: 'Juventud' },
  ];

  newArea: { nombre: string; telefono: string; descripcion: string; icono: string; activo: boolean; esWhatsapp: boolean } = {
    nombre: '',
    telefono: '',
    descripcion: '',
    icono: '',
    activo: true,
    esWhatsapp: false,
  };

  areas: AreaCard[] = [];
  private areasBackend: Area[] = [];

  ngOnInit(): void {
    this.areaService.obtenerTodas().subscribe({
      next: (data) => {
        const sorted = sortByAreaOrder(data);
        this.areasBackend = sorted;
        this.areas = sorted.map((a, i) => this.toAreaCard(a, i));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar áreas', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private toAreaCard(a: Area, index: number): AreaCard {
    return {
      name: a.nombre,
      description: a.descripcion,
      icon: a.icono,
      phone: a.telefono,
      esWhatsapp: a.esWhatsapp,
      tone: getAreaTone(a.nombre, index),
      status: 'Activa',
      statusTone: 'success',
    };
  }

  get filteredAreas(): AreaCard[] {
    const query = this.normalize(this.searchTerm);
    return this.areas.filter((area) => {
      const searchable = this.normalize(`${area.name} ${area.description} ${area.status}`);
      return !query || searchable.includes(query);
    });
  }

  openModal(): void {
    this.editId = null;
    this.newArea = { nombre: '', telefono: '', descripcion: '', icono: '', activo: true, esWhatsapp: false };
    this.isModalOpen = true;
  }

  editarArea(index: number): void {
    const backend = this.areasBackend[index];
    if (!backend) return;
    this.editId = backend.id;
    this.newArea = {
      nombre: backend.nombre,
      telefono: backend.telefono || '',
      descripcion: backend.descripcion || '',
      icono: backend.icono || '',
      activo: true,
      esWhatsapp: backend.esWhatsapp ?? false,
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editId = null;
  }

  selectIcon(icono: string): void {
    this.newArea.icono = icono;
  }

  saveArea(): void {
    if (!this.newArea.nombre.trim()) {
      this.toast.show('Completa el nombre del área', 'error');
      return;
    }

    this.saving = true;
    const payload: Partial<Area> = {
      nombre: this.newArea.nombre,
      telefono: this.newArea.telefono,
      descripcion: this.newArea.descripcion,
      icono: this.newArea.icono,
      esWhatsapp: this.newArea.esWhatsapp,
    };

    if (this.editId !== null) {
      this.areaService.actualizar(this.editId, payload).subscribe({
        next: (updated) => {
          const idx = this.areasBackend.findIndex((a) => a.id === this.editId);
          if (idx !== -1) {
            this.areasBackend[idx] = updated;
            this.areas[idx] = this.toAreaCard(updated, idx);
          }
          this.closeModal();
          this.saving = false;
          this.cdr.detectChanges();
          this.toast.show('Área actualizada con éxito', 'success');
        },
        error: (err) => {
          console.error('Error al actualizar área', err);
          this.saving = false;
          this.toast.show('Error al actualizar el área', 'error');
        },
      });
    } else {
      this.areaService.crear(payload).subscribe({
        next: (saved) => {
          this.areasBackend.push(saved);
          this.areas.push(this.toAreaCard(saved, this.areas.length));
          this.closeModal();
          this.saving = false;
          this.cdr.detectChanges();
          this.toast.show('Área creada con éxito', 'success');
        },
        error: (err) => {
          console.error('Error al crear área', err);
          this.saving = false;
          this.toast.show('Error al crear el área', 'error');
        },
      });
    }
  }

  confirmarEliminarArea(index: number): void {
    const backend = this.areasBackend[index];
    if (!backend) return;
    const name = backend.nombre;
    if (!confirm(`¿Eliminar el área "${name}"? Esta acción no se puede deshacer.`)) return;

    this.toast.show('Eliminando área…', 'info');
    this.areaService.eliminar(backend.id).subscribe({
      next: () => {
        this.areasBackend.splice(index, 1);
        this.areas.splice(index, 1);
        this.cdr.detectChanges();
        this.toast.show('Área eliminada con éxito', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar área', err);
        this.toast.show('Error al eliminar el área', 'error');
      },
    });
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  soloNumeros(value: string): string {
    return value.replace(/\D/g, '');
  }
}
