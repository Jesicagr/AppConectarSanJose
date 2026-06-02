import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VisitaStats {
  total: number;
  hoy: number;
  semana: number;
}

@Injectable({
  providedIn: 'root'
})
export class VisitaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/visitas';

  registrar(pagina: string): Observable<void> {
    return this.http.post<void>(this.apiUrl, { pagina });
  }

  obtenerStats(): Observable<VisitaStats> {
    return this.http.get<VisitaStats>(`${this.apiUrl}/stats`);
  }

  registrarActividad(id: number): Observable<void> {
    return this.http.post<void>(this.apiUrl, { pagina: `actividad-${id}` });
  }

  visitasPorActividad(): Observable<Record<number, number>> {
    return this.http.get<Record<number, number>>(`${this.apiUrl}/stats/actividades`);
  }
}
