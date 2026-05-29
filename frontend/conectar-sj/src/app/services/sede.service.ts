import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sede {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/sedes';

  obtenerTodas(): Observable<Sede[]> {
    return this.http.get<Sede[]>(this.apiUrl);
  }
}
