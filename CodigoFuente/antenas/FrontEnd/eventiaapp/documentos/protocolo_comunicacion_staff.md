# Protocolo de Comunicación: Módulo de Staff (Backend -> Frontend)

Este documento detalla los pasos, endpoints y estructuras de datos necesarias para implementar la gestión de Staff en el Frontend, comunicándose con la API de Eventia.

---

## 1. Flujo de Administración (Dueño de Cuenta)

El administrador de la cuenta gestiona a su personal desde su panel de control.

### A. Listar Staff de la Cuenta
Obtiene la lista de todos los empleados vinculados a la cuenta, sus códigos y estado.

*   **Endpoint:** `GET /cuenta/{id_cuenta}/staff`
*   **Auth:** Requiere Token de Usuario (Admin).
*   **Respuesta Exitosa (200 OK):**
```json
[
  {
    "id_staff": 10,
    "nombre": "Juan",
    "apellido": "Staff",
    "email": "juan.staff@example.com",
    "telefono": "+541122334455",
    "rol_codigo": "STAFF_OPERADOR",
    "rol_descripcion": "Operador de Staff",
    "codigo": "K3J7R9",
    "activo": true,
    "fecha_expiracion": "2026-12-31T23:59:59Z",
    "usos": 1,
    "fecha_uso": "2024-05-12T14:00:00Z"
  }
]
```

### B. Invitar Nuevo Staff
Genera una nueva "invitación" o registro de staff. El sistema devuelve un **código único** que el administrador debe entregar al empleado.

*   **Endpoint:** `POST /cuenta/{id_cuenta}/staff`
*   **Auth:** Requiere Token de Usuario (Admin).
*   **Payload (JSON):**
```json
{
  "id_rol": 1,
  "nombre": "Juan",
  "apellido": "Staff",
  "email": "juan.staff@example.com",
  "telefono": "+541122334455",
  "fecha_expiracion": "2026-12-31T23:59:59Z",
  "id_unidades": [6, 7]
}
```
*   **Respuesta Exitosa (200 OK):**
```json
{
  "id_staff": 12,
  "codigo": "X8Y2Z1",
  "nombre": "Juan",
  "apellido": "Staff",
  "fecha_expiracion": "2026-12-31T23:59:59Z"
}
```

### C. Revocar Acceso (Eliminar Staff)
Desactiva el código y el acceso de un miembro del staff.

*   **Endpoint:** `DELETE /cuenta/{id_cuenta}/staff/{id_staff}`
*   **Auth:** Requiere Token de Usuario (Admin).
*   **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true
}
```

---

## 2. Flujo del Empleado (Sin Login)

El empleado no necesita una cuenta de usuario previa. Solo necesita el código entregado por su administrador.

### A. Unirse a la Aplicación (Usar Código)
El empleado ingresa el código en una pantalla de "Acceso Staff".

*   **Endpoint:** `POST /staff/join`
*   **Auth:** **Anónimo** (No requiere token previo).
*   **Payload (JSON):**
```json
{
  "codigo": "X8Y2Z1"
}
```
*   **Respuesta Exitosa (200 OK):**
Devuelve un **Access Token JWT** específico para este staff y su contexto de trabajo.
```json
{
  "id_staff": 12,
  "id_cuenta": 2,
  "id_evento": 45,
  "nombre": "Juan",
  "apellido": "Staff",
  "rol_codigo": "STAFF_OPERADOR",
  "unidades": [
    { "id_unidad": 6, "nombre": "Acceso Principal" },
    { "id_unidad": 7, "nombre": "VIP Lounge" }
  ],
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at_utc": "2024-05-13T03:00:00Z"
}
```

---

## 3. Consideraciones para el Frontend

1.  **Almacenamiento del Token:** Cuando el empleado usa el código con éxito, el Frontend debe guardar el `access_token` (en `localStorage` o similar). Este token identifica al empleado en las llamadas subsiguientes.
2.  **Interfaz del Empleado:** El JSON de respuesta de `/staff/join` contiene las `unidades` asignadas. El Frontend debe usar esto para mostrar al empleado en qué puestos puede trabajar (ej. seleccionar "Acceso Principal" para empezar a escanear).
3.  **Manejo de Errores:** 
    *   Si el código es inválido o expiró, la API devolverá un `400 BadRequest` con `{ "error": "Código inválido o expirado." }`.
    *   Si el administrador revoca el acceso, cualquier llamada futura con ese token devolverá `401 Unauthorized`.

---

## Estructura de Datos (DTOs)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id_rol` | `short` | ID del rol asignado (ej. 1 para Staff General). |
| `id_unidades` | `List<long>` | Lista de IDs de sectores/unidades donde puede operar. |
| `fecha_expiracion` | `DateTime` | Fecha límite para usar el código (ISO 8601). |
| `access_token` | `string` | Token JWT para autorizar operaciones de staff. |
