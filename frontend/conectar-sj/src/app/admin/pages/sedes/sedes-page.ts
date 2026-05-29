import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Sede {
  name: string;
  address: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-sedes-page',
  imports: [FormsModule],
  templateUrl: './sedes-page.html',
  styleUrl: './sedes-page.css',
})
export class SedesPage {
  searchTerm = '';

  sedes: Sede[] = [
    { name: 'Centro Comunitario El Carmen', address: 'Av. Central y Calle 5, Barrio El Carmen', icon: 'storefront', tone: 'primary' },
    { name: 'Polideportivo Aranjuez', address: 'Costado norte de la Iglesia de Aranjuez', icon: 'sports_soccer', tone: 'success' },
    { name: 'Biblioteca Municipal Central', address: 'Calle 11, Avenidas 1 y 3', icon: 'local_library', tone: 'warning' },
    { name: 'Casa de la Cultura', address: 'Avenida principal, centro urbano', icon: 'museum', tone: 'teal' },
    { name: 'Centro Integrador Comunitario', address: 'B° San Martín, lote 12', icon: 'apartment', tone: 'primary' },
  ];

  get filteredSedes(): Sede[] {
    const query = this.normalize(this.searchTerm);
    return this.sedes.filter((sede) => {
      const searchable = this.normalize(`${sede.name} ${sede.address}`);
      return !query || searchable.includes(query);
    });
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
