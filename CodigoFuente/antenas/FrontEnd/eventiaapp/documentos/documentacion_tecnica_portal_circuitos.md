# Eventia – Gestión del Portal: Mi Eventia y Portal Puntual (B2C/B2B)

## Objetivo
Explicar el funcionamiento integral del circuito del portal en Eventia para el equipo de frontend. El objetivo es:
- Entender la diferencia entre **Mi Eventia** y el **Portal Puntual**.
- Entender el mecanismo de **Desbloqueo Sensible** (Seguridad OTP).
- Entender el mecanismo de **Recuperación de Acceso**.
- Saber qué endpoints llamar y en qué orden.
- Saber cómo interpretar los datos para mostrar u ocultar elementos en pantalla.

---

## 1. Conceptos Básicos

Para que el invitado o participante pueda interactuar con el sistema, existen dos capas de visualización:

1. **Mi Eventia (Dashboard Persistente):** 
   Es la "billetera" o espacio unificado del usuario. Se asocia a un correo electrónico o teléfono celular. Muestra todas las "cards" (accesos) a los distintos programas o eventos a los que esa persona está vinculada. 
   - **Token:** Se identifica con un GUID largo llamado `token_portal`.

2. **Portal Puntual (Detalle del Evento/Programa):** 
   Es la vista específica de un solo evento o programa. Aquí se ven las secciones habilitadas (resumen, agenda, pagos, salud, fotos, etc.). 
   - **Token:** Se identifica con un string alfanumérico llamado `token_consulta` (para programas) o `rsvp_token` (para eventos).

3. **Desbloqueo Sensible:** 
   Algunas secciones del portal puntual (Salud, QRs de Retiro, Fotos de menores, Autorizaciones) contienen información crítica. Por defecto, el portal puntual es público para quien tenga el link. Para ver información crítica, el usuario debe validar su identidad mediante un código enviado por Email o WhatsApp (OTP).

---

## 2. Tablas que intervienen en el Backend (Contexto)

Para que el backend orqueste esto, utiliza las siguientes tablas (como referencia para entender de dónde sale la info):

- **`ef_portal_personas`:** Guarda la identidad unificada (Nombre, Email, Teléfono, y el `token_portal`).
- **`ef_portal_accesos`:** Relaciona a una persona con múltiples inscripciones o invitaciones. Guarda el `token_consulta` de cada una.
- **`ef_portal_validaciones`:** Tabla temporal que guarda los códigos OTP (6 dígitos) generados para el "Desbloqueo Sensible". Expiran en 10 minutos.
- **`ef_portal_recuperacion_tokens`:** Tabla temporal que guarda los links de recuperación cuando un usuario pierde el acceso a "Mi Eventia". Expiran en 15 minutos.

---

## 3. Flujo 1: Finalizar Inscripción

Cuando el responsable confirma la inscripción en el evento (`POST /programas/inscripcion/{token}/confirmar`), el backend responderá con la siguiente estructura. Esto indica al front a dónde debe dirigir al usuario.

**Endpoint:**
`POST /programas/inscripcion/{token}/confirmar`

**Respuesta del Backend:**
```json
{
  "ok": true,
  "id_inscripcion": 12,
  "token_consulta": "TOKEN_PORTAL_PROGRAMA",
  "url_portal": "/portal/TOKEN_PORTAL_PROGRAMA",
  "token_portal": "TOKEN_MI_EVENTIA",
  "url_mi_eventia": "/mi-eventia/TOKEN_MI_EVENTIA"
}
```

### Qué debe hacer el Front:
Pantalla final de "Inscripción confirmada".
- **Botón “Ver mi portal”:** Redirige al usuario a la ruta `url_mi_eventia` (`/mi-eventia/TOKEN_MI_EVENTIA`).
- **Botón “Copiar link”:** Copia en el portapapeles la ruta absoluta (ej. `https://eventiaapp.com/mi-eventia/TOKEN_MI_EVENTIA`).
- **Botón “Guardar acceso en mi celular”:** Lanza el prompt para instalar la PWA (Add to Home Screen).

---

## 4. Flujo 2: Acceder a Mi Eventia

El usuario ingresa mediante su enlace permanente (desde el acceso guardado en su celular o desde un link).

**Endpoint:**
`GET /mi-eventia/{tokenPortal}`

**Respuesta del Backend:**
```json
{
  "persona": {
    "id_portal_persona": 1,
    "nombre": "Laura García",
    "email": "laura.garcia@test.com",
    "telefono": "+34600111222"
  },
  "items": [
    {
      "tipo": "PROGRAMA",
      "id_evento": 34,
      "id_inscripcion": 12,
      "id_invitado": null,
      "token_consulta": "TOKEN_PORTAL_PROGRAMA",
      "titulo": "Casal d’estiu Aquamar 2026",
      "estado": "ACTIVO",
      "url_portal": "/portal/TOKEN_PORTAL_PROGRAMA"
    }
  ]
}
```

### Qué debe hacer el Front:
Renderizar la cabecera con el nombre de la persona (`persona.nombre`).
Listar una "Card" por cada elemento del arreglo `items`.
- Si toca la Card, debe navegar a la ruta local especificada en `url_portal` (que renderizará el Portal Puntual).

---

## 5. Flujo 3: El Portal Puntual y los Datos Sensibles

Cuando el usuario ingresa al detalle de su evento o programa, se consulta el Portal Puntual.

**Endpoint:**
`GET /api/portal/{tokenConsulta}?idIdioma=1`
*(Nota: `idIdioma` es opcional. 1=Español, 4=Portugués, 5=Checo, etc.)*

**Respuesta del Backend:**
```json
{
  "tipoPortal": "PROGRAMA",
  "idEvento": 34,
  "evento": {
    "titulo": "Casal d’estiu Aquamar 2026",
    "fechaInicio": "2026-06-22",
    "fechaFin": "2026-09-04"
  },
  "usuario": {
    "nombre": "Laura García",
    "email": "laura.garcia@test.com"
  },
  "requiere_desbloqueo_sensible": true,
  "desbloqueado_sensible": false,
  "url_mi_eventia": "/mi-eventia/TOKEN_MI_EVENTIA",
  "secciones": [
    {
      "codigo": "RESUMEN",
      "titulo": "Resumen",
      "visible": true,
      "orden": 1,
      "requiere_desbloqueo": false
    },
    {
      "codigo": "SALUD",
      "titulo": "Salud",
      "visible": true,
      "orden": 8,
      "requiere_desbloqueo": true
    }
  ],
  "data": {
    "resumen": {},
    "pagos": {},
    "salud": null,
    "qrsRetiro": null
  }
}
```

### Cómo lo interpreta el Front (Lógica de Renderizado):

El backend devuelve en la propiedad `data` los datos agrupados por sección. Observar el estado combinado de `requiere_desbloqueo_sensible` y `desbloqueado_sensible`.

#### Caso A — Portal General sin Seguridad Activa
Si `requiere_desbloqueo_sensible = false`:
El portal no tiene activada ninguna sección crítica (ej. es un portal solo de Pagos y Resumen).
**Qué hace el Front:** Renderiza todas las pestañas de las `secciones` devueltas de manera normal. Los campos en `data` tendrán los JSON correspondientes y no habrá `null`.

#### Caso B — Portal Bloqueado (Falta OTP)
Si `requiere_desbloqueo_sensible = true` Y `desbloqueado_sensible = false`:
Significa que hay secciones críticas pero el usuario no ha validado que es él.
**Qué hace el Front:**
1. Renderiza el Menú y las secciones "públicas" (donde `requiere_desbloqueo = false`). Para estas secciones, el backend envía la data real en `data.resumen` o `data.pagos`.
2. Para las secciones "sensibles" (`requiere_desbloqueo = true`), el backend, por seguridad, envía un valor explícito `null` en `data.salud`, `data.qrsRetiro`, etc.
3. El frontend debe mostrar un **Banner Global** o un "candado" en las pestañas sensibles con el texto: *"Para visualizar la información de Salud o Retiros, valida tu identidad"*. Al tocar, se dispara el **Flujo 4 (Desbloqueo)**.

#### Caso C — Portal Desbloqueado (OTP Validad0)
Si `requiere_desbloqueo_sensible = true` Y `desbloqueado_sensible = true`:
El usuario validó correctamente el código hace menos de 12 horas.
**Qué hace el Front:** Renderiza absolutamente todo normalmente. El backend enviará toda la info hidratada (no habrá `null` en `data.salud`).

---

## 6. Flujo 4: Desbloqueo de Datos Sensibles (OTP)

Cuando el usuario en el **Caso B** hace clic en "Desbloquear", se ejecuta este circuito:

### Paso 1: Solicitar Código
**Endpoint:** `POST /api/portal/{tokenConsulta}/solicitar-codigo`

**Body:**
```json
{
  "canal": "EMAIL" 
}
```
*(Canales soportados: "EMAIL" o "WHATSAPP")*

**Response:**
```json
{
  "ok": true,
  "mensaje": "Te enviamos un código de validación.",
  "codigo_dev": "123456"
}
```
*(Nota: `codigo_dev` se envía momentáneamente para facilitar pruebas en QA. Ignorarlo o quitarlo en producción).*

### Paso 2: Validar Código
El front muestra un input de 6 dígitos al usuario.

**Endpoint:** `POST /api/portal/{tokenConsulta}/validar-codigo`

**Body:**
```json
{
  "codigo": "123456"
}
```

**Response:**
```json
{
  "ok": true,
  "desbloqueado": true,
  "mensaje": "Portal desbloqueado correctamente."
}
```

### Paso 3: Refrescar Portal
Una vez recibida la respuesta exitosa (`ok: true`), el front **debe volver a invocar automáticamente** `GET /api/portal/{tokenConsulta}`. 
Esta vez, el backend sabrá que la sesión (por IP/Token en la base de datos) está validada y responderá con `desbloqueado_sensible: true`, entregando toda la info de Salud y Retiros en el nodo `data`.

---

## 7. Flujo 5: Recuperación de Acceso a Mi Eventia

Ocurre cuando el padre/madre/invitado perdió el link de "Mi Eventia" y quiere volver a ingresar desde `eventiaapp.com/ingresar`.

### Paso 1: Pedir Link
**Endpoint:** `POST /mi-eventia/recuperar`

**Body:**
```json
{
  "email": "laura.garcia@test.com",
  "telefono": null,
  "canal": "EMAIL"
}
```

**Response:**
```json
{
  "ok": true,
  "mensaje": "Si encontramos un acceso asociado, enviaremos las instrucciones.",
  "token_recuperacion": "abc12345..."
}
```

### Paso 2: Validar Recuperación
Generalmente el usuario llega a través de un link que contenía el `token_recuperacion` (ej: `/recuperar?token=abc12345...`) y un código en el mail.

**Endpoint:** `POST /mi-eventia/validar-recuperacion`

**Body:**
```json
{
  "token_recuperacion": "abc12345...",
  "codigo": "123456"
}
```

**Response:**
```json
{
  "ok": true,
  "token_portal": "TOKEN_MI_EVENTIA_REAL",
  "url_mi_eventia": "/mi-eventia/TOKEN_MI_EVENTIA_REAL"
}
```

### Qué debe hacer el Front:
Si la validación es correcta, redirigir automáticamente al usuario al dashboard de `url_mi_eventia` para que pueda ver todas sus inscripciones (Flujo 2).
