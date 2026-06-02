import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sede {
  id?: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  icono?: string;
  esWhatsapp?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private apiUrl = 'http://localhost:8080/api/sedes';

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl);
  }

  crear(payload: Partial<Sede>): Observable<Sede> {
    return this.http.post<Sede>(this.apiUrl, payload);
  }

  actualizar(id: number, payload: Partial<Sede>): Observable<Sede> {
    return this.http.put<Sede>(`${this.apiUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}