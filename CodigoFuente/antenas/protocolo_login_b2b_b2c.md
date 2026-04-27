# Protocolo de Autenticación: B2B y B2C (Eventia)

Este documento detalla los lineamientos técnicos para la integración del frontend con el sistema de autenticación de Eventia, cubriendo accesos corporativos (B2B) y de usuarios finales (B2C).

---

## 🔐 1. Tipos de Autenticación

### A. Login Tradicional (Email/Password)
Utilizado para usuarios registrados directamente en la plataforma.
- **Endpoint**: `POST /auth/login`
*   **Request (`auth_login_request`)**:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
*   **Response (`auth_login_response`)**:
    ```json
    {
      "access_token": "string (JWT)",
      "expires_at_utc": "DateTimeOffset"
    }
    ```

### B. Google Auth (OIDC)
Simplifica el registro y login B2C.
- **Endpoint**: `POST /auth/google`
*   **Request (`auth_google_request`)**:
    ```json
    {
      "id_token": "string (proporcionado por el SDK de Google)"
    }
    ```
*   **Response**: Mismo formato que el login tradicional.

---

## 👤 2. Contexto de Usuario (GET /auth/me)

Después de obtener el `access_token`, el frontend **debe** llamar a este endpoint para configurar el estado de la aplicación y la interfaz.

- **Endpoint**: `GET /auth/me`
- **Header**: `Authorization: Bearer {token}`

### Respuesta (`Auth_me_responseDTO`)
El objeto recibido permite diferenciar dinámicamente entre un perfil **B2B** y uno **B2C**:

```json
{
  "usuario": {
    "id_usuario": "integer",
    "email": "string"
  },
  "roles_globales": ["SUPERADMIN", "PRO_USER"],
  "cuenta": {
    "id_cuenta": "integer | null",
    "nombre_cuenta": "string",
    "tipo": "B2B | B2C",
    "estado_ui": "SIN_CUENTA | CUENTA_PENDIENTE | CUENTA_ACTIVA"
  },
  "ui": {
    "mostrar_menu_cuenta": "boolean",
    "mostrar_admin": "boolean",
    "puede_crear_evento_b2c": "boolean"
  }
}
```

---

## 🏗️ 3. Diferenciación B2B vs B2C

| Característica | Perfil B2B (Corporativo) | Perfil B2C (Consumidor) |
| :--- | :--- | :--- |
| **Identificación** | `cuenta.id_cuenta` es NOT NULL. | `cuenta.id_cuenta` es NULL. |
| **Estructura** | Existe una entidad corporativa vinculada. | Operación como individuo. |
| **Permisos** | Basado en `roles_globales` y `rol_cuenta`. | Basado en capacidad de creación (`puede_crear_evento_b2c`). |
| **Límites** | Regidos por el `plan_codigo` de la cuenta. | Límites estándar de usuario final. |

---

## ⚙️ 4. Especificaciones Técnicas (JWT)

El `access_token` es un JWT estándar que contiene la siguiente información en su carga útil (Payload):

*   **sub / id_usuario**: Identificador único del usuario.
*   **email**: Correo electrónico del usuario.
*   **http://schemas.microsoft.com/ws/2008/06/identity/claims/role**: Lista de roles activos (ej: `SUPERADMIN`, `EVENT_OWNER`).

> [!IMPORTANT]
> **Seguridad**: El token tiene una validez predeterminada de **8 horas**. El frontend debe manejar la expiración y redirigir al login si el servidor devuelve un error `401 Unauthorized`.

---

## 🚀 5. Flujo de Integración Sugerido

1.  **Login**: El frontend obtiene el JWT.
2.  **Identidad**: Se guarda el JWT en un lugar seguro (ej: cookies HttpOnly o memoria de la App).
3.  **Configuración**: Se llama a `/auth/me` para obtener el objeto `ui`.
4.  **Enrutamiento**: 
    - Si `ui.mostrar_admin == true` -> Mostrar panel de control organizacional.
    - Si `ui.puede_crear_evento_b2c == true` -> Habilitar botón "Crear mi primer evento".
5.  **Peticiones**: Incluir el token en el header `Authorization` de todas las peticiones subsiguientes.
