import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Area {
  id: number;
  nombre: string;
  icono: string;
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
}
