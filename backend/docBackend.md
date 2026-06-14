# Documentación Técnica del Backend — Conectar San José

## 1. Resumen del Proyecto

Backend del sistema **Conectar San José**, desarrollado con **Spring Boot 3.5.14**, **Java 21**, **Maven**, **PostgreSQL** y **JWT** para autenticación. Expone una API RESTful consumida por el frontend Angular (panel administrativo en puerto 4201) y el sitio público (Angular en puerto 4200).

---

## 2. Stack Tecnológico

| Tecnología | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 3.5.14 |
| Spring Data JPA | — |
| Spring Security | — |
| Spring Mail | — |
| PostgreSQL | — (Supabase) |
| jjwt (JWT) | 0.11.5 |
| Lombok | — |
| Maven | — |

---

## 3. Estructura de Paquetes

```
com.conectarsj.backend
├── config/          → Seguridad (JWT, CORS, Filter Chain)
├── controller/      → Endpoints REST
├── dto/             → Objetos de transferencia de datos
├── model/           → Entidades JPA (modelo de datos)
├── repository/      → Capa de acceso a datos (Spring Data JPA)
└── service/         → Lógica de negocio
```

---

## 4. Configuración (`application.properties`)

- **Base de datos:** PostgreSQL en Supabase (pooler transaction)
- **DDL:** `spring.jpa.hibernate.ddl-auto=update`
- **Mail:** SMTP Gmail (con app password)
- **SQL logging:** habilitado

---

## 5. Modelo de Datos (Entidades JPA)

### 5.1 `Administrador`
| Campo | Tipo | Notas |
|---|---|---|
| id | Long (PK, auto) | |
| email | String (unique, not null) | Login por email |
| passwordHash | String (not null) | BCrypt |
| tokenRecuperacion | String | Para reset de password |
| tokenExpiracion | LocalDateTime | Expiración del token (15 min) |

### 5.2 `Sede`
| Campo | Tipo | Notas |
|---|---|---|
| id | Integer (PK, auto) | |
| nombre | String (100, not null) | |
| descripcion | TEXT | |
| direccion | String (200) | |
| telefono | String (50) | |
| icono | String (50) | Material Icon |
| esWhatsapp | Boolean | default false |
| latitud | Double | Para mapa |
| longitud | Double | Para mapa |
| horarios | List\<HorarioSede\> | OneToMany (cascade all) |

### 5.3 `HorarioSede`
| Campo | Tipo | Notas |
|---|---|---|
| id | Long (PK, auto) | |
| diaDesde | DiaSemana (enum) | |
| diaHasta | DiaSemana (enum) | |
| horaInicio | LocalTime | |
| horaFin | LocalTime | |
| sede | Sede (ManyToOne) | |

### 5.4 `Area`
| Campo | Tipo | Notas |
|---|---|---|
| id | Integer (PK, auto) | |
| nombre | String (100, not null) | |
| icono | String (50) | |
| descripcion | TEXT | |
| telefono | String (50) | |
| esWhatsapp | Boolean | default false |
| telefonoEtiqueta | String (50) | |
| referente | String (100) | |
| direccion | String (200) | |
| email | String (150) | |
| redes | String (200) | |
| horarioAtencion | String (200) | |
| telefonos | List\<TelefonoContacto\> | @ElementCollection |

### 5.5 `Actividad`
| Campo | Tipo | Notas |
|---|---|---|
| id | Long (PK, auto) | |
| titulo | String (255, not null) | |
| descripcion | TEXT | |
| sede | Sede (ManyToOne EAGER) | |
| fechaInicio | LocalDate | Indexado |
| fechaFin | LocalDate | |
| repetirTodoAnio | Boolean | |
| creadoPor | Administrador (ManyToOne LAZY, @JsonIgnore) | No se serializa |
| descripcion_corta | String (255) | |
| dia | String (255) | |
| encargado | String (255) | |
| horario | String (255) | |
| telefono | String (50) | |
| areas | List\<Area\> | ManyToMany con tabla `actividad_areas` |
| horarios | List\<HorarioActividad\> | OneToMany (cascade all) |

### 5.6 `HorarioActividad`
| Campo | Tipo | Notas |
|---|---|---|
| id | Long (PK, auto) | |
| diaSemana | DiaSemana (enum) | |
| horaInicio | LocalTime | |
| horaFin | LocalTime | |
| actividad | Actividad (ManyToOne) | |

### 5.7 `ContactoEmergencia`
| Campo | Tipo | Notas |
|---|---|---|
| id | Integer (PK, auto) | |
| nombreInstitucion | String (100, not null) | |
| telefonos | List\<TelefonoContacto\> | @ElementCollection |
| descripcion | TEXT | |
| icono | String (50) | Material Icon |
| categoria | String (50) | Seguridad, Emergencia, Salud |
| ordenPrioridad | Integer | |

### 5.8 `TelefonoContacto` (Embeddable)
| Campo | Tipo | Notas |
|---|---|---|
| numero | String (100, not null) | |
| esWhatsapp | boolean | default false |
| etiqueta | String (50) | |

### 5.9 `Visita`
| Campo | Tipo | Notas |
|---|---|---|
| id | Long (PK, auto) | |
| pagina | String (100, not null) | |
| fecha | LocalDate (not null) | |
| contador | Integer (not null) | default 1 |

### 5.10 `DiaSemana` (Enum)
`LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `VIERNES`, `SABADO`, `DOMINGO`

---

## 6. Seguridad

### 6.1 Arquitectura
- **Stateless** (sin sesiones HTTP)
- **JWT** en header `Authorization: Bearer <token>`
- **CORS** permitido desde `http://localhost:4200` (sitio público) y `http://localhost:4201` (panel admin)
- **CSRF** deshabilitado

### 6.2 `SecurityConfig`
- Define `SecurityFilterChain` con permisos públicos para `/auth/**` y `/api/**`
- Configura `DaoAuthenticationProvider` con `UserDetailsServiceImpl` y `BCryptPasswordEncoder`
- Agrega `JwtAuthenticationFilter` antes de `UsernamePasswordAuthenticationFilter`

### 6.3 `JwtProvider`
- **Secret:** `secretKeySanJose2026ConectarSJSeguraParaElProyectoBackend`
- **Expiración:** 24 horas (86400000 ms)
- **Algoritmo:** HS256
- Métodos: `generateToken`, `validateToken`, `getUsernameFromToken`

### 6.4 `JwtAuthenticationFilter`
- Filtro `OncePerRequestFilter`
- Extrae token del header `Authorization`
- Valida y establece `SecurityContext` con `UsernamePasswordAuthenticationToken`

### 6.5 `UserDetailsServiceImpl`
- Implementa `UserDetailsService`
- Busca `Administrador` por email en la base de datos
- Retorna un `User` de Spring Security (sin roles/authorities)

---

## 7. Endpoints de la API REST

### 7.1 Autenticación (`/auth`)

| Método | Ruta | Body | Respuesta | Descripción |
|---|---|---|---|---|
| POST | `/auth/login` | `{"email", "password"}` | `{"token": "jwt..."}` | Login, devuelve JWT |
| POST | `/auth/forgot-password` | `{"email"}` | `{"mensaje": "..."}` | Envía email con token de recuperación |
| POST | `/auth/reset-password` | `{"token", "password"}` | `{"mensaje": "..."}` | Cambia contraseña con token |

### 7.2 Sedes (`/api/sedes`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/sedes` | Lista todas |
| GET | `/api/sedes/{id}` | Obtiene por ID |
| POST | `/api/sedes` | Crea nueva |
| PUT | `/api/sedes/{id}` | Actualiza |
| DELETE | `/api/sedes/{id}` | Elimina |

### 7.3 Áreas (`/api/areas`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/areas` | Lista todas |
| GET | `/api/areas/{id}` | Obtiene por ID |
| POST | `/api/areas` | Crea nueva |
| PUT | `/api/areas/{id}` | Actualiza |
| DELETE | `/api/areas/{id}` | Elimina |

### 7.4 Actividades (`/api/actividades`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/actividades` | Lista todas ordenadas por fecha |
| GET | `/api/actividades/count` | Total de actividades |
| GET | `/api/actividades/paginated?page=0&size=20` | Lista paginada con DTO resumen |
| GET | `/api/actividades/{id}` | Obtiene por ID |
| POST | `/api/actividades` | Crea nueva |
| PUT | `/api/actividades/{id}` | Actualiza |
| DELETE | `/api/actividades/{id}` | Elimina |

### 7.5 Contactos de Emergencia (`/api/contactos`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/contactos` | Lista todos |
| GET | `/api/contactos/{id}` | Obtiene por ID |
| POST | `/api/contactos` | Crea nuevo |
| PUT | `/api/contactos/{id}` | Actualiza |
| DELETE | `/api/contactos/{id}` | Elimina |

### 7.6 Visitas (`/api/visitas`)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/api/visitas` | `{"pagina": "..."}` | Registra una visita |
| GET | `/api/visitas/stats` | — | Estadísticas (total, hoy, semana) |
| GET | `/api/visitas/stats/actividades` | — | Visitas agrupadas por actividad |

---

## 8. Servicios (Lógica de Negocio)

### 8.1 `AdministradorService`
- `registrar(admin)` — Hashea contraseña y guarda
- `verificarLogin(email, password)` — Verifica credenciales
- `procesarRecuperacionPassword(email)` — Genera token UUID (15 min), envía email
- `actualizarPasswordConToken(token, password)` — Resetea password si token válido
- Email recovery con fallback a console log

### 8.2 `SedeService`
- CRUD estándar, asigna sede a horarios hijos antes de guardar

### 8.3 `AreaService`
- CRUD estándar

### 8.4 `ActividadService`
- `obtenerTodasOrdenadas()` — JPQL ordenado por fecha, con `@Transactional(readOnly = true)`
- `obtenerPaginadas(pageable)` — Paginación JPQL, con `@Transactional(readOnly = true)`
- `obtenerResumenPaginado(pageable)` — Paginación con SQL nativo y `ActividadResumenDTO`
- `actualizar(id, datos)` — Merge manual de campos (transaccional)
- `cleanDuplicateHorarios()` — Limpieza de duplicados al iniciar (`@PostConstruct`)
- `asignarHorariosDefault()` — Migración automática (@PostConstruct): asigna un horario (10:00-12:00) a actividades sin horarios, distribuyendo el día según `id % 7`. Primero hace `UPDATE` de horarios existentes que coinciden con 10:00-12:00, luego `INSERT` para actividades que aún no tienen horarios.

### 8.5 `ContactoEmergenciaService`
- CRUD estándar
- `seedData()` — Pobla datos iniciales al arrancar (`@EventListener ApplicationReadyEvent`)

### 8.6 `VisitaService`
- `registrar(pagina)` — Incrementa contador por página/fecha
- `obtenerEstadisticas()` — Total, hoy, últimos 7 días
- `visitasPorActividad()` — Suma de visitas por actividad (parsea ID desde `actividad-{id}`)

### 8.7 `EmailService`
- Envío asíncrono (`@Async`) de emails vía `JavaMailSender`

---

## 9. DTOs

### `LoginRequest`
```java
private String email;
private String password;
```

### `JwtResponse`
```java
private String token;
```

### `ActividadResumenDTO` (Java Record)
```java
record ActividadResumenDTO(
    Long id, String titulo, String descripcion,
    LocalDate fechaInicio, LocalDate fechaFin,
    String status, String encargado,
    List<String> areaNombres, List<String> areaIconos,
    String sedeNombre, String horario, String telefono
)
```

---

## 10. Repositorios

| Repositorio | Entidad | Métodos destacados |
|---|---|---|
| `AdministradorRepository` | Administrador | `findByEmail`, `findByTokenRecuperacion` |
| `SedeRepository` | Sede | CRUD |
| `AreaRepository` | Area | CRUD |
| `ActividadRepository` | Actividad | `findAllOrdenadoPorAgenda` (JPQL+Pageable), `countTotal` |
| `ContactoEmergenciaRepository` | ContactoEmergencia | CRUD |
| `VisitaRepository` | Visita | `sumTotal`, `sumByFecha`, `sumDesde`, `sumPorActividad`, `findByPaginaAndFecha` |

---

## 11. Inicialización de Datos

Al arrancar la aplicación (`CommandLineRunner` en `ConectarSjBackendApplication`):
- Se crean dos administradores por defecto:
  - `admin@sanjose.com` / `admin123`
  - `jesiagr@gmail.com` / `admin1919`
- Solo se crean si no existen (por email único)

Al arrancar (`ApplicationReadyEvent` en `ContactoEmergenciaService.seedData()`):
- Se limpian y repueblan 8 contactos de emergencia (Policía, Bomberos, Hospital, Salud Mental, etc.)

---

## 12. Configuración de Correo

- **Host:** smtp.gmail.com (puerto 587, STARTTLS)
- **Usuario:** jesiagr@gmail.com (app password)
- Envío asíncrono con `@Async`
- Si falla el envío real, se imprime la URL de recuperación en consola

---

## 13. Base de Datos

- **Motor:** PostgreSQL (Supabase)
- **Pooler:** Transaction Pooler (`aws-1-us-east-1.pooler.supabase.com:6543`)
- **DDL:** Automático (`update`)
- **Esquema:** Tablas creadas automáticamente por Hibernate
- Tablas: `administrador`, `sedes`, `horarios_sede`, `areas`, `area_telefonos`, `actividades`, `actividad_areas`, `horarios_actividad`, `contactos_emergencia`, `contacto_telefonos`, `visitas`

---

## 14. CORS

Permitido desde `http://localhost:4200` (sitio público) y `http://localhost:4201` (panel administrativo) con métodos `GET, POST, PUT, DELETE, OPTIONS` y headers `Authorization, Cache-Control, Content-Type`.

Configurado en `SecurityConfig.java` mediante `CorsConfigurationSource`:

```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:4200",
    "http://localhost:4201"
));
```

---

## 15. Compilación y Ejecución

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

La aplicación arranca en `http://localhost:8080` por defecto.
