import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Area {
  id: number;
  nombre: string;
  icono: string;
  descripcion: string;
  telefono: string;
  esWhatsapp?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/areas';

  obtenerTodas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.apiUrl);
  }

  crear(area: Partial<Area>): Observable<Area> {
    return this.http.post<Area>(this.apiUrl, area);
  }

  actualizar(id: number, area: Partial<Area>): Observable<Area> {
    return this.http.put<Area>(`${this.apiUrl}/${id}`, area);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
