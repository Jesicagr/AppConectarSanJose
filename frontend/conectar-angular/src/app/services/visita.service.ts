import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VisitaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/visitas';

  registrarActividad(id: number): void {
    const key = `visto_${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    this.http.post(this.apiUrl, { pagina: `actividad-${id}` }).subscribe();
  }
}
