import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  private router = inject(Router);
  private http = inject(HttpClient);

  loginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  onLogin(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      alert('Por favor, ingresa tus credenciales.');
      return;
    }

    const credentials = {
      email: this.loginForm.email, 
      password: this.loginForm.password
    };

    
    this.http.post<{ token: string }>('http://localhost:8080/auth/login', credentials).subscribe({
      next: (response) => {
        
        localStorage.setItem('token', response.token);
        
        
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Error en la autenticación:', err);
        if (err.status === 401) {
          alert('Usuario o contraseña incorrectos.');
        } else {
          alert('Hubo un problema de conexión con el backend o permisos (Código: ' + err.status + ').');
        }
      }
    });
  }
}