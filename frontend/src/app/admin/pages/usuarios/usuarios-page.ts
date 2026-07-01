import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

interface Usuario {
  id: number;
  email: string;
  rol: string;
}

@Component({
  selector: 'app-usuarios-page',
  imports: [FormsModule],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css',
})
export class UsuariosPage implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private static datosCache: Usuario[] | null = null;
  private static readonly LS_KEY = 'usuarios_cache';

  usuarios: Usuario[] = [];
  loading = true;
  error = '';

  form = { email: '', password: '', rol: 'ADMIN' };
  submitting = false;
  mensaje = '';
  mensajeError = false;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private cargarUsuarios(): void {
    if (UsuariosPage.datosCache) {
      this.usuarios = UsuariosPage.datosCache;
      this.loading = false;
      return;
    }
    const ls = localStorage.getItem(UsuariosPage.LS_KEY);
    if (ls) {
      try {
        this.usuarios = JSON.parse(ls);
        this.loading = false;
        this.cdr.detectChanges();
      } catch {}
    }
    this.http.get<Usuario[]>('/api/usuarios').subscribe({
      next: (data) => {
        this.usuarios = data.map(u => ({ ...u }));
        UsuariosPage.datosCache = this.usuarios;
        localStorage.setItem(UsuariosPage.LS_KEY, JSON.stringify(this.usuarios));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        if (!ls) {
          this.error = 'Error al cargar usuarios';
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  private static invalidarCache(): void {
    UsuariosPage.datosCache = null;
    localStorage.removeItem(UsuariosPage.LS_KEY);
  }

  crearUsuario(): void {
    const email = this.form.email.trim();
    const password = this.form.password.trim();
    if (!email || password.length < 6) {
      this.mensaje = 'Email válido y contraseña de al menos 6 caracteres';
      this.mensajeError = true;
      return;
    }
    this.submitting = true;
    this.mensaje = '';
    this.mensajeError = false;

    this.http.post<Usuario>('/api/usuarios', { email, password, rol: this.form.rol }).subscribe({
      next: () => {
        this.mensaje = 'Usuario creado correctamente';
        this.mensajeError = false;
        this.form = { email: '', password: '', rol: 'ADMIN' };
        this.submitting = false;
        this.cdr.detectChanges();
        UsuariosPage.invalidarCache();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.mensaje = err.error?.error || 'Error al crear usuario';
        this.mensajeError = true;
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarUsuario(id: number, email: string): void {
    if (!confirm(`¿Eliminar al usuario "${email}"?`)) return;
    this.http.delete(`/api/usuarios/${id}`).subscribe({
      next: () => {
        this.cdr.detectChanges();
        this.mensaje = 'Usuario eliminado correctamente';
        this.mensajeError = false;
        UsuariosPage.invalidarCache();
        this.cargarUsuarios();
      },
      error: () => {
        this.mensaje = 'Error al eliminar usuario';
        this.mensajeError = true;
        this.cdr.detectChanges();
      }
    });
  }
}
