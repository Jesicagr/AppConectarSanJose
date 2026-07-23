import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map } from 'rxjs';

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
  private apiUrl = '/api/contactos';
  private cache$: Observable<Contacto[]> | null = null;

  obtenerTodos(): Observable<Contacto[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Contacto[]>(this.apiUrl).pipe(shareReplay(1));
    }
    return this.cache$;
  }

  crear(contacto: Partial<Contacto>): Observable<Contacto> {
    this.invalidateCache();
    return this.http.post<Contacto>(this.apiUrl, contacto);
  }

  actualizar(id: number, contacto: Partial<Contacto>): Observable<Contacto> {
    this.invalidateCache();
    return this.http.put<Contacto>(`${this.apiUrl}/${id}`, contacto);
  }

  eliminar(id: number): Observable<void> {
    this.invalidateCache();
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private invalidateCache(): void {
    this.cache$ = null;
  }

  private configUrl = '/api/configuracion';

  getWhatsappFlotanteNumero(): Observable<string> {
    return this.http.get<Record<string, string>>(this.configUrl).pipe(
      map(config => config['whatsapp_flotante_numero'] || '')
    );
  }

  setWhatsappFlotanteNumero(numero: string): Observable<void> {
    return this.http.put<void>(this.configUrl, { whatsapp_flotante_numero: numero });
  }

  getWhatsappFlotanteLabel(): Observable<string> {
    return this.http.get<Record<string, string>>(this.configUrl).pipe(
      map(config => config['whatsapp_flotante_label'] || 'Texto del boton flotante')
    );
  }

  setWhatsappFlotanteLabel(label: string): Observable<void> {
    return this.http.put<void>(this.configUrl, { whatsapp_flotante_label: label });
  }
}
