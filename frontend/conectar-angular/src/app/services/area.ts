// src/app/services/area.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Area } from '../models/actividad.model'; // Usamos la interface Area que ya armamos

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  // URL de tu CRUD de áreas en Spring Boot
  private apiUrl = 'http://localhost:8080/api/areas';

  constructor(private http: HttpClient) { }

  // Trae todas las áreas (Deportes, Cultura, etc.) para armar los botones
  obtenerAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.apiUrl);
  }

  // Por si necesitás traer un área específica por su ID
  obtenerAreaPorId(id: number): Observable<Area> {
    return this.http.get<Area>(`${this.apiUrl}/${id}`);
  }
}