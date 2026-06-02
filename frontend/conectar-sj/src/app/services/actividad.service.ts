import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActividadPayload {
  titulo: string;
  descripcion: string;
  sede: { id: number };
  fechaInicio: string;
  fechaFin: string | null;
  repetirTodoAnio: boolean;
  areas: { id: number }[];
  horarios: { diaSemana: string; horaInicio: string }[];
  // Mapeamos también los campos estéticos del frontend si no existen en el backend,
  // pero el backend los ignorará.
  descripcion_corta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/actividades';

  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crear(actividad: ActividadPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, actividad);
  }

  actualizar(id: number, actividad: ActividadPayload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, actividad);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
