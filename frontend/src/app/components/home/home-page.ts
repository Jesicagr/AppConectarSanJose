import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaComponent } from '../agenda/agenda';
import { AreaComponent } from '../area/area';
import { getPhoneLink } from '../../shared/link-utils';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, AgendaComponent, AreaComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit {
  menuAbierto: boolean = false;
  mostrarModalAyuda: boolean = false;

  constructor() {}

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    document.body.style.overflow = this.menuAbierto ? 'hidden' : '';
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
    document.body.style.overflow = '';
  }

  irInicio(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirAyuda() {
    this.mostrarModalAyuda = true;
  }

  cerrarAyuda() {
    this.mostrarModalAyuda = false;
  }

  phoneLink(numero: string): string {
    return getPhoneLink(numero);
  }
}
