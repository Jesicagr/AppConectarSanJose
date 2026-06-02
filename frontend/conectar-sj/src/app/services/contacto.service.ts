import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TelefonoItem {
  numero: string;
  esWhatsapp: boolean;
}

export interface Contacto {
  id: number;
  nombreInstitucion: string;
  telefonos: TelefonoItem[];
  descripcion: string;
  icono: string;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/contactos';

  obtenerTodos(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(this.apiUrl);
  }

  crear(contacto: Partial<Contacto>): Observable<Contacto> {
    return this.http.post<Contacto>(this.apiUrl, contacto);
  }

  actualizar(id: number, contacto: Partial<Contacto>): Observable<Contacto> {
    return this.http.put<Contacto>(`${this.apiUrl}/${id}`, contacto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
