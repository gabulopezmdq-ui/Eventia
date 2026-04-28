# Implementación de Staff de Programas (Casales)

Este documento detalla los cambios realizados en el Backend y los pasos a seguir para la integración en el Frontend del sistema de gestión de personal operativo para Programas.

---

## 1. Cambios en el Backend

Se ha implementado la gestión de staff utilizando la infraestructura existente de Eventia, evitando la creación de tablas redundantes.

### 1.1 Modelos y DTOs
Se crearon los DTOs necesarios en `API.DataSchema.DTO.Programas.ProgramaStaffDTOs.cs`:
- `ProgramaStaffDTO`: Para el listado de staff.
- `AddProgramaStaffRequest`: Para dar de alta un nuevo miembro.
- `UpdateProgramaStaffRequest`: Para modificar rol o estado.

### 1.2 Nuevos Endpoints en `programasController`
Se agregaron los siguientes métodos bajo la ruta `[controller]`:

- `GET /programas/{idEvento}/staff`: Obtiene la lista de staff asignado al programa.
- `POST /programas/{idEvento}/staff`: Agrega un usuario existente (por email) al programa con un rol específico.
- `PUT /programas/{idEvento}/staff/{idEventoUsuario}`: Actualiza el rol o estado (activo/inactivo) de un miembro.
- `DELETE /programas/{idEvento}/staff/{idEventoUsuario}`: Realiza una baja lógica (seteo de `activo = false`).

### 1.3 Lógica de Negocio
- **Validación de Usuario**: El sistema busca el email en la tabla `ef_usuarios`. Si no existe, devuelve un error `404` con el mensaje: *"Primero debe registrarse el usuario o enviar invitación cuando implementemos invitaciones."*
- **Reutilización**: Si un usuario ya fue staff del programa y estaba inactivo, el `POST` lo reactiva en lugar de crear un duplicado.

---

## 2. Pasos a seguir en el Frontend

Para completar la funcionalidad, se deben seguir estos pasos en la aplicación React/Next.js:

### 2.1 Definir Tipos e Interfaces
Actualizar o crear los tipos en `src/features/events/types.ts` (o un nuevo archivo para programas):

```typescript
export interface ProgramaStaff {
    id_evento_usuario: number;
    id_evento: number;
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    id_rol: number;
    codigo_rol: string;
    activo: boolean;
}
```

### 2.2 Crear Service de Staff
En `src/features/events/event.service.ts`, agregar las llamadas a los nuevos endpoints:

```typescript
export async function getProgramaStaff(idEvento: number): Promise<ProgramaStaff[]> {
    const res = await fetch(`${API_URL}/programas/${idEvento}/staff`);
    if (!res.ok) throw new Error('Error al obtener staff');
    return res.json();
}

export async function addProgramaStaff(idEvento: number, email: string, idRol: number): Promise<ProgramaStaff> {
    const res = await fetch(`${API_URL}/programas/${idEvento}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, idRol })
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Error al agregar staff');
    }
    return res.json();
}
```

### 2.3 Crear Pantalla de Gestión
1.  **Nueva Ruta**: Crear `/dashboard/events/[id]/staff/page.tsx`.
2.  **Interfaz de Usuario**:
    -   **Botón de Regreso**: Al detalle del evento/programa.
    -   **Botón "Agregar Staff"**: Que abra un modal con campos:
        -   Input Email (validar formato).
        -   Select de Rol (traer roles tipo `PROGRAM_...` desde la paramétrica de roles).
    -   **Tabla/Grilla**:
        -   Columnas: Usuario (Nombre completo), Email, Rol, Estado (Switch Activo).
        -   Acciones: Editar (Cambiar rol) o Eliminar.

### 2.4 Control de Permisos
Utilizar los roles asignados (`PROGRAM_ADMIN`, `PROGRAM_HEALTH`, etc.) para condicionar la visibilidad de otros módulos (ej: solo `PROGRAM_HEALTH` debería ver el botón de acceso a fichas médicas).

---

> [!IMPORTANT]
> Recuerde que para el MVP, el staff **debe estar registrado previamente** como usuario en Eventia. La funcionalidad de invitar por email (creación automática de cuenta) se implementará en una fase posterior.
