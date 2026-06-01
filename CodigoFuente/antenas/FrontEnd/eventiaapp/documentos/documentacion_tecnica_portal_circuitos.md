# Documentación Técnica: Circuito Cerrado del Portal (Mi Eventia y Portal Puntual)

El presente documento detalla el ciclo completo de la interacción del FrontEnd con los endpoints de los distintos controladores de Eventia. Incluye el flujo de "Mi Eventia" (acceso persistente), el "Portal Puntual" (por evento o programa) y los mecanismos de "Desbloqueo Sensible" y "Recuperación de Acceso".

---

## 1. Conceptos y Tipos de Entradas

* **Inscripción Pública:** `GET /programas/inscripcion/{token}`
  * Endpoint público donde el usuario se anota. Al finalizar, el backend devuelve los tokens que dan inicio al circuito del portal.
* **Portal Puntual:** `GET /api/portal/{tokenConsulta}`
  * Endpoint de consulta rápida. El token puede ser un `token_consulta` (programa) o un `rsvp_token` (invitado).
* **Mi Eventia:** `GET /mi-eventia/{tokenPortal}`
  * Acceso unificado de familia / invitado. Agrupa todas las inscripciones o eventos relacionados con el correo/teléfono.

---

## 2. Flujo 1: Finalizar Inscripción

Cuando el responsable confirma la inscripción en el evento (`POST /programas/inscripcion/{token}/confirmar`), el backend responderá con la siguiente estructura. Esto indica al front a dónde debe dirigir al usuario.

**Response Esperado:**
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

* **Acción sugerida para Front:** Mostrar botones: "Ver mi portal" (Abre `url_mi_eventia`), "Guardar acceso en el celular" y "Copiar Link".

---

## 3. Flujo 2: Acceder a Mi Eventia

El usuario ingresa mediante su enlace permanente.

### `GET /mi-eventia/{tokenPortal}`
Obtiene los datos del responsable y todas las "cards" (accesos) que tiene disponibles.

**Response:**
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

* **Acción sugerida para Front:** Renderizar una card por cada elemento en `items`. Al hacer click, redirigir a la URL indicada en `url_portal`.

---

## 4. Flujo 3: El Portal Puntual y los Datos Sensibles

Cuando el usuario ingresa al detalle de su evento o programa, se consulta el Portal Puntual.

### `GET /api/portal/{tokenConsulta}`
Este endpoint devuelve *todo* el árbol de la aplicación. 

**Query Params:** `?idIdioma=1` (Opcional, por defecto 1 - Español). Para portugués usar 4, checo 5, etc.

**Response:**
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

> **Nota:** Si `desbloqueado_sensible` es `false`, el backend bloqueará automáticamente la salida enviando `null` en `data.salud`, `data.qrsRetiro`, `data.fotos`, etc.

* **Acción sugerida para Front:** Si `requiere_desbloqueo_sensible == true` y `desbloqueado_sensible == false`, dibujar un banner o botón invitando al usuario a validar su identidad para ver datos bloqueados.

---

## 5. Flujo 4: Desbloqueo de Datos Sensibles (OTP)

Si el usuario quiere ver los QR o datos de salud, se debe lanzar este circuito. Consta de dos pasos (Solicitar y Validar).

### Paso 1: `POST /api/portal/{tokenConsulta}/solicitar-codigo`
El backend ubica al responsable de la inscripción (o invitado) y envía un OTP por email/WhatsApp.

**Request (Body):**
```json
{
  "canal": "EMAIL" 
}
```
*(Valores permitidos para canal: "EMAIL" o "WHATSAPP")*

**Response:**
```json
{
  "ok": true,
  "mensaje": "Te enviamos un código de validación.",
  "codigo_dev": "123456"
}
```
*(Nota: `codigo_dev` se envía momentáneamente para pruebas. Durante desarrollo, siempre ingresa ese código).*

### Paso 2: `POST /api/portal/{tokenConsulta}/validar-codigo`
El front solicita el código al usuario y lo envía al backend.

**Request (Body):**
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

* **Acción sugerida para Front:** Una vez recibida esta respuesta (`ok: true`), el front debe **volver a invocar automáticamente** `GET /api/portal/{tokenConsulta}`. Esta vez, el backend sabrá que la sesión fue validada y responderá con `desbloqueado_sensible: true`, poblando `data.salud`, `data.qrsRetiro`, etc., con arreglos vacíos o información hidratada.

---

## 6. Flujo 5: Recuperación de Acceso a Mi Eventia

Para el caso en el que el responsable pierde su URL `/mi-eventia/TOKEN`.

### Paso 1: `POST /mi-eventia/recuperar`
Solicita un enlace de recuperación ingresando el email o teléfono con el que se inscribió.

**Request (Body):**
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

### Paso 2: `POST /mi-eventia/validar-recuperacion`
Generalmente el usuario llega a través de un link que contenía ese token y un código (opcional) enviado al email.

**Request (Body):**
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

* **Acción sugerida para Front:** Guardar el nuevo token recuperado y redirigir al usuario al dashboard de `url_mi_eventia`.
