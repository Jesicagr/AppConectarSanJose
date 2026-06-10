# Documentación del Frontend — Conectar San José

## Vista General

El frontend del proyecto **Conectar San José** consta de **tres aplicaciones** dentro del directorio `frontend/`:

1. **Sitio Público (estático)** — Sitio web estático (HTML + CSS + JavaScript vanilla) orientado al ciudadano. Muestra información sobre categorías, servicios municipales, turismo y contactos de emergencia.
2. **Panel Administrativo (SPA)** — Aplicación Angular 21 (standalone) en `frontend/conectar-sj/` para que el personal municipal gestione actividades, sedes, áreas y contactos. Corre en **puerto 4201**. Incluye autenticación JWT, mapas interactivos (Leaflet) y Tailwind CSS v4.
3. **Sitio Público (Angular)** — Aplicación Angular 21 (standalone) en `frontend/conectar-angular/` orientada al ciudadano con agenda de actividades, detalle de áreas y contacto. Corre en **puerto 4200**.

---

## 1. Sitio Público

| Archivo | Propósito |
|---|---|
| `frontend/index.html` | Página única con todas las secciones (hero, ayuda, categorías, turismo, contacto) y un modal de emergencias |
| `frontend/style.css` | Estilos completos con diseño responsive (mobile-first, 3 breakpoints) |
| `frontend/script.js` | Lógica de navegación entre secciones internas (mostrar/ocultar categorías) |
| `frontend/tracking.js` | API client para tracking de visitas y consumo de datos públicos |
| `frontend/img/` | Recursos gráficos (logos, íconos, fotos) |
| `frontend/docFrontend.txt` | Placeholder (vacío) — reemplazado por este documento |

### Estructura del HTML

El sitio es una sola página con secciones que se muestran/ocultan via JavaScript:

- **Header** — Logo + navegación (Inicio, Actividades, Agenda)
- **Hero** (`#inicio`) — Presentación con tipografía decorativa
- **Ayuda** (`#ayuda`) — Botón de "Necesito ayuda" que abre un modal tipo bottom-sheet con líneas de emergencia
- **Categorías** (`#categorias`) — Grid de 11 tarjetas (Mujer, Niñez, Personas Mayores, etc.) que al hacer clic muestran una sección interna con información detallada
- **Secciones internas** — Cada categoría tiene su propia sección (`#seccionMujeres`, `#seccionNinez`, etc.) con datos de contacto, horarios, programas y talleres
- **Turismo** — Sección con destinos turísticos de San José
- **Contacto** — Datos de contacto (placeholder)

### JavaScript (`script.js`)

Funciones de navegación entre secciones:

- `mostrarPaginaPrincipal()` / `ocultarPaginaPrincipal()` — Control de visibilidad del contenido principal
- `mostrarMujeres()`, `mostrarNinez()`, etc. — Muestran secciones internas por categoría
- `volverCategorias()` — Vuelve a la vista principal
- `abrirAyuda()` / `cerrarAyuda()` — Control del modal de emergencias

### API Client (`tracking.js`)

Expone el namespace global `window.ConectarSJ` con:

- **Tracking**: `trackPagina()`, `trackActividad()`, `trackSede()`, `trackArea()`, `trackContacto()`
- **Datos públicos**: `obtenerActividades()`, `obtenerActividad()`, `obtenerSedes()`, `obtenerSede()`, `obtenerAreas()`, `obtenerArea()`, `obtenerContactos()`, `obtenerContacto()`
- **Estadísticas**: `obtenerStats()`, `obtenerStatsActividades()`

Endpoint base: `http://localhost:8080/api`

---

## 2. Panel Administrativo (Angular)

### Stack Tecnológico

| Tecnología | Versión |
|---|---|
| Angular | 21.2 |
| TypeScript | 5.9 |
| Tailwind CSS | 4.3 |
| Leaflet | 1.9 |
| RxJS | 7.8 |
| Playwright | 1.60 |
| Vitest | 4.0 |

### Estructura del Proyecto

```
frontend/conectar-sj/
├── angular.json              # Configuración del build/serve
├── package.json               # Dependencias y scripts
├── proxy.conf.json            # Proxy para rutas /auth/** y /api/** al backend
├── playwright.config.ts       # Config de tests E2E
├── postcss.config.js          # Config PostCSS para Tailwind v4
├── tsconfig.json              # TypeScript config
├── tsconfig.app.json          # TS config para la app
├── tsconfig.spec.json         # TS config para tests
├── public/                    # Assets estáticos (logo.webp, imágenes)
├── src/
│   ├── index.html
│   ├── main.ts                # Punto de entrada
│   ├── styles.css             # Variables globales + Tailwind
│   └── app/
│       ├── app.ts             # Componente raíz
│       ├── app.html           # <router-outlet />
│       ├── app.config.ts      # Providers globales
│       ├── app.routes.ts      # Definición de rutas
│       ├── app.spec.ts        # Test unitario del componente raíz
│       ├── login/             # Página de inicio de sesión
│       ├── forgot-password/   # Solicitud de restablecimiento
│       ├── recuperar-password/# Restablecimiento de contraseña
│       ├── admin/
│       │   ├── layout/        # AdminLayout (sidebar + router-outlet)
│       │   ├── pages/
│       │   │   ├── dashboard/ # Panel principal con métricas y filtros
│       │   │   ├── activities/# CRUD de actividades
│       │   │   ├── sedes/     # CRUD de sedes con mapa Leaflet
│       │   │   ├── areas/     # CRUD de áreas temáticas
│       │   │   └── contacts/  # CRUD de contactos útiles
│       │   └── shared/
│       │       └── actividad-modal/  # Modal reutilizable para actividades
│       ├── services/
│       │   ├── actividad.service.ts
│       │   ├── area.service.ts
│       │   ├── sede.service.ts
│       │   ├── contacto.service.ts
│       │   ├── visita.service.ts
│       │   └── auth.interceptor.ts
│       └── shared/
│           ├── area-tones.ts          # Mapa de colores por área
│           ├── date-format.pipe.ts    # Pipe de formato de fecha
│           └── toast.service.ts       # Servicio de notificaciones
└── e2e/                      # Tests end-to-end (Playwright)
```

### Configuración Angular

**`angular.json`**: Usa el builder `@angular/build:application` (Vite-based). Incluye `proxy.conf.json` para desarrollo y hojas de estilo Leaflet.

**`proxy.conf.json`**: Redirige `/auth/**` y `/api/**` a `http://localhost:8080` para desarrollo local.

```json
{
  "/auth/**": { "target": "http://localhost:8080", "secure": false, "logLevel": "debug" },
  "/api/**":  { "target": "http://localhost:8080", "secure": false, "logLevel": "debug" }
}
```

### Rutas (`app.routes.ts`)

| Ruta | Componente | Propósito |
|---|---|---|
| `/login` | `LoginPage` | Inicio de sesión |
| `/forgot-password` | `ForgotPasswordPage` | Solicitar restablecimiento |
| `/recuperar-password` | `RecuperarPasswordPage` | Restablecer contraseña (vía token) |
| `/admin` | `AdminLayout` (con hijos) | Layout con sidebar |
| `/admin/dashboard` | `DashboardPage` | Panel principal |
| `/admin/activities` | `ActivitiesPage` | Gestión de actividades |
| `/admin/sedes` | `SedesPage` | Gestión de sedes |
| `/admin/areas` | `AreasPage` | Gestión de áreas |
| `/admin/contactos` | `ContactsPage` | Gestión de contactos |
| `**` | Redirige a `/login` | Catch-all |

Todas las rutas usan lazy loading con `loadComponent`.

### Servicios (`services/`)

#### `ActividadService`
- `obtenerTodas()` → `GET /api/actividades`
- `obtenerPaginadas(page, size)` → `GET /api/actividades/paginated`
- `contar()` → `GET /api/actividades/count`
- `obtenerPorId(id)` → `GET /api/actividades/{id}`
- `crear(payload)` → `POST /api/actividades`
- `actualizar(id, payload)` → `PUT /api/actividades/{id}`
- `eliminar(id)` → `DELETE /api/actividades/{id}`

#### `AreaService`
- Caché con `shareReplay(1)` que se invalida en escrituras.
- `obtenerTodas()` → `GET /api/areas`
- `crear(area)` → `POST /api/areas`
- `actualizar(id, area)` → `PUT /api/areas/{id}`
- `eliminar(id)` → `DELETE /api/areas/{id}`

#### `SedeService`
- Misma estrategia de caché que `AreaService`.
- `obtenerTodas()` → `GET /api/sedes`
- `crear(payload)` → `POST /api/sedes`
- `actualizar(id, payload)` → `PUT /api/sedes/{id}`
- `eliminar(id)` → `DELETE /api/sedes/{id}`

#### `ContactoService`
- Misma estrategia de caché.
- `obtenerTodos()` → `GET /api/contactos`
- `crear(contacto)` → `POST /api/contactos`
- `actualizar(id, contacto)` → `PUT /api/contactos/{id}`
- `eliminar(id)` → `DELETE /api/contactos/{id}`

#### `VisitaService`
- Caché para stats y visitas por actividad.
- `registrar(pagina)` → `POST /api/visitas`
- `obtenerStats()` → `GET /api/visitas/stats`
- `registrarActividad(id)` → `POST /api/visitas`
- `visitasPorActividad()` → `GET /api/visitas/stats/actividades`

#### `auth.interceptor.ts`
Interceptor funcional que agrega el header `Authorization: Bearer <token>` a todas las requests excepto las que van a `/auth/`.

### Páginas del Admin

#### LoginPage
- Formulario con email, contraseña y "Recordarme"
- Persiste el email en `localStorage`
- Llama a `POST /auth/login` y almacena el token JWT
- Navega a `/admin/dashboard` en éxito

#### ForgotPasswordPage
- Formulario de email
- Llama a `POST /auth/forgot-password`
- Muestra mensaje de éxito genérico (por seguridad)

#### RecuperarPasswordPage
- Lee `?token=` de la query string
- Formulario para nueva contraseña con confirmación
- Llama a `POST /auth/reset-password`
- Validación: mínimo 6 caracteres, coincidencia de contraseñas

#### AdminLayout
- Sidebar responsiva (overlay en mobile, fija en desktop ≥901px)
- Botón hamburguesa flotante en mobile
- Perfil de usuario con avatar
- 5 ítems de navegación: Dashboard, Actividades, Sedes, Áreas, Contactos
- Toast de notificaciones integrado (servicio `ToastService`)
- Estilo glassmorphism con blur

#### DashboardPage
- **Métricas**: 3 tarjetas (Actividades Totales, En Revisión, Visitas Hoy)
- **Filtros por categoría**: Grid de chips con íconos y colores por área
- **Listado de actividades**: Grid de tarjetas con búsqueda y filtro por categoría
- **Menú contextual**: 3 puntos por tarjeta (Ver detalle, Editar, Eliminar)
- **Modal**: Integra `ActividadModalComponent` para crear/editar/ver actividades
- Normaliza búsqueda (lowercase + elimina acentos)

#### ActivitiesPage
- Listado completo con búsqueda y filtro por área (dropdown)
- Carga diferida con `IntersectionObserver` (render 50, carga +20 al scrollear)
- Filtro invisible por estado
- Vista de detalle, edición y eliminación
- Botón "Nueva Actividad" que abre el modal
- Soporta query param `?edit=ID` para abrir edición directa

#### SedesPage
- **Vistas**: Grilla (grid) y Mapa (Leaflet) con toggle
- **Grilla**: Tarjetas con ícono, nombre, dirección, teléfono (con indicador WhatsApp), horarios y acciones
- **Mapa**: Marcadores personalizados con popups; al hacer clic en una sede vuela a su ubicación
- **Modal de creación/edición**: Formulario con nombre, descripción, dirección, teléfono, selector de íconos, horarios (múltiples rangos día/hora) y mini-mapa para geolocalización
- **Geocodificación**: Integración con Nominatim (OpenStreetMap) para geocodificar direcciones individuales o masivamente
- Botón "Geocodificar Pendientes" para procesar sedes sin coordenadas

#### AreasPage
- Grilla de tarjetas con ícono, nombre, descripción, referente, dirección, email, redes, horarios y teléfonos
- Orden personalizado según `AREA_ORDER`
- Colores por área definidos en `area-tones.ts`
- Modal de edición con dos columnas: datos básicos y selector de ícono (14 opciones)
- Soporte para múltiples teléfonos con etiquetas y toggle WhatsApp

#### ContactsPage
- Grilla de tarjetas con ícono, nombre, descripción y teléfonos
- Filtros por categoría (Seguridad, Salud, Servicios, Emergencia)
- Modal de edición con selector de ícono (14 opciones) y múltiples teléfonos
- 8 variantes de color cíclicas para las tarjetas

### Componente Compartido

#### ActividadModalComponent
- Props: `isOpen`, `data`, `viewMode`
- Outputs: `isOpenChange`, `saved`
- Formulario completo con:
  - Datos básicos (título, descripción, sede, encargado)
  - Recurrencia y vigencia (fecha inicio/fin, checkbox "repetir todo el año")
  - Días y horarios (múltiples rangos)
  - Áreas (selector tipo chip con colores)
  - WhatsApp de contacto
- Modo vista (solo lectura) vs edición/creación
- Carga datos completos de la actividad al editar (incluyendo horarios del backend)

### Utilidades Compartidas (`shared/`)

#### `area-tones.ts`
- 12 tonos predefinidos (`AREA_TONES`)
- Mapa nombre → tono (`AREA_TONE_MAP`)
- Orden de visualización personalizado (`AREA_ORDER`)
- Mapa nombre → ruta de imagen webp (`WEBP_MAP`)
- Funciones: `getAreaTone()`, `sortByAreaOrder()`

#### `date-format.pipe.ts`
Pipe `dateFormat` que convierte `YYYY-MM-DD` → `DD/MM/YYYY`.

#### `toast.service.ts`
Servicio con `BehaviorSubject` para notificaciones tipo toast:
- Métodos: `show(message, type)`, `hide()`
- Tipos: `'success' | 'error' | 'info'`
- Auto-oculta después de 3500ms

### Estilos y Diseño

- **Mobile-first** con 5 breakpoints: 420px, 560px, 641px, 769px, 901px, 1041px, 1201px
- **Tailwind CSS v4** con PostCSS para utilidades rápidas
- **Variables CSS** personalizadas en `styles.css` (`:root`) con sistema de colores consistente (primary, secondary, success, danger, warning, surface, etc.)
- **Material Symbols** como fuente de íconos
- **Fuentes**: Outfit (títulos), Plus Jakarta Sans (cuerpo)
- **Glassmorphism**: fondos con `backdrop-filter: blur()`, bordes semitransparentes
- **Gradientes**: fondos con radial-gradients para profundidad
- **Animaciones**: transiciones suaves en hover, menús, toasts y modales
- **Clases globales**: `.spinner`, `.loading-screen`, `.wa-toggle`, `.geo-btn`, `.primary-button`

---

### Configuración de Servicios

Todos los servicios del panel administrativo usan URLs **relativas** (`/api/...`) que son proxyadas por Angular Dev Server a `http://localhost:8080`. Anteriormente usaban URLs absolutas (`http://localhost:8080/api/...`), pero se cambiaron a relativas para soportar el panel en puerto 4201 sin conflictos CORS.

| Servicio | URL (admin) | URL (público Angular) |
|---|---|---|
| `ActividadService` | `GET /api/actividades` | `http://localhost:8080/api/actividades` |
| `AreaService` | `GET /api/areas` | `http://localhost:8080/api/areas` |
| `SedeService` | `GET /api/sedes` | `http://localhost:8080/api/sedes` |
| `ContactoService` | `GET /api/contactos` | `http://localhost:8080/api/contactos` |
| `VisitaService` | `POST /api/visitas` | `http://localhost:8080/api/visitas` |

---

## 4. Sitio Público (Angular) — `conectar-angular`

### Stack Tecnológico

| Tecnología | Versión |
|---|---|
| Angular | 21.2 |
| TypeScript | 5.9 |
| Leaflet | 1.9 |
| RxJS | 7.8 |

### Estructura

```
frontend/conectar-angular/
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── public/
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css
    └── app/
        ├── app.ts / app.html / app.config.ts / app.routes.ts
        ├── components/
        │   ├── home/          # Página principal
        │   ├── agenda/        # Agenda de actividades con filtro por día
        │   ├── sedes/         # Mapa de sedes (Leaflet)
        │   ├── area/          # Detalle de área con actividades
        │   └── contacto/      # Formulario de contacto / info
        ├── services/
        │   ├── actividad.service.ts  → http://localhost:8080/api/actividades
        │   ├── area.service.ts       → http://localhost:8080/api/areas
        │   ├── sede.service.ts       → http://localhost:8080/api/sedes
        │   └── visita.service.ts     → http://localhost:8080/api/visitas
        └── pipes/
            └── date-format.pipe.ts
```

### Funcionalidades Clave

- **Agenda**: Lista actividades agrupadas por día de la semana. Filtra actividades por horarios (solo muestra actividades que tienen `horarios` con `diaSemana` coincidente). Usa `horaInicio?.substring(0,5)` con safe navigation para evitar errores de template si `horaInicio` es null.
- **Áreas**: Muestra detalle de cada área municipal con sus actividades asociadas.
- **Sedes**: Mapa Leaflet con las sedes geolocalizadas.

---

## 3. Comunicación con el Backend

- **API base (admin)**: `/api` (relativo, proxy Angular → `http://localhost:8080/api`)
- **API base (público Angular)**: `http://localhost:8080/api` (absoluto, CORS permitido)
- **Autenticación**: JWT via `POST /auth/login`
- **Interceptor**: Agrega `Authorization: Bearer <token>` automáticamente
- **Proxy dev**: `/auth/**` y `/api/**` redirigidos a `http://localhost:8080`

### Endpoints consumidos

| Endpoint | Método | Servicio |
|---|---|---|
| `/api/actividades` | GET/POST | `ActividadService` |
| `/api/actividades/{id}` | GET/PUT/DELETE | `ActividadService` |
| `/api/actividades/paginated` | GET | `ActividadService` |
| `/api/actividades/count` | GET | `ActividadService` |
| `/api/areas` | GET/POST | `AreaService` |
| `/api/areas/{id}` | PUT/DELETE | `AreaService` |
| `/api/sedes` | GET/POST | `SedeService` |
| `/api/sedes/{id}` | PUT/DELETE | `SedeService` |
| `/api/contactos` | GET/POST | `ContactoService` |
| `/api/contactos/{id}` | PUT/DELETE | `ContactoService` |
| `/api/visitas` | POST | `VisitaService` / `tracking.js` |
| `/api/visitas/stats` | GET | `VisitaService` |
| `/api/visitas/stats/actividades` | GET | `VisitaService` |
| `/auth/login` | POST | `LoginPage` |
| `/auth/forgot-password` | POST | `ForgotPasswordPage` |
| `/auth/reset-password` | POST | `RecuperarPasswordPage` |

---

## 5. Testing

- **Unitarios**: Vitest con builder `@angular/build:unit-test`
  - Test básico del componente `App` en `app.spec.ts`
- **E2E**: Playwright configurado en `playwright.config.ts`
  - Directorio: `e2e/`
  - Servidor web: `npx ng serve` en `http://localhost:4200`

### Scripts disponibles (`package.json`)

| Script | Comando |
|---|---|
| `npm start` | `ng serve` (proxy a backend) |
| `npm run build` | `ng build` (producción) |
| `npm run watch` | `ng build --watch --configuration development` |
| `npm test` | `ng test` (Vitest) |
| `npm run preview` | Build producción + http-server con proxy |

---

## 6. Flujo de Desarrollo

```bash
# 1. Iniciar backend (Spring Boot) en puerto 8080
# 2. Iniciar panel admin (conectar-sj)
cd frontend/conectar-sj
npm install
ng serve --port 4201  # http://localhost:4201
# 3. Iniciar sitio público (conectar-angular)
cd ../conectar-angular
ng serve              # http://localhost:4200
# 4. Login: admin@sanjose.gob.ar (credenciales configuradas en backend)
```

Para producción:
```bash
cd frontend/conectar-sj
npm run build    # Genera dist/conectar-sj/browser/
npm run preview  # Sirve con proxy a backend
```

---

## 7. Configuración del Entorno

No hay archivos `environment.ts`. Los endpoints se definen directamente en los servicios. El panel admin (`conectar-sj`) usa URLs relativas (`/api/...`) proxyadas por Angular Dev Server; el sitio público (`conectar-angular`) usa URLs absolutas (`http://localhost:8080/api/...`). En producción se espera un proxy reverso que sirva el frontend estático y redirija `/api/*` y `/auth/*` al backend.
