# Guía de Implementación: Límites de Plan (Frontend)

Este documento resume los cambios realizados en el Backend y proporciona las pautas para adaptar el Frontend de Eventia a las nuevas restricciones comerciales.

## 1. Resumen de Cambios en el Backend
Se ha centralizado la validación de límites comerciales. Los siguientes endpoints ahora devuelven errores si el plan del usuario no permite la acción o si el evento no está `ACTIVO`:

- `POST /evento_links/Create`: Valida `PERMITIR_GENERAR_LINKS`.
- `POST /Invitacion/CrearLinkGenerico`: Valida `PERMITIR_GENERAR_LINKS` y `MAX_LINKS_ACCESO`.
- `POST /EventoCaptacionLinks/Upsert`: Valida `PERMITIR_GENERAR_LINKS` y `MAX_LINKS_ACCESO`.
- `PUT /EventoCaptacionLinks/SetActivo`: Valida límites al intentar activar un link.
- `PUT /evento_tramos/{id}`: Valida `PERMITIR_ESTRUCTURA_MANUAL`.

---

## 2. Detalle de Endpoints y Payloads

### A. Links Genéricos (Generic Links)
**Endpoint:** `POST /evento_links/Create`

**Request Body:**
```json
{
  "id_evento": 123,
  "tipo": "DJ_MUSICA",
  "scopes": ["MUSICA_READ", "EXPORT"],
  "descripcion": "Link para el DJ",
  "vence_en_dias": 30
}
```
**Response (200 OK):**
```json
{
  "id_evento_link": 456,
  "id_evento": 123,
  "tipo": "DJ_MUSICA",
  "token": "aBcD123...",
  "scopes": "[\"MUSICA_READ\",\"EXPORT\"]",
  "descripcion": "Link para el DJ",
  "fecha_vencimiento": "2024-06-14T12:00:00Z",
  "activo": true
}
```

---

### B. Links de Invitación Genéricos
**Endpoint:** `POST /Invitacion/CrearLinkGenerico`

**Request Body:**
```json
{
  "id_acceso": 789,
  "titulo": "Invitación General",
  "max_personas_total": 50,
  "max_adultos": 50,
  "requiere_nombres_acompanantes": true
}
```
**Response (200 OK):** `"TOKEN_GENERADO_64_CHARS"`

---

### C. Links de Captación / Audiencia (Upsert)
**Endpoint:** `POST /EventoCaptacionLinks/Upsert`

**Request Body:**
```json
{
  "id_acceso_link": 0, 
  "id_acceso": 789,
  "titulo": "Campaña Instagram",
  "max_personas_total": 100,
  "es_captacion_publica": true,
  "activo": true
}
```
*(Nota: id_acceso_link: 0 o null para crear uno nuevo)*

**Response (200 OK):**
```json
{
  "id_acceso_link": 101,
  "id_evento": 123,
  "token": "XyZ987...",
  "activo": true,
  "...": "otros campos del DTO"
}
```

---

### D. Edición Manual de Tramos
**Endpoint:** `PUT /evento_tramos/{id_tramo}`

**Request Body:**
```json
{
  "nombre": "Cena de Gala",
  "fecha_hora_inicio": "2024-12-31T22:00:00Z",
  "orden": 2,
  "activo": true
}
```
**Response (200 OK):** Objeto del tramo actualizado.

---

## 3. Manejo de Errores de API
Cuando un límite es excedido, la API devolverá:
- **Status Code:** `400 Bad Request` o `403 Forbidden` (dependiendo del contexto).
- **Cuerpo del Error:**
  ```json
  { "error": "Tu plan no permite generar links. Actualizá el plan para enviar invitaciones." }
  ```
  O para servicios que usan excepciones genéricas:
  ```json
  { "message": "Tu plan permite hasta 5 invitados..." }
  ```

**Recomendación:** Implementar un interceptor o un manejador global que capture estos mensajes y los muestre en un **Toast** o **Modal de Suscripción**.

## 3. Adaptaciones paso a paso en el UI

### A. Creación de Eventos (Dashboard)
Los eventos nuevos ahora pueden nacer con el link principal **inactivo** (especialmente en B2C_FREE o si el evento nace en estado Pendiente).
- **Indicación:** Si el link principal está inactivo, mostrar un aviso al usuario explicando que debe activar el evento o mejorar su plan para habilitar la invitación.

### B. Gestión de Links / Captación
Antes de permitir que el usuario abra el modal de "Nuevo Link":
1. Verificar si el plan lo permite (idealmente a través de un objeto de configuración del evento que traiga los límites).
2. Si el backend rechaza la creación, mostrar el mensaje de error directamente en el modal o bloquear el botón de "Guardar".

### C. Edición de Tramos (Estructura)
En el plan `B2C_FREE`, la edición manual de tramos (nombres, horarios, lugares) está restringida.
- **Indicación:** Si el usuario intenta guardar cambios en un tramo y recibe un error de límite, sugerir el uso de plantillas o el upgrade de plan.
- **Ideal:** Bloquear los inputs o mostrar un icono de "candado" en la edición de tramos si el límite `PERMITIR_ESTRUCTURA_MANUAL` es 0.

### D. Aplicación de Plantillas
- **Indicación:** Si el botón de "Aplicar Plantilla" devuelve error, informar que el plan actual tiene restricciones sobre el uso de plantillas predefinidas.

## 4. Mejores Prácticas
1. **No Hardcodear:** No uses `plan == 'B2C_FREE'` en el Frontend.
2. **Uso de Flags:** El endpoint de `GetEvento` (o el de estructura) debería ser actualizado para devolver un objeto `limites` con booleanos y valores (ej: `permitirGenerarLinks: false`, `maxInvitados: 5`).
3. **Upsell Dinámico:** Siempre que se bloquee una acción, ofrece un link directo a la página de planes/precios.

---
**Contacto:** Para dudas sobre los códigos de error específicos (`PERMITIR_GENERAR_LINKS`, `MAX_INVITADOS`, etc.), consultar la tabla `ef_param_limites` en la base de datos.
