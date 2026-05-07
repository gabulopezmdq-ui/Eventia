# Documentación Técnica – Sistema de **Staff** (Personal) y **Unidades**

> **Objetivo**: describir paso a paso el flujo del backend y del frontend para la gestión de **staff** (personal) en eventos y cuentas, cubriendo los tres casos de uso:
> 1️⃣ **Eventos personales** – staff asignado a un único evento.
> 2️⃣ **Eventos de cuenta (B2B)** – staff con acceso a varios eventos de la misma cuenta.
> 3️⃣ **Programas** – staff vinculado a unidades / programas dentro de una cuenta.

---

## 1️⃣  Backend – Detalle técnico

### 1.1  Modelo de datos (esquema)

| Tabla | Campos clave | Comentario |
|-------|--------------|------------|
| **ef_staff** | `id_staff (PK)`, `codigo (8 ctrs)`, `nombre`, `apellido`, `email`, `telefono`, `id_cuenta`, `rol` (`STAFF_DJ`, `STAFF_MESERO`, …), `activo`, `fecha_expiracion`, `fecha_alta`, `fecha_modif` | Cada registro representa a un individuo de staff. |
| **ef_staff_unidades** | `id_staff_unidad (PK)`, `id_staff (FK → ef_staff)`, `id_unidad (FK → ef_cuenta_unidades)`, `activo`, `fecha_alta`, `fecha_modif` | Relación N‑M: un staff puede pertenecer a varias unidades (p. ej. “Bar 1”, “Cocina”, “Sombra”). |
| **ef_cuentas** | `id_cuenta (PK)`, `nombre_cuenta`, `tipo = 'B2B'`, … | Cada cuenta B2B es el “tenant” que agrupa unidades y staff. |
| **ef_unidades** | `id_unidad (PK)`, `id_cuenta (FK)`, `nombre_unidad`, `activo` | Organización física / lógica dentro de la cuenta. |
| **ef_eventos** | `id_evento (PK)`, `id_cuenta (FK)`, `id_unidad (FK)`, `estado`, `es_publico`, … | Eventos pueden estar asociados a una cuenta (B2B) o a un staff (personal). |

> **Nota de integridad**: los FK están configurados con `ON DELETE RESTRICT` para evitar que se pierda la relación staff ↔ unidad sin una eliminación explícita.

### 1.2  Generación del código de acceso (StaffService)

```csharp
// Patrón: CCRRNNNN
//   CC  = 2 primeras letras del nombre de la cuenta (uppercase)
//   RR  = 2 primeras letras del rol (ej. DJ, ME)
//   NNNN= 4 dígitos aleatorios (0000‑9999)
private string GenerarCodigoStaff(string nombreCuenta, string rol)
{
    var prefijoCuenta = nombreCuenta.Substring(0, 2).ToUpperInvariant();
    var prefijoRol    = rol.Substring(0, 2).ToUpperInvariant();
    string codigo;
    do
    {
        var num = RandomNumberGenerator.GetInt32(0, 10000)
                    .ToString("D4");
        codigo = $"{prefijoCuenta}{prefijoRol}{num}";
    }
    while (await _context.ef_staff.AnyAsync(s => s.codigo == codigo));
    return codigo;
}
```

* **Unicidad** garantizada mediante la verificación contra `ef_staff`.
* **Colisión casi imposible**: 10 000 combinaciones por cuenta‑rol, y el prefijo varía por tenant.

### 1.3  Registro de staff (admin)

**Endpoint:** `POST /staff` (protección `ROLE = ACCOUNT_ADMIN`)

| JSON de solicitud | Campos obligatorios | Comentario |
|-------------------|---------------------|------------|
| `{ "nombre":"Juan", "apellido":"Perez", "email":"j.p@demo.com", "telefono":"+5411...", "id_cuenta":7, "rol":"STAFF_DJ", "unidades":[1,3,5] }` | `nombre`, `apellido`, `id_cuenta`, `rol`, `unidades` | `unidades` es un array de `id_unidad` (FK a `ef_cuenta_unidades`). |

**Respuesta (201 Created):**

```json
{
  "id_staff": 124,
  "codigo": "ACDJ3521",
  "activo": true,
  "fecha_expiracion": "2027-03-01T00:00:00Z"
}
```

* El **código** se devuelve una única vez; el staff lo usará para login.
* Se crea una fila en `ef_staff_unidades` por cada unidad enviada.

### 1.4  Autenticación del staff (login)

**Endpoint:** `POST /staff/login`

| JSON | Campos |
|------|--------|
| `{ "codigo":"ACDJ3521" }` | `codigo` (mayúsculas) |

**Proceso interno**

1. Busca `ef_staff` por `codigo`.
2. Verifica `activo = true` y `fecha_expiracion > now`.
3. Genera **JWT** con claim:

```json
{
  "sub": "staff_124",
  "id_staff": 124,
  "id_cuenta": 7,
  "role": "STAFF_DJ",
  "is_staff": true,
  "exp": 170XXXXXXX   // 12 h desde emisión
}
```

* **Firma**: `HS256` usando `Jwt:Key` del `appsettings.json`.
* **Uso posterior**: el token se envía en `Authorization: Bearer <token>` y es validado por el middleware JWT del API.

### 1.5  Endpoints de CRUD (admin)

| Método | Ruta | Permisos | Funcionalidad |
|--------|------|----------|---------------|
| `GET /staff/{id}` | `ACCOUNT_ADMIN` (solo del mismo `id_cuenta`) | Detalle del staff, incluye unidades vinculadas. |
| `PUT /staff/{id}` | `ACCOUNT_ADMIN` | Actualiza datos personales y unidades. Se valida que las unidades pertenezcan a la misma cuenta. |
| `DELETE /staff/{id}` | `ACCOUNT_ADMIN` | Marca `activo = false` y elimina filas de `ef_staff_unidades`. |
| `GET /staff/unidades/{id_cuenta}` | `ACCOUNT_ADMIN` | Lista todos los staff y sus unidades para la cuenta. |
| `GET /staff/miembros?eventoId=XX` | **Staff (cualquier rol)** | Devuelve los staff que pueden ver el evento indicado (filtrado por unidades asociadas al evento). |
## 1.5.1 Detalle de Endpoints

### `POST /staff`
**Propósito**: crear un nuevo staff.
**Permisos**: `ACCOUNT_ADMIN`.
**Body (JSON)**:
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "j.p@demo.com",
  "telefono": "+541123456789",
  "id_cuenta": 7,
  "rol": "STAFF_DJ",
  "unidades": [1,3,5]
}
```
**Respuesta (201)**:
```json
{
  "id_staff": 124,
  "codigo": "ACDJ3521",
  "activo": true,
  "fecha_expiracion": "2027-03-01T00:00:00Z"
}
```

### `POST /staff/login`
**Propósito**: autenticar staff mediante su código y obtener JWT.
**Body**:
```json
{ "codigo": "ACDJ3521" }
```
**Respuesta (200)**:
```json
{ "token": "<jwt>" }
```

### `GET /staff/{id}`
**Propósito**: obtener detalle de un staff y sus unidades.
**Headers**: `Authorization: Bearer <jwt>` (admin).
**Respuesta**:
```json
{
  "id_staff":124,
  "nombre":"Juan",
  "apellido":"Perez",
  "email":"j.p@demo.com",
  "telefono":"+541123456789",
  "id_cuenta":7,
  "rol":"STAFF_DJ",
  "activo":true,
  "unidades":[ { "id_unidad":1,"nombre":"Bar Principal" } ]
}
```

### `PUT /staff/{id}`
**Propósito**: actualizar datos del staff y sus unidades.
**Body** (ejemplo parcial):
```json
{
  "email":"nuevo@email.com",
  "unidades":[2,4]
}
```
**Respuesta (200)**: `{ "ok": true }`

### `DELETE /staff/{id}`
**Propósito**: desactivar staff (soft‑delete).
**Respuesta (200)**: `{ "ok": true }`

### `GET /staff/unidades/{id_cuenta}`
**Propósito**: listar todos los staff de una cuenta con sus unidades.
**Respuesta**:
```json
[
  {
    "id_staff":124,
    "nombre":"Juan",
    "unidades":[ { "id_unidad":1,"nombre":"Bar" } ]
  },
  { ... }
]
```

### `GET /staff/miembros?eventoId=XX`
**Propósito**: obtener staff que pueden ver un evento concreto.
**Respuesta**:
```json
[
  { "id_staff":124, "nombre":"Juan" },
  { "id_staff":130, "nombre":"Ana" }
]
```

### `GET /eventos?staffId={id}`
**Propósito**: obtener eventos personales del staff.
**Respuesta**: array de eventos (ver sección 2.4.1).

### `GET /eventos?cuentaId={id}&unidades=1,3,5`
**Propósito**: obtener eventos de cuenta filtrados por unidades.
**Respuesta**: array de eventos.

### `GET /programas?cuentaId={id}&unidades=1,3`
**Propósito**: obtener programas accesibles por unidades.
**Respuesta**: array de programas.

### `POST /eventos/{id}/checkin`
**Propósito**: registrar presencia del staff en un evento.
**Body**: vacío.
**Respuesta**: `{ "ok": true, "hora": "2026-05-06T10:15:00Z" }`

### `PATCH /staff/{id}`
**Propósito**: cambiar disponibilidad o expiración (auto‑service).
**Body**:
```json
{ "activo": false }
```
**Respuesta**: `{ "ok": true }`

---
### 1.6  Seguridad y validaciones

| Tema | Implementación |
|------|----------------|
| **Autorización por cuenta** | Cada endpoint verifica `User.GetUserId()` → `id_staff` → `id_cuenta` y compara con la cuenta del recurso. |
| **RBAC** | Roles definidos en `RolesCodigo.cs`: `ACCOUNT_ADMIN`, `STAFF_DJ`, `STAFF_MESERO`, …; los atributos `[Authorize(Roles = "...")]` se aplican en el controlador. |
| **Expiración del token** | Middleware JWT rechaza tokens expirados; el cliente debe volver a autenticarse con su código. |
| **Rate‑limit** (opcional) | Se puede agregar `AspNetCoreRateLimit` para limitar intentos de login a 5 por minuto. |
| **Auditoría** | Cada cambio (alta, baja, edición) escribe en `ef_auditoria_staff` (no mostrada aquí) con `usuario_admin`, `fecha`, `acción`. |

---

## 2️⃣  Flujo de integración frontend (mobile/web)

### 2.1  Paso 1 – Pantalla de ingreso

1. **Input** de 8 caracteres (type=`text`, `autocapitalize="characters"`).
2. **Validación** en cliente:
   * Longitud exacta de 8.
   * Sólo alfanumérico (A‑Z, 0‑9).
   * Convertir a mayúsculas automáticamente (`toUpperCase()`).

**Ejemplo UI (React):**

```tsx
const [code, setCode] = useState('');
<input
  maxLength={8}
  value={code}
  onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''))}
  placeholder="Código staff (8 caracteres)"
/>
```

### 2.2  Paso 2 – Llamada de login

```ts
const login = async (code:string) => {
  const res = await fetch(`${API_URL}/staff/login`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({codigo:code})
  });
  if (!res.ok) throw new Error('Código inválido');
  const data = await res.json();
  await SecureStore.setItemAsync('staffToken', data.token);
  const payload = JSON.parse(atob(data.token.split('.')[1]));
  setUser({idStaff:payload.id_staff, role:payload.role, cuentaId:payload.id_cuenta});
};
```

### 2.3  Paso 3 – Navegación basada en **unidades**

* El cliente recupera la **lista de unidades** accesibles mediante: `GET /staff/unidades/{id_cuenta}` (con token).
* La respuesta incluye cada unidad (`id_unidad`, `nombre`).
* La UI muestra sólo los eventos/programas correspondientes a esas unidades.

**Respuesta de ejemplo:**

```json
{
  "staffId":124,
  "unidades":[
    {"id_unidad":1,"nombre":"Bar Principal"},
    {"id_unidad":3,"nombre":"Cocina"}
  ]
}
```

### 2.4  Paso 4 – Listado de eventos/programas accesibles

#### 2.4.1  Eventos personales
* **Endpoint** interno: `GET /eventos?staffId=124` (filtrado por `id_staff` en la tabla `ef_eventos_staff`).
* Sólo devuelve eventos donde el staff sea el propietario (campo `id_staff_propietario`).

#### 2.4.2  Eventos de cuenta (B2B)
* **Endpoint**: `GET /eventos?cuentaId=7&unidades=1,3`
* `eventosController` **JOIN** con `ef_evento_acceso_unidades` y filtra por las unidades que el staff posee.

#### 2.4.3  Programas
* **Endpoint**: `GET /programas?cuentaId=7&unidades=1,3`
* Similar al caso B2B, se retorna el programa solo si la unidad del programa está dentro del conjunto de unidades del staff.

**Respuesta típica (lista de eventos):**

```json
[
  {"id_evento":42,"nombre":"Fiesta DJ","fecha_inicio":"2026‑06‑15T20:00:00Z","unidad":"Bar Principal"},
  {"id_evento":57,"nombre":"Cena Gala","fecha_inicio":"2026‑06‑20T19:30:00Z","unidad":"Cocina"}
]
```

### 2.5  Paso 5 – Acciones dentro del evento

| Acción | Endpoint | Claims requeridos | Comentario |
|--------|----------|-------------------|------------|
| **Check‑in** de staff | `POST /eventos/{idEvento}/checkin` | `is_staff:true` + `id_staff` | Marca al staff como presente; verifica que la unidad del evento esté dentro de las del staff. |
| **Ver detalle de programa** | `GET /programas/{idPrograma}` | `is_staff:true` | Sólo si `programa.id_unidad` ∈ `staff.unidades`. |
| **Actualizar disponibilidad** | `PATCH /staff/{id}` | `id_staff` o `ACCOUNT_ADMIN` | Permite que el propio staff cambie su `activo` o `fecha_expiracion` (auto‑desactivación). |

### 2.6  Manejo de expiración de token
* **Timer** en la app (p.ej., `setTimeout`) que dispara a los **11 h** para refrescar el token.
* **Refresh endpoint** (no expuesto en código original) puede ser creado: `POST /staff/refresh` → emite nuevo token por 12 h siempre que el staff siga activo.

---

## 3️⃣  Casos de uso específicos

### 3.1  **Evento personal** (staff propietario)

1. **Admin crea staff** con rol `STAFF_PROPIETARIO` y asigna *una única unidad* que corresponde al evento.
2. Staff se **logea** → token contiene `id_cuenta` y `role`.
3. Frontend llama `GET /eventos?staffId={id}` → devuelve **único** evento donde `id_staff_propietario = id_staff`.
4. En UI, el staff ve solo su propio evento; no hay filtrado por unidades adicionales.

### 3.2  **Eventos de cuenta (B2B)**

1. **Admin** crea staff con rol `STAFF_DJ` (u otro) y asigna varias unidades (ej.: Bar 1, Bar 2).
2. Staff inicia sesión → token incluye `id_cuenta`.
3. Frontend solicita `GET /eventos?cuentaId={id_cuenta}&unidades={listaIds}`.
4. En `eventosController`, la consulta **JOIN** con `ef_evento_acceso_unidades` verifica que el evento pertenezca a al menos una de las unidades del staff.
5. Resultado: lista de **todos** los eventos de la cuenta que el staff pueda atender (p.ej., turnos de DJ en varios bares).

### 3.3  **Programas**

1. Programa está relacionado a una **unidad** (`id_unidad`).
2. Cuando el staff solicita `GET /programas?cuentaId={id}&unidades={lista}`, el controlador **filtra** por la unidad.
3. Si el staff pertenece a la unidad, se devuelve el programa; de lo contrario, **404**.

---

## 4️⃣  Resumen de endpoints (backend)

| Método | Ruta | Rol requerido | Acción | Parámetros / Body | Respuesta clave |
|--------|------|---------------|--------|-------------------|-----------------|
| `POST` | `/staff` | `ACCOUNT_ADMIN` | Crear staff | JSON (nombre, apellido, email, teléfono, id_cuenta, rol, unidades[]) | `{id_staff, codigo, activo}` |
| `POST` | `/staff/login` | **N/A** (código) | Autenticación | `{ "codigo":"ACDJ3521" }` | `{ token }` |
| `GET` | `/staff/{id}` | `ACCOUNT_ADMIN` | Detalle staff | `id` en URL | Staff + unidades |
| `PUT` | `/staff/{id}` | `ACCOUNT_ADMIN` | Editar staff | JSON similar a CREATE (puede omitir `unidades` para mantenerlas) | `{ ok:true }` |
| `DELETE` | `/staff/{id}` | `ACCOUNT_ADMIN` | Desactivar staff | — | `{ ok:true }` |
| `GET` | `/staff/unidades/{id_cuenta}` | `ACCOUNT_ADMIN` | Listado de staff + unidades | `id_cuenta` | `[ { staff, unidades[] } ]` |
| `GET` | `/eventos?staffId={id}` | `STAFF_*` | Eventos personales | `staffId` | `[evento]` |
| `GET` | `/eventos?cuentaId={id}&unidades=1,3,5` | `STAFF_*` | Eventos de cuenta | `cuentaId`, lista de `id_unidad` | `[evento]` |
| `GET` | `/programas?cuentaId={id}&unidades=1,3` | `STAFF_*` | Programas accesibles | idem | `[programa]` |
| `POST` | `/eventos/{id}/checkin` | `STAFF_*` | Registrar presencia del staff | — | `{ ok:true, hora:... }` |
| `PATCH` | `/staff/{id}` | `STAFF_*` (propio) o `ACCOUNT_ADMIN` | Cambiar disponibilidad/expiración | `{ activo:false }` | `{ ok:true }` |

---

## 5️⃣  Buenas prácticas y consideraciones

1. **Never expose `codigo`** after login – solo se usa una vez. Guarda el token y descarta el código en el cliente.
2. **Siempre validar la pertenencia de unidades** en el backend, nunca confiar en la lista enviada por el cliente.
3. **Límites de generación** – para evitar exhaustión de códigos, el `StaffService` mantiene un **cache de 10 últimos códigos** y asegura al menos 1 segundo entre intentos.
4. **Rotación de secret key** – programar una tarea que cambie `Jwt:Key` cada 90 días, invalidando tokens viejos (requiere re‑login).
5. **Auditoría** – registrar en `ef_auditoria_staff` (tabla adicional) cada alta, baja, y cambio de unidades; útil para cumplimiento GDPR.
6. **Testing** – escribir pruebas unitarias para `GenerarCodigoStaff`, `Login`, y los filtros de `eventosController`. Usa `InMemoryDatabase` para validar la lógica de unión de unidades.

---

## 6️⃣  Diagrama de flujo (texto)

```
[Frontend] --> (1) INPUT código -> /staff/login
               <-- (2) JWT (staff claims) <---
[Frontend] --> (3) GET /staff/unidades/{cuentaId}  (Bearer token)
               <-- (4) Lista de unidades (id_unidad) <---
[Frontend] --> (5) GET /eventos?cuentaId=X&unidades=lista
               <-- (6) Eventos filtrados por unidades <---
[Frontend] --> (7) POST /eventos/{id}/checkin  (Marca presencia)
               <-- (8) OK / registro de check‑in <---
```

---

## 7️⃣  Conclusión

Este documento cubre **todos los aspectos** del sistema de **staff** y **unidades**:
* **Persistencia** y generación segura de códigos.
* **Autenticación** mediante JWT con claims específicos para staff.
* **Endpoints** de CRUD y de consulta de eventos/programas, con la lógica de filtrado por unidades.
* **Flujo frontend** paso a paso, ejemplos de código y manejo de expiración.
* **Seguridad**, auditoría y buenas prácticas para mantener la integridad del sistema.

Con esta guía, los equipos de desarrollo y QA pueden implementar, probar y mantener el módulo de staff con total confianza. ¡Éxitos!

## 8️⃣ Paso a paso para Frontend (Ilustrado)

### Flujo completo (Mermaid)

```mermaid
flowchart TD
    A[Input código (8 chars)] --> B[POST /staff/login]
    B --> C[Recibe JWT (claims: id_staff, id_cuenta, role, is_staff)]
    C --> D[GET /staff/unidades/{id_cuenta} (Bearer token)]
    D --> E[Lista de unidades accesibles]
    E --> F[GET /eventos?cuentaId={id_cuenta}&unidades=lista]
    F --> G[Eventos filtrados por unidades]
    G --> H[Mostrar lista en UI]
    H --> I[Seleccionar evento → POST /eventos/{id}/checkin]
    I --> J[Confirmación de check‑in]
    C --> K[Token expira (12h)]
    K --> L[POST /staff/refresh (opcional)]
    L --> M[Nuevo JWT]
    M --> C
```

### Detalle de cada paso

1. **Input código**: campo con validación de 8 caracteres alfanuméricos, autocapitalizado.
2. **Login**: se envía el código, el backend devuelve un JWT.
3. **Obtener unidades**: con el token se solicita la lista de unidades a las que el staff tiene acceso.
4. **Listar eventos**: se llama al endpoint correspondiente según el caso (personal, B2B o programa) incluyendo el parámetro `unidades`.
5. **Mostrar UI**: la app muestra solo los eventos/programas filtrados por unidades.
6. **Check‑in**: al pulsar “Asistir” se registra la presencia mediante `POST /eventos/{id}/checkin`.
7. **Renovación de token**: antes de que expire el JWT, opcionalmente se llama a `/staff/refresh` para obtener uno nuevo y seguir navegando sin volver a pedir el código.

### Consideraciones UI

- Mostrar mensaje de error si el login falla.
- Guardar el JWT de forma segura (SecureStore/Keychain).
- Persistir la lista de unidades en estado global (Redux, Context, etc.).
- Utilizar un loader mientras se obtienen datos.
- Implementar refresco automático del token (ej. con `setTimeout` que llama a `/staff/refresh` 1 h antes de la expiración).

---
