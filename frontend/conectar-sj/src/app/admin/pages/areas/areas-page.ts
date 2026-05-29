import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface AreaCard {
  name: string;
  description: string;
  icon: string;
  tone: string;
  status: string;
  statusTone: string;
}

@Component({
  selector: 'app-areas-page',
  imports: [FormsModule],
  templateUrl: './areas-page.html',
  styleUrl: './areas-page.css',
})
export class AreasPage {
  searchTerm = '';

  areas: AreaCard[] = [
    {
      name: 'Mujer',
      description: 'Programas y apoyo integral',
      icon: 'assets/mujer.webp',
      tone: 'rose',
      status: 'Activa',
      statusTone: 'success',
    },
    {
      name: 'Niñez',
      description: 'Actividades recreativas y cuidado',
      icon: 'assets/ninez.webp',
      tone: 'amber',
      status: 'Activa',
      statusTone: 'success',
    },
    {
      name: 'Personas Mayores',
      description: 'Talleres, acompañamiento y bienestar',
      icon: 'assets/mayores.webp',
      tone: 'neutral',
      status: 'Activa',
      statusTone: 'success',
    },
    {
      name: 'Comunidad',
      description: 'Participación ciudadana y redes',
      icon: 'assets/comunidad.webp',
      tone: 'success',
      status: 'En revisión',
      statusTone: 'muted',
    },
    {
      name: 'Inclusión',
      description: 'Accesibilidad e inclusión social',
      icon: 'assets/discapacidad.webp',
      tone: 'blue',
      status: 'Activa',
      statusTone: 'success',
    },
  ];

  get filteredAreas(): AreaCard[] {
    const query = this.normalize(this.searchTerm);
    return this.areas.filter((area) => {
      const searchable = this.normalize(`${area.name} ${area.description} ${area.status}`);
      return !query || searchable.includes(query);
    });
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
