# Conectar San José

Plataforma municipal de gestión y difusión de actividades, servicios y recursos de la ciudad de San José, Entre Ríos.

## Arquitectura

```
ConectarSanJose/
├── backend/                          # Spring Boot 3.5.14 + Java 21 + PostgreSQL
│   ├── src/main/java/.../backend/
│   │   ├── config/                   # Seguridad JWT, CORS
│   │   ├── controller/               # REST controllers
│   │   ├── dto/                      # DTOs
│   │   ├── model/                    # JPA entities
│   │   ├── repository/               # Spring Data JPA
│   │   └── service/                  # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── conectar-sj/                  # Admin panel (Angular 21, puerto 4201)
│   └── conectar-angular/             # Public website (Angular 21, puerto 4200)
└── start-all.bat                     # Inicia los 3 servicios
```

## Inicio rápido

```bash
start-all.bat
# o manualmente:
# backend:    mvn spring-boot:run          → http://localhost:8080
# admin:      ng serve --port 4201         → http://localhost:4201
# publico:    ng serve (en conectar-angular) → http://localhost:4200
```

## Documentación

- [Backend](backend/docBackend.md)
- [Frontend](frontend/docFrontend.md)
