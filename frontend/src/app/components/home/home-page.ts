import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  mostrarModalAyuda: boolean = false;

  private ocultarPaginaPrincipal() {
    const hero = document.querySelector('.hero') as HTMLElement;
    const ayuda = document.querySelector('.ayuda') as HTMLElement;
    const categorias = document.querySelector('.categorias') as HTMLElement;
    const turismo = document.querySelector('.turismo') as HTMLElement;
    const contacto = document.querySelector('.contacto') as HTMLElement;
    if (hero) hero.style.display = 'none';
    if (ayuda) ayuda.style.display = 'none';
    if (categorias) categorias.style.display = 'none';
    if (turismo) turismo.style.display = 'none';
    if (contacto) contacto.style.display = 'none';
  }

  private mostrarPaginaPrincipal() {
    const hero = document.querySelector('.hero') as HTMLElement;
    const ayuda = document.querySelector('.ayuda') as HTMLElement;
    const categorias = document.querySelector('.categorias') as HTMLElement;
    const turismo = document.querySelector('.turismo') as HTMLElement;
    const contacto = document.querySelector('.contacto') as HTMLElement;
    if (hero) hero.style.display = 'flex';
    if (ayuda) ayuda.style.display = 'block';
    if (categorias) categorias.style.display = 'block';
    if (turismo) turismo.style.display = 'block';
    if (contacto) contacto.style.display = 'block';
  }

  private ocultarSeccionesInternas() {
    const ids = [
      'seccionMujeres', 'seccionNinez', 'seccionMayores',
      'seccionComunidad', 'seccionDiscapacidad', 'seccionSalud',
      'seccionTrabajo', 'seccionDeportes', 'seccionCultura', 'seccionEducacion', 'seccionTurismo'
    ];
    ids.forEach(id => {
      const el = document.querySelector('#' + id) as HTMLElement;
      if (el) el.style.display = 'none';
    });
  }

  private mostrarSeccion(id: string) {
    this.ocultarPaginaPrincipal();
    this.ocultarSeccionesInternas();
    const el = document.querySelector('#' + id) as HTMLElement;
    if (el) el.style.display = 'block';
    window.scrollTo(0, 0);
  }

  mostrarMujeres() { this.mostrarSeccion('seccionMujeres'); }
  mostrarNinez() { this.mostrarSeccion('seccionNinez'); }
  mostrarMayores() { this.mostrarSeccion('seccionMayores'); }
  mostrarComunidad() { this.mostrarSeccion('seccionComunidad'); }
  mostrarDiscapacidad() { this.mostrarSeccion('seccionDiscapacidad'); }
  mostrarSalud() { this.mostrarSeccion('seccionSalud'); }
  mostrarTrabajo() { this.mostrarSeccion('seccionTrabajo'); }
  mostrarDeportes() { this.mostrarSeccion('seccionDeportes'); }
  mostrarCultura() { this.mostrarSeccion('seccionCultura'); }
  mostrarEducacion() { this.mostrarSeccion('seccionEducacion'); }
  mostrarTurismo() { this.mostrarSeccion('seccionTurismo'); }

  volverCategorias() {
    this.ocultarSeccionesInternas();
    this.mostrarPaginaPrincipal();
    window.scrollTo(0, 0);
  }

  abrirAyuda() {
    this.mostrarModalAyuda = true;
  }

  cerrarAyuda() {
    this.mostrarModalAyuda = false;
  }
}
