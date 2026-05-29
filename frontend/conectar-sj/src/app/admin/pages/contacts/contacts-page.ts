import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ContactCard {
  name: string;
  description: string;
  phone: string;
  icon: string;
  tone: string;
  category: string;
}

@Component({
  selector: 'app-contacts-page',
  imports: [FormsModule],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.css',
})
export class ContactsPage {
  searchTerm = '';
  selectedCategory = '';

  categories = ['Todos', 'Seguridad', 'Salud', 'Servicios', 'Emergencia'];

  contacts: ContactCard[] = [
    { name: 'Policía Municipal', description: 'Seguridad local, control de tránsito y convivencia ciudadana.', phone: '2295-3000', icon: 'local_police', tone: 'primary', category: 'Seguridad' },
    { name: 'Bomberos Voluntarios', description: 'Atención de incendios, rescates y emergencias climáticas.', phone: '118', icon: 'fire_extinguisher', tone: 'danger', category: 'Emergencia' },
    { name: 'Cruz Roja', description: 'Asistencia médica pre-hospitalaria y traslados de emergencia.', phone: '128', icon: 'medical_services', tone: 'danger', category: 'Salud' },
    { name: 'Servicio de Agua y Cloacas', description: 'Reporte de fugas, cortes de servicio o problemas de presión.', phone: '800-292-2222', icon: 'water_drop', tone: 'primary', category: 'Servicios' },
    { name: 'Compañía Eléctrica', description: 'Reporte de cortes de luz, cables caídos o riesgo eléctrico público.', phone: '1026', icon: 'electric_bolt', tone: 'warning', category: 'Servicios' },
  ];

  get filteredContacts(): ContactCard[] {
    const query = this.normalize(this.searchTerm);
    return this.contacts.filter((contact) => {
      const categoryMatch = !this.selectedCategory || this.selectedCategory === 'Todos' || contact.category === this.selectedCategory;
      const searchable = this.normalize(`${contact.name} ${contact.description} ${contact.phone} ${contact.category}`);
      const searchMatch = !query || searchable.includes(query);
      return categoryMatch && searchMatch;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
