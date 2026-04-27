# Documentación Técnica: Sistema de Staff de Cuenta (Eventia)

Esta documentación detalla el funcionamiento interno del backend y el flujo de integración para el frontend del sistema de gestión de personal (Staff) por unidades.

---

## 1. Proceso del Backend (Detalle Técnico)

El sistema de Staff ha sido diseñado para ser **completamente autónomo**, permitiendo que el personal trabaje sin necesidad de tener un registro previo en la tabla central de usuarios (`ef_usuarios`).

### 1.1 Persistencia (Esquema de BD)
La lógica se apoya en dos tablas principales:
- **`ef_staff`**: Almacena la "llave" de acceso (código), los datos personales del empleado (nombre, apellido, email, teléfono) registrados por el administrador, y el estado del acceso (activo/inactivo, fecha de expiración).
- **`ef_staff_unidades`**: Tabla de relación que vincula a un miembro del staff con múltiples unidades operativas de la misma cuenta.

### 1.2 Generación del Código de Acceso
El `StaffService` genera códigos estructurados de **8 caracteres** con el patrón `CCRRNNNN`:
- **CC (Cuenta)**: Primeras 2 letras del nombre de la cuenta.
- **RR (Rol)**: Primeras 2 letras del rol (ej: `DJ` para `STAFF_DJ`, `ME` para `STAFF_MESERO`).
- **NNNN (Numérico)**: 4 dígitos aleatorios para garantizar unicidad.
- **Unicidad**: Antes de persistir, el sistema verifica que el código no exista en la tabla `ef_staff`.

### 1.3 Lógica de Autenticación (JWT)
Cuando un staff ingresa su código, el sistema no solo lo valida, sino que emite un **Token JWT** especializado.
- **Claims incluidos**:
    - `sub`: Identificador único con formato `staff_{id_staff}`.
    - `id_staff`: El ID numérico del registro de staff.
    - `id_cuenta`: La cuenta B2B a la que pertenece.
    - `role`: El código del rol asignado (ej: `STAFF_DJ`).
    - `is_staff`: Flag booleano `true` para facilitar validaciones rápidas.
- **Vigencia**: El token tiene una duración predeterminada de **12 horas**.

### 1.4 Gestión Administrativa
El `staffController` expone endpoints protegidos para que el Dueño de la Cuenta (`ACCOUNT_ADMIN`) realice el alta, baja y consulta de su personal. Al crear un staff, el admin define los sectores (unidades) a los que tendrá visibilidad.

---

## 2. Flujo de Integración Frontend (Referencia)

A continuación se detalla cómo debe implementarse el flujo en la aplicación móvil/web para el personal.

### Paso 1: Interfaz de Ingreso
El frontend debe ofrecer una pantalla simple donde el staff ingrese su código de **8 caracteres**. Se recomienda forzar el texto a **MAYÚSCULAS** automáticamente.

### Paso 2: Consumo de API (Login)
Se debe realizar una petición `POST` al endpoint público (sin token previo).

- **Endpoint**: `/staff/join`
- **Body**: `{ "codigo": "AX4JD92KBT" }`

### Paso 3: Recepción y Persistencia
Si el código es válido, el backend responderá con el objeto de contexto:

```json
{
  "id_staff": 123,
  "nombre": "Carlos",
  "apellido": "Gomez",
  "rol_codigo": "STAFF_RECEPTOR",
  "access_token": "eyJhbG...",
  "expires_at_utc": "2026-04-22T04:00:00Z",
  "unidades": [
    { "id_unidad": 5, "nombre": "Barra VIP" },
    { "id_unidad": 8, "nombre": "Salón Exterior" }
  ]
}
```

**Acción sugerida para el Frontend**:
1. Guardar el `access_token` en el almacenamiento local (LocalStorage o SecureStore).
2. Guardar el objeto `unidades` y `rol_codigo` en el estado global (Redux/Context) para controlar la visibilidad de la UI.

### Paso 4: Autorización en Peticiones
Para todas las operaciones que realice el staff (ej: escanear un QR), el frontend debe incluir el token recibido en el header de autorización:
`Authorization: Bearer <access_token>`

### Paso 5: Filtrado de Interfaz y Lógica
Basado en el `rol_codigo` y la lista de `unidades` recibidas:
- **Visibilidad**: Mostrar solo los módulos habilitados para ese rol (Scanner para Receptores, Música para DJs, etc.).
- **Filtros**: En listados de pedidos o transacciones, filtrar automáticamente por los `id_unidad` presentes en el contexto del staff.
- **Perfil**: Mostrar los datos (`nombre`, `apellido`) en el encabezado de la aplicación.

### Paso 6: Verificación de Sesión
Si el backend devuelve un error `401 Unauthorized` o el código ingresado ya no es válido (en el caso de validación por cada request), el frontend debe redirigir al staff de vuelta a la pantalla de ingreso de código.

---

> [!NOTE]
> Recuerde que este flujo es independiente del login tradicional de usuarios. Un dispositivo que está siendo usado por un staff no requiere haber pasado por el login de Google/Email.
