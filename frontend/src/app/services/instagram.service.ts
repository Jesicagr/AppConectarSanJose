import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface InstagramPost {
  id: number;
  username: string;
  imageUrl: string;
  caption: string;
  postUrl: string;
  postTimestamp: string;
  fetchedAt: string;
  shortcode: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private http = inject(HttpClient);
  private apiUrl = '/api/instagram';

  obtenerPosts(): Observable<InstagramPost[]> {
    return this.http.get<InstagramPost[]>(`${this.apiUrl}/posts`);
  }

  obtenerPostsPorUsuario(username: string): Observable<InstagramPost[]> {
    return this.http.get<InstagramPost[]>(`${this.apiUrl}/posts/${username}`);
  }
}
