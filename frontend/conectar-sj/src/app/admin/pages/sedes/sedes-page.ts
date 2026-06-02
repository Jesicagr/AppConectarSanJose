import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SedeService, Sede } from '../../../services/sede.service';
import { ToastService } from '../../../shared/toast.service';

@Component({
  selector: 'app-sedes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sedes-page.html',
  styleUrl: './sedes-page.css',
})
export class SedesPage implements OnInit {
  private sedeService = inject(SedeService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  loading = true;
  searchTerm = '';
  sedes: Sede[] = [];
  isModalOpen = false;
  editingId: number | null = null;
  saving = false;

  newSedeForm: Partial<Sede> & { esWhatsapp: boolean } = {
    nombre: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    icono: 'storefront',
    esWhatsapp: false,
  };

  iconOptions = [
    'storefront',
    'park',
    'local_library',
    'apartment',
    'sports_soccer',
    'school',
    'museum',
    'local_hospital'
  ];

  ngOnInit(): void {
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.sedeService.obtenerTodas().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las sedes:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredSedes(): Sede[] {
    const query = this.normalize(this.searchTerm);
    return this.sedes.filter((sede) => {
      const nombre = sede.nombre ? this.normalize(sede.nombre) : '';
      const descripcion = sede.descripcion ? this.normalize(sede.descripcion) : '';
      const direccion = sede.direccion ? this.normalize(sede.direccion) : '';
      
      const searchable = `${nombre} ${descripcion} ${direccion}`;
      return !query || searchable.includes(query);
    });
  }

  openModal(): void {
    this.editingId = null;
    this.newSedeForm = {
      nombre: '',
      descripcion: '',
      direccion: '',
      telefono: '',
      icono: 'storefront',
      esWhatsapp: false,
    };
    this.isModalOpen = true;
  }

  openEditModal(sede: Sede): void {
    this.editingId = sede.id ?? null;
    this.newSedeForm = {
      nombre: sede.nombre || '',
      descripcion: sede.descripcion || '',
      direccion: sede.direccion || '',
      telefono: sede.telefono || '',
      icono: sede.icono || 'storefront',
      esWhatsapp: sede.esWhatsapp ?? false,
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  selectIcon(icon: string): void {
    this.newSedeForm.icono = icon;
  }

  saveSede(): void {
    if (!this.newSedeForm.nombre) {
      this.toast.show('Completa el nombre de la sede', 'error');
      return;
    }

    this.saving = true;
    const request$ = this.editingId
      ? this.sedeService.actualizar(this.editingId, this.newSedeForm)
      : this.sedeService.crear(this.newSedeForm);

    request$.subscribe({
      next: () => {
        this.cargarSedes();
        this.closeModal();
        this.saving = false;
        this.toast.show(this.editingId ? 'Sede actualizada con éxito' : 'Sede creada con éxito', 'success');
      },
      error: (err: unknown) => {
        console.error('Error al guardar la sede:', err);
        this.saving = false;
        this.toast.show('Error al guardar la sede', 'error');
      }
    });
  }

  deleteSede(sede: Sede): void {
    if (!confirm(`¿Eliminar la sede "${sede.nombre}"?`)) return;
    if (sede.id == null) return;
    this.toast.show('Eliminando sede…', 'info');
    this.sedeService.eliminar(sede.id).subscribe({
      next: () => {
        this.cargarSedes();
        this.toast.show('Sede eliminada con éxito', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar sede:', err);
        this.toast.show('Error al eliminar la sede', 'error');
      }
    });
  }

  iconTone(icono?: string): string {
    const tones: Record<string, string> = {
      storefront: 'primary',
      park: 'secondary',
      local_library: 'tertiary',
      apartment: 'primary',
      sports_soccer: 'success',
      school: 'warning',
      museum: 'primary',
      local_hospital: 'danger',
    };
    return tones[icono || ''] || 'primary';
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  soloNumeros(value: string): string {
    return value.replace(/\D/g, '');
  }
}