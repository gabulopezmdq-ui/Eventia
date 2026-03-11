# Plan de Implementación: Flujo de Invitaciones

Este plan detalla los pasos y archivos a modificar para alinear completamente el frontend de Eventia con el flujo conceptual propuesto.

## [x] 1. Completar la vista de "GET Invitados" (Lista de Invitados)

Actualmente, `/dashboard/events/[id]/invitados` tiene un diseño de "Empty State" (Aún no hay invitados) quemado en código. Debemos conectar la API para mostrar la lista real.

**Archivos a modificar:**
- `src/app/dashboard/events/[id]/invitados/page.tsx`
  - **Lógica**: Importar y usar `listarInvitados(id)` desde `invitation.service.ts` al cargar el componente (usando `useEffect` o `useQuery`).
  - **Estado**: Crear estados para `invitados`, `isLoading` y `error`.
  - **Renderizado**: Reemplazar el "Empty State" con una tabla o lista interactiva cuando haya datos.
  - **Datos a mostrar**: Mostrar `nombre`, `apellido`, email/celular, y el **estado de RSVP** (`P` para Pendiente, `C` para Confirmado, `R` para Rechazado).
  - **Acciones por fila**: Agregar un botón para **"Copiar Link de Invitación"** por cada usuario listado (leyendo el `rsvpToken` del objeto `InvitadoListado`).

## [ ] 2. Implementar "CrearLinkGenerico" (Links Masivos)

Existen botones de "Link Masivo" en la vista de detalle del evento y en la estructura (`/dashboard/events/[id]/estructura/page.tsx`) que actualmente muestran un `alert('Próximamente...')`. 

**Requerimiento de Backend (A verificar con el equipo Backend):**
- Para poder copiar un link masivo (ejemplo aplicable a todo el evento o a un `Tramo` o `Acceso` particular), necesitamos saber con qué estructura se formará esta URL (ej. `https://[dominio]/rsvp/evento/[id_evento]?acceso=[id_acceso]`). 
- Si el backend **ya soporta links genéricos**, necesitamos agregar el service correspondiente en `src/features/invitations/invitation.service.ts` para obtener dicho token genérico, o componer la URL si es estática.

**Archivos a modificar en Frontend (asumiendo que la estructura es estática o que existe un endpoint):**
- `src/app/dashboard/events/[id]/page.tsx`
  - Buscar los botones de "Link Masivo" (`onClick={() => alert('Próximamente: Link masivo...')}`).
  - Cambiar el alert por la función real `navigator.clipboard.writeText(urlGenerica)`.
  - Agregar un toast de notificación o alerta nativa de éxito ("Link copiado").
- `src/app/dashboard/events/[id]/estructura/page.tsx`
  - Buscar el botón "Link Masivo" en la tarjeta de accesos (`onClick={() => alert(...)}`).
  - Reemplazar por la acción de copia al portapapeles.

## [ ] 3. Carga de Invitados (Opcional - Excel / Masiva)

En el esquema mencionaste `CargarInvitados (opcional)`. Actualmente solo tenemos el formulario 1 a 1.
Si se desea implementar la carga mediante archivo (Ej: CSV o Excel):
- Se debe agregar un botón "Importar Excel" al lado de "Invitación Personalizada" en `src/app/dashboard/events/[id]/invitados/page.tsx`.
- Usar una librería como `papaparse` o `xlsx` para leer el archivo en el frontend, mapear las columnas a `InvitadoPayload[]`, y enviarlo todo en un solo `POST` usando el mismo método actual de Backend (`cargarInvitacion`).

## Plan de Verificación

### Verificación Manual
1. **Verificación de Lista de Invitados:**
   - Crear una invitación usando el modal actual.
   - Refrescar la página o disparar la recarga y verificar que el nuevo invitado aparezca en la lista con estado **Pendiente**.
   - Ingresar a la URL del invitado (`/rsvp/[token]`), confirmar asistencia, y verificar que en el panel del organizador cambie a **Confirmado**.
2. **Verificación de Copia de Links:**
   - Hacer clic en el nuevo botón "Copiar Link" en cualquier fila de la lista de invitados. Pegar en otra pestaña y verificar que lleva al RSVP correcto.
   - Hacer clic en "Link Masivo" en la sección de Accesos/Tramos y verificar que el portapapeles reciba la URL correcta.
