# Conectar San José

Plataforma municipal de gestión y difusión de actividades, servicios y recursos de la ciudad de San José, Entre Ríos.

---

## Arquitectura

```
ConectarSanJose/
├── backend/                          # Spring Boot 3.5.14 + Java 21 + PostgreSQL (Supabase)
│   ├── src/main/java/.../backend/
│   │   ├── config/                   # Seguridad JWT, CORS, OpenAPI, DataSeeder
│   │   ├── controller/               # REST controllers (7)
│   │   ├── dto/                      # DTOs
│   │   ├── model/                    # JPA entities (8 + 2 enums)
│   │   ├── repository/               # Spring Data JPA
│   │   └── service/                  # Business logic (7 servicios)
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile                    # Build multi-stage (eclipse-temurin:21 Alpine)
│   └── .env.example                  # Template de variables de entorno
├── frontend/                         # Angular 21 unificado (sitio público + panel admin)
│   ├── src/app/
│   │   ├── components/               # home, agenda, area
│   │   ├── login/                    # Inicio de sesión
│   │   ├── admin/                    # Panel administrativo (layout + 6 páginas)
│   │   ├── services/                 # 7 servicios HTTP + interceptor JWT + auth guard
│   │   └── models/                   # Interfaces TypeScript
│   ├── proxy.conf.json               # Proxy a backend localhost:8080 (dev)
│   └── vercel.json                   # Config SPA para Vercel
├── vercel.json                       # Config Vercel: build + proxy a Render
├── MANUAL_DE_USUARIO.md              # Manual de usuario completo
└── start-all.bat                     # Inicia backend + frontend
```

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Frontend** | Angular (standalone) | 21.2 |
| | TypeScript | ~5.9 |
| | Tailwind CSS | 4.3 |
| | Leaflet (mapas) | 1.9 |
| **Backend** | Spring Boot | 3.5.14 |
| | Java | 21 |
| | Spring Security + JWT | jjwt 0.11.5 |
| | Spring Data JPA | — |
| | Spring Mail | — |
| **Base de datos** | PostgreSQL (Supabase) | Transaction Pooler |
| **Correo** | Gmail SMTP | STARTTLS, puerto 587 |

---

## Despliegue (Producción)

La aplicación está desplegada en la nube con la siguiente arquitectura:

```
┌─────────────────┐         ┌──────────────────────┐         ┌────────────────┐
│     Navegador    │────────▶│   Vercel (Frontend)   │────────▶│ Render (API)   │
│                  │         │   Static hosting +    │  proxy  │ Docker + JRE   │
│  conectarsj.     │         │   SPA rewrites        │  /api/* │ Spring Boot    │
│  vercel.app      │         │                       │  /auth/*│ Puerto 8080    │
└─────────────────┘         └──────────────────────┘         └───────┬────────┘
                                                                     │
                                                             ┌───────▼────────┐
                                                             │   Supabase     │
                                                             │   PostgreSQL   │
                                                             │   Puerto 6543  │
                                                             └────────────────┘
```

### Frontend — Vercel

- **URL:** `https://conectarsj.vercel.app`
- **Build:** `cd frontend && npx ng build --configuration production`
- **Output:** `frontend/dist/conectar-angular/browser/`
- **Proxy:** Las requests a `/api/*` y `/auth/*` se redirigen al backend en Render
- **SPA Fallback:** Cualquier ruta que no sea `/assets/*` sirve `index.html`

### Backend — Render

- **URL:** `https://conectar-sj-backend.onrender.com`
- **Runtime:** Docker (eclipse-temurin:21-jre-alpine)
- **Puerto:** 8080
- **Build multi-stage:** Maven compila el JAR en etapa `build`, JRE Alpine lo ejecuta
- **Variables de entorno:** Configuradas en el dashboard de Render

### Base de datos — Supabase

- **Motor:** PostgreSQL
- **Conexión:** Transaction Pooler (puerto 6543)
- **DDL:** Automático (`spring.jpa.hibernate.ddl-auto=update`)

---

## Variables de Entorno

El backend requiere las siguientes variables de entorno (ver `backend/.env.example`):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SUPABASE_DB_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://...supabase.com:6543/postgres` |
| `SUPABASE_DB_USERNAME` | Usuario de la DB | `postgres.xxx` |
| `SUPABASE_DB_PASSWORD` | Contraseña de la DB | `tu_password` |
| `SMTP_USERNAME` | Email remitente (Gmail) | `email@gmail.com` |
| `SMTP_PASSWORD` | App password de Gmail | `tu_app_password` |

> **Nota:** En Render, estas variables se configuran directamente en el dashboard bajo "Environment".

---

## Seguridad

### Autenticación (JWT)

- **Login:** `POST /auth/login` con `{ email, password }` → devuelve `{ token }`
- **Header:** `Authorization: Bearer <token>` en todas las requests autenticadas
- **Expiración:** 24 horas
- **Algoritmo:** HS256

### Protección de rutas

**Frontend (Angular):**
- Ruta `/admin` protegida con `authGuard` (`canActivate`)
- Si no hay token en `localStorage`, redirige a `/login`
- El interceptor adjunta el token automáticamente a las requests

**Backend (Spring Security):**
- `/auth/**` — Público (login, forgot-password, reset-password)
- `/api/**` — Requiere JWT válido
- Cualquier otra ruta — Requiere autenticación

### CORS

Permitido desde:
- `http://localhost:4200` (desarrollo)
- `http://localhost:4201` (desarrollo alternativo)
- `https://conectarsj.vercel.app` (producción)

---

## Inicio Rápido (Desarrollo Local)

### Con script automático

```bash
start-all.bat
```

### Manualmente

```bash
# 1. Backend (puerto 8080)
cd backend
cp .env.example .env   # Configurar variables de entorno
mvn spring-boot:run

# 2. Frontend (puerto 4200)
cd frontend
npm install
ng serve --proxy-config proxy.conf.json
```

### Credenciales por defecto

- **Email:** `admin@sanjose.com`
- **Password:** `admin123`
- **Rol:** `SUPER_ADMIN`

> **Nota:** Este usuario se crea automáticamente al iniciar el backend si no existe.

---

## API REST

| Grupo | Ruta | Autenticación |
|---|---|---|
| Auth | `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` | Pública |
| Sedes | `/api/sedes` | JWT requerido |
| Áreas | `/api/areas` | JWT requerido |
| Actividades | `/api/actividades` | JWT requerido |
| Contactos | `/api/contactos` | JWT requerido |
| Usuarios | `/api/usuarios` | JWT requerido (SUPER_ADMIN) |
| Visitas | `/api/visitas` | JWT requerido |

Documentación completa: [Backend](backend/docBackend.md) | [Frontend](frontend/docFrontend.md)

---

## Testing

```bash
# Frontend - Unit tests (Vitest)
cd frontend && npm test

# Frontend - E2E tests (Playwright)
cd frontend && npm run e2e
```

---

## Documentación

| Documento | Descripción |
|---|---|
| [Backend](backend/docBackend.md) | Documentación técnica del backend |
| [Frontend](frontend/docFrontend.md) | Documentación técnica del frontend |
| [Manual de Usuario](MANUAL_DE_USUARIO.md) | Guía de uso completa |
| [Variables de entorno](backend/.env.example) | Template de configuración |
