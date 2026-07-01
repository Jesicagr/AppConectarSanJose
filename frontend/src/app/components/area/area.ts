// src/app/components/area/area.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaService, Area } from '../../services/area.service';
import { ActividadService } from '../../services/actividad.service';
import { Actividad } from '../../models/actividad.model';
import { WEBP_MAP, AREA_ORDER } from '../../shared/area-tones';
import { getPhoneLink, getAddressLink, getEmailLink, getWebLink } from '../../shared/link-utils';

const ACCENT_COLORS: Record<string, string> = {
  'Mujeres Género y Diversidad': '#9acb92',
  'Mujer': '#9acb92',
  'Niñez, Adolescencia y Familia': '#d6c75d',
  'Niñez': '#d6c75d',
  'Personas Mayores': '#9acb92',
  'Desarrollo Comunitario': '#8fc6d9',
  'Inclusión': '#d6c75d',
  'Salud': '#9acb92',
  'Salud Social y Comunitaria': '#9acb92',
  'Trabajo y Producción': '#8fc6d9',
  'Trabajo': '#8fc6d9',
  'Deportes y Recreación': '#d6c75d',
  'Deportes': '#d6c75d',
  'Turismo': '#8fc6d9',
  'Cultura': '#8fc6d9',
  'Educación': '#d6c75d',
};

@Component({
  selector: 'app-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area.html',
  styleUrl: './area.css'
})
export class AreaComponent implements OnInit {

  listaAreas: Area[] = [];
  mostrarModal: boolean = false;
  areaSeleccionada: Area | null = null;
  actividadesPorArea: Actividad[] = [];
  actividadesPorAreaMap = new Map<number, Actividad[]>();
  private modalRequestId = 0;

  constructor(
    private areaService: AreaService,
    private actividadService: ActividadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAreas();
  }

  cargarAreas(): void {
    this.areaService.obtenerTodas().subscribe({
      next: (data) => {
        this.listaAreas = [...data].sort((a, b) => {
          const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
          const aNorm = normalize(a.nombre);
          const bNorm = normalize(b.nombre);
          const ai = AREA_ORDER.findIndex(name => normalize(name) === aNorm);
          const bi = AREA_ORDER.findIndex(name => normalize(name) === bNorm);
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
        this.precargarActividades();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[ConectarSanJose] ERROR Error al cargar áreas:', err)
    });
  }

  private precargarActividades(): void {
    const promises: Promise<void>[] = [];
    
    for (const area of this.listaAreas) {
      if (area.id !== undefined) {
        promises.push(
          new Promise(resolve => {
            this.actividadService.obtenerActividadesPorArea(area.id!).subscribe((actividades) => {
              const primeras4Actividades = actividades.slice(0, 4);
              this.actividadesPorAreaMap.set(area.id!, primeras4Actividades);
              resolve();
            });
          })
        );
      }
    }
    
    Promise.all(promises).then(() => {
      this.cdr.detectChanges();
    });
  }

  abrirModal(areaId: number | undefined): void {
    if (areaId === undefined) return;
  
    const requestId = ++this.modalRequestId;
    const areaBasica = this.listaAreas.find(a => a.id === areaId);
    
    if (areaBasica) {
      this.areaSeleccionada = areaBasica;
      this.mostrarModal = true;
    }

    this.actividadService.obtenerActividadesPorArea(areaId).subscribe({
      next: (actividades) => {
        if (requestId !== this.modalRequestId) return;
        this.actividadesPorArea = actividades;
      },
      error: (err) => {
        if (requestId !== this.modalRequestId) return;
        console.error('[ConectarSanJose] ERROR al cargar actividades:', err);
      }
    });

    this.areaService.obtenerPorId(areaId).subscribe({
      next: (area) => {
        if (requestId !== this.modalRequestId) return;
        this.areaSeleccionada = area;
      },
      error: (err) => {
        if (requestId !== this.modalRequestId) return;
        console.error('[ConectarSanJose] ERROR al cargar datos del área:', err);
      }
    });
  }

  cerrarModal(): void {
    this.modalRequestId++;
    this.mostrarModal = false;
    this.areaSeleccionada = null;
    this.actividadesPorArea = [];
  }

  getIconPath(area: Area): string {
    const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const aNorm = normalize(area.nombre);
    const key = Object.keys(WEBP_MAP).find((k) => normalize(k) === aNorm);
    return WEBP_MAP[key!] || 'assets/comunidad.webp';
  }

  getAreaTone(index: number): string {
    const colors = ['tone-celeste', 'tone-amarillo', 'tone-gris'];
    return colors[index % 3];
  }

  getAccentColor(area: Area): string {
    const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const aNorm = normalize(area.nombre);
    const key = Object.keys(ACCENT_COLORS).find((k) => normalize(k) === aNorm);
    return ACCENT_COLORS[key!] || '#9acb92';
  }

  phoneLink(numero: string, esWhatsapp?: boolean): string {
    return getPhoneLink(numero, esWhatsapp);
  }

  addressLink(dir: string): string {
    return getAddressLink(dir);
  }

  emailLink(email: string): string {
    return getEmailLink(email);
  }

  webLink(sitio: string): string {
    return getWebLink(sitio);
  }

  getRedesItems(redes: string): string[] {
    return redes.split(/[\s,;]+/).filter(s => s.trim().length > 0);
  }

  instagramLink(username: string): string {
    return `https://instagram.com/${username}`;
  }

  formatHorario(horario: string): string {
    return horario.replace(/\b(Lunes|Martes|Mi[eé]rcoles|Jueves|Viernes|S[aá]bado|Domingo|GUARDIA)\b/g, '\n$1').trim();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}