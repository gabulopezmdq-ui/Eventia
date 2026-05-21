# Plan de Implementación: Portal de Padres (Fullstack)

El objetivo es construir de manera robusta la arquitectura en .NET para el Portal del Participante (Backend) y detallar la integración y los contratos requeridos por el Frontend (Next.js), asegurando el mecanismo de "Soft Verification" mediante el email.

---

## 1. Backend: Base de Datos y Entidades

**Ya existe en la arquitectura:**
- La tabla y entidad `ef_programa_inscripciones` cuenta con la columna `token_consulta`.
- El DTO `ProgramaInscripcionConfirmarResponse` expone el `token_consulta`.

**Lo que falta y construiremos (Cambios propuestos):**
- **[NEW]** `API/DataSchema/ef_param_portal_secciones.cs`: Catálogo paramétrico de secciones del portal.
- **[NEW]** `API/DataSchema/ef_evento_portal_config.cs`: Configuración de visibilidad de secciones por cada evento.
- **[NEW]** `API/DataSchema/ef_evento_portal_fotos.cs`: Entidad para las fotos de la galería.
- **[MODIFY]** `API/DataSchema/DataContext.cs`: Agregado de los `DbSet` correspondientes.
- **[NEW]** `API/DataSchema/ModelConfiguration/ef_param_portal_seccionesConfiguration.cs` (y configuraciones equivalentes de FluentAPI).
- **[NEW]** `API/Scripts/MIGRACION_PORTAL_PADRES.sql`: Script SQL idempotente para crear las tablas y realizar el `INSERT` inicial de las secciones por defecto.

---

## 2. Backend: Controladores y Lógica

- **[MODIFY]** `API/Controllers/Programas/programasInscripcionController.cs`: 
  Al confirmar una inscripción, si `token_consulta` es `null`, se asignará uno automáticamente (ej. `Guid.NewGuid().ToString("N")`) y se guardará en base de datos.
- **[NEW]** `API/Controllers/Portal/portalController.cs`:
  Controlador público (`[AllowAnonymous]`) para resolver la vista y gestionar la validación suave (Soft Verification).

---

## 3. Integración Frontend (Contratos de Endpoints)

El frontend consumirá los siguientes endpoints expuestos por `portalController.cs`. A continuación se detalla qué debe enviar y qué recibirá.

### A. Endpoint de Inicio (Público)
Ruta: `GET /api/portal/{token_consulta}`

- **¿Qué envía el Frontend?**
  Solo el `token_consulta` proveniente de la URL como un parámetro de ruta. No requiere Headers de autenticación.

- **¿Qué recibe el Frontend?**
  Un objeto `PortalPublicoDTO` con información no sensible del evento y la configuración de las secciones habilitadas.
  ```json
  {
    "evento": {
      "nombre": "Colonia de Verano 2026",
      "fecha_inicio": "2026-12-01T00:00:00Z",
      "fecha_fin": "2026-12-31T00:00:00Z",
      "logo_url": "https://...",
      "estado": "ACTIVO"
    },
    "participante": {
      "nombre_responsable": "Juan",
      "apellido_responsable": "Pérez"
    },
    "secciones_habilitadas": [
      { "codigo": "RESUMEN", "orden": 1, "titulo": "Resumen General" },
      { "codigo": "SALUD", "orden": 2, "titulo": "Ficha Médica" },
      { "codigo": "FOTOS", "orden": 3, "titulo": "Galería de Fotos" }
    ]
  }
  ```

### B. Endpoint de Verificación Suave (2FA)
Ruta: `POST /api/portal/{token_consulta}/verificar`

Cuando el padre intente acceder a una sección sensible (como la Galería de Fotos o Salud), el frontend desplegará un prompt pidiendo su Email de acceso. 

- **¿Qué envía el Frontend?**
  Body (`PortalVerificarRequest`):
  ```json
  {
    "email": "juan.perez@example.com"
  }
  ```

- **Lógica Backend:** El backend comprueba si el `email` proporcionado coincide (ignoring case) con el `responsable_email` de la inscripción mapeada por ese token.

- **¿Qué recibe el Frontend?**
  Body (`PortalVerificarResponse`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..." // JWT Temporal de Sesión (Válido por ej. 24 hs)
  }
  ```

### C. Endpoints Sensibles (Protegidos por el JWT Temporal)
Rutas de ejemplo: 
- `GET /api/portal/salud`
- `GET /api/portal/fotos`

- **¿Qué envía el Frontend?**
  Debe enviar en los Headers la autorización usando el Bearer Token obtenido en la verificación suave:
  `Authorization: Bearer <JWT_Temporal>`

- **¿Qué recibe el Frontend?**
  Listados detallados según la sección. Por ejemplo, para `/fotos`:
  ```json
  [
    {
      "id_foto": 120,
      "url_foto": "https://...",
      "titulo": "Día de pileta",
      "fecha_foto": "2026-05-20"
    }
  ]
  ```

---

## 4. Próximos Pasos (Fase de Ejecución)

1. Crear y ejecutar el Script SQL en la base de datos para levantar las tablas `ef_param_portal_secciones`, `ef_evento_portal_config` y `ef_evento_portal_fotos`.
2. Crear los modelos en la capa `DataSchema` de .NET.
3. Crear los DTOs definidos para los contratos del Frontend.
4. Desarrollar el `portalController.cs` implementando la lógica de "Soft Verification".
