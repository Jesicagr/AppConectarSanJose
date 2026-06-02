import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface ActividadPayload {
  titulo: string;
  descripcion: string;
  sede: { id: number };
  fechaInicio: string;
  fechaFin: string | null;
  repetirTodoAnio: boolean;
  areas: { id: number }[];
  horarios: { diaSemana: string; horaInicio: string }[];
  descripcion_corta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/actividades';
  private cache$: Observable<any[]> | null = null;

  obtenerTodas(): Observable<any[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<any[]>(this.apiUrl).pipe(shareReplay(1));
    }
    return this.cache$;
  }

  crear(actividad: ActividadPayload): Observable<any> {
    this.invalidateCache();
    return this.http.post<any>(this.apiUrl, actividad);
  }

  actualizar(id: number, actividad: ActividadPayload): Observable<any> {
    this.invalidateCache();
    return this.http.put<any>(`${this.apiUrl}/${id}`, actividad);
  }

  eliminar(id: number): Observable<void> {
    this.invalidateCache();
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private invalidateCache(): void {
    this.cache$ = null;
  }
}
