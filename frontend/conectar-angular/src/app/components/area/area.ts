// src/app/components/area/area.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaService } from '../../services/area';
import { Area } from '../../models/actividad.model';

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

  constructor(private areaService: AreaService) {}

  ngOnInit(): void {
    this.cargarAreas();
  }

  cargarAreas(): void {
    this.areaService.obtenerAreas().subscribe({
      next: (data) => {
        this.listaAreas = data;
      },
      error: (err) => console.error('Error al cargar áreas:', err)
    });
  }


  abrirModal(areaId: number | undefined): void {
    if (areaId === undefined) return;
  
    this.areaService.obtenerAreaPorId(areaId).subscribe({
      next: (areaCompleta) => {
        this.areaSeleccionada = areaCompleta;
        this.mostrarModal = true;
      },
      error: (err) => console.error('Error al traer detalles del área:', err)
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.areaSeleccionada = null;
  }
}