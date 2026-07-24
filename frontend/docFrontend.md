# Documentación del Frontend — Conectar San José

## Vista General

Aplicación **Angular 21** (standalone) unificada que contiene:
- **Sitio público** — Página principal con áreas municipales, agenda de actividades, turismo y contacto
- **Panel administrativo** — Gestión de actividades, sedes, áreas, contactos de emergencia y usuarios (requiere JWT)

Anteriormente existían tres proyectos separados (HTML estático, panel admin Angular y sitio público Angular) que se consolidaron en un solo frontend.

## Stack Tecnológico

| Tecnología | Versión |
|---|---|
| Angular | 21.2 |
| TypeScript | ~5.9 |
| Tailwind CSS | 4.3 |
| Leaflet | 1.9 |
| RxJS | ~7.8 |
| Vitest | 4.0 |
| Playwright | — |

## Estructura del Proyecto

```
frontend/
├── angular.json                 # Configuración build/serve
├── package.json                 # Dependencias y scripts
├── vercel.json                  # Config SPA para Vercel (despliegue individual)
├── proxy.conf.json              # Proxy /auth/** y /api/** → localhost:8080
├── playwright.config.ts         # Config tests E2E
├── postcss.config.js            # PostCSS para Tailwind v4
├── tsconfig*.json               # TypeScript config
├── public/                      # Assets estáticos
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css                # Variables globales + Tailwind
    └── app/
        ├── app.ts / app.html / app.config.ts / app.routes.ts
        ├── components/
        │   ├── home/             # Página principal pública
        │   ├── agenda/           # Agenda semanal con filtro por día
        │   └── area/             # Detalle de área con actividades
        ├── login/                # Inicio de sesión
        ├── forgot-password/      # Solicitud de restablecimiento
        ├── recuperar-password/   # Restablecimiento de contraseña
        ├── admin/
        │   ├── layout/           # AdminLayout (sidebar + router-outlet)
        │   ├── pages/
        │   │   ├── dashboard/    # Métricas y actividades más visitadas
        │   │   ├── activities/   # CRUD de actividades
        │   │   ├── sedes/        # CRUD de sedes con mapa Leaflet
        │   │   ├── areas/        # CRUD de áreas
        │   │   ├── contacts/     # CRUD de contactos de emergencia
        │   │   └── usuarios/     # Gestión de usuarios (SUPER_ADMIN)
        │   └── shared/
        │       └── actividad-modal/  # Modal reutilizable de actividad
        ├── services/
        │   ├── auth.service.ts       # Gestión de token JWT y usuario
        │   ├── auth.guard.ts         # Route guard para rutas protegidas
        │   ├── auth.interceptor.ts   # Interceptor HTTP para JWT
        │   ├── actividad.service.ts
        │   ├── area.service.ts
        │   ├── sede.service.ts
        │   ├── contacto.service.ts
        │   └── visita.service.ts
        ├── models/
        │   └── actividad.model.ts     # Interfaces: Actividad, Sede, Area,
        │                              #   HorarioSede, HorarioActividad,
        │                              #   TelefonoContacto, enum DiaSemana
        └── shared/
            ├── area-tones.ts          # Colores por área
            ├── date-format.pipe.ts    # Pipe de formato de fechas
            ├── link-utils.ts          # Utilidades para enlaces
            ├── logger.service.ts      # Servicio de logging
            └── toast.service.ts       # Notificaciones toast
```

## Configuración Angular

**`proxy.conf.json`** — Redirige `/auth/**` y `/api/**` a `http://localhost:8080` en desarrollo:

```json
{
  "/auth/**": { "target": "http://localhost:8080", "secure": false, "logLevel": "debug" },
  "/api/**":  { "target": "http://localhost:8080", "secure": false, "logLevel": "debug" }
}
```

## Rutas

| Ruta | Componente | Protegida | Propósito |
|---|---|---|---|
| `/` | `HomePage` | No | Página principal pública (hero, áreas, agenda, emergencias, turismo) |
| `/login` | `LoginPage` | No | Inicio de sesión |
| `/forgot-password` | `ForgotPasswordPage` | No | Solicitar restablecimiento de contraseña |
| `/recuperar-password` | `RecuperarPasswordPage` | No | Restablecer contraseña con token |
| `/admin` | `AdminLayout` | **Sí (authGuard)** | Layout con sidebar |
| `/admin/dashboard` | `DashboardPage` | **Sí (authGuard)** | Métricas y actividades más visitadas |
| `/admin/activities` | `ActivitiesPage` | **Sí (authGuard)** | CRUD de actividades |
| `/admin/sedes` | `SedesPage` | **Sí (authGuard)** | CRUD de sedes con mapa Leaflet |
| `/admin/areas` | `AreasPage` | **Sí (authGuard)** | CRUD de áreas |
| `/admin/contactos` | `ContactsPage` | **Sí (authGuard)** | CRUD de contactos de emergencia |
| `/admin/usuarios` | `UsuariosPage` | **Sí (authGuard)** | Gestión de usuarios (solo SUPER_ADMIN) |

Todas las rutas usan lazy loading. Las rutas `/admin/**` están protegidas por `authGuard` (`canActivate`), que verifica la existencia de un token JWT en `localStorage`. Si no hay token, redirige a `/login`.

## Seguridad (Frontend)

### Auth Guard (`auth.guard.ts`)

Route guard Angular (`CanActivateFn`) que protege las rutas del panel administrativo:

```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken()) {
    return true;  // Permite la navegación
  }

  return router.createUrlTree(['/login']);  // Redirige al login
};
```

Se aplica a la ruta padre `/admin` en `app.routes.ts`, protegiendo todas las rutas hijas.

### Auth Interceptor (`auth.interceptor.ts`)

Interceptor HTTP funcional que:
- Adjunta el header `Authorization: Bearer <token>` a todas las requests
- Omite requests a `/auth/*` (login, forgot-password, etc.)
- Omite requests SSR (server-side rendering)

### Auth Service (`auth.service.ts`)

Servicio que gestiona:
- Almacenamiento del JWT en `localStorage`
- Decodificación del token (email, rol)
- Métodos: `getToken()`, `getUser()`, `getRol()`, `isSuperAdmin()`, `clear()`
- `clear()` elimina el token y redirige a `/login`

## Endpoints consumidos

| Endpoint | Método | Servicio |
|---|---|---|
| `/auth/login` | POST | `AuthService` |
| `/auth/forgot-password` | POST | `AuthService` |
| `/auth/reset-password` | POST | `AuthService` |
| `/api/actividades` | GET/POST | `ActividadService` |
| `/api/actividades/{id}` | GET/PUT/DELETE | `ActividadService` |
| `/api/actividades/paginated` | GET | `ActividadService` |
| `/api/actividades/area/{areaId}` | GET | `ActividadService` |
| `/api/actividades/count` | GET | `ActividadService` |
| `/api/areas` | GET/POST | `AreaService` |
| `/api/areas/{id}` | GET/PUT/DELETE | `AreaService` |
| `/api/sedes` | GET/POST | `SedeService` |
| `/api/sedes/{id}` | PUT/DELETE | `SedeService` |
| `/api/contactos` | GET/POST | `ContactoService` |
| `/api/contactos/{id}` | PUT/DELETE | `ContactoService` |
| `/api/visitas` | POST | `VisitaService` |
| `/api/visitas/stats` | GET | `VisitaService` |
| `/api/visitas/stats/actividades` | GET | `VisitaService` |

## Scripts disponibles

| Script | Comando |
|---|---|
| `npm start` | `ng serve` (puerto 4200, proxy a backend 8080) |
| `npm run build` | `ng build` (producción) |
| `npm run watch` | `ng build --watch --configuration development` |
| `npm test` | `ng test` (Vitest) |
| `npm run e2e` | `ng e2e` (Playwright) |
| `npm run preview` | Build + http-server con proxy |

## Flujo de Desarrollo

```bash
# 1. Iniciar backend (Spring Boot)
cd backend && mvn spring-boot:run  # → http://localhost:8080

# 2. Iniciar frontend
cd frontend
npm install
ng serve                           # → http://localhost:4200

# Login: admin@sanjose.com / admin123
```

Producción:
```bash
cd frontend
npm run build   # → dist/conectar-angular/browser/
```

## Notas

- No hay archivos `environment.ts`. Los endpoints se definen con URLs relativas y se proxyan en desarrollo.
- Leaflet se usa en el mapa de sedes (admin). El warning de ESM es esperado y no afecta la funcionalidad.
- El interceptor `auth.interceptor.ts` agrega automáticamente el header `Authorization: Bearer <token>` a las requests autenticadas.

---

## Despliegue en Producción (Vercel)

### Configuración

El frontend se despliega en **Vercel** como aplicación SPA estática. La configuración está en `vercel.json` en la raíz del repositorio:

```json
{
  "installCommand": "cd frontend && npm install --legacy-peer-deps",
  "buildCommand": "cd frontend && npx ng build --configuration production",
  "outputDirectory": "frontend/dist/conectar-angular/browser",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://conectar-sj-backend.onrender.com/api/$1" },
    { "source": "/auth/(.*)", "destination": "https://conectar-sj-backend.onrender.com/auth/$1" },
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

### Cómo funciona el proxy

Vercel actúa como **reverse proxy** para el backend:

1. Las requests a `/api/*` y `/auth/*` se redirigen al backend en Render
2. Las demás rutas sirven `index.html` (SPA fallback)
3. Las requests a `/assets/*` sirven archivos estáticos directamente

Esto permite que el frontend y backend estén en dominios distintos (`conectarsj.vercel.app` → `conectar-sj-backend.onrender.com`) sin problemas de CORS en producción.

### Variables de entorno

El frontend **no requiere** variables de entorno. Todos los endpoints se definen con URLs relativas (`/api/...`, `/auth/...`), y Vercel se encarga del proxy.

### URL de producción

```
https://conectarsj.vercel.app
```

### Build local (simular producción)

```bash
cd frontend
npm install --legacy-peer-deps
npx ng build --configuration production
# Output: dist/conectar-angular/browser/
```
