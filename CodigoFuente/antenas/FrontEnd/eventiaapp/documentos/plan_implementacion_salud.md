# Plan de Implementación: Módulo de Salud (Colonias de Vacaciones)

Basado en el documento `9-Eventia-ColoniasVacaciones-Salud.md` y siguiendo la arquitectura frontend utilizada en los módulos anteriores (Programas, Pagos, Cocina, Transporte, Retiros, Autorizaciones).

## Fase 1: Definición de Tipos (TypeScript Interfaces)
Crear/actualizar el archivo de tipos correspondiente (ej. `src/types/salud.ts` o dentro de `types/programas.ts`).
- `SaludPanelResponse`: Para la grilla del Panel Principal y Restricciones Alimentarias.
- `SaludParticipanteDetalle`: Para el detalle completo (incluyendo `ficha`, `contactos_emergencia`, `medicaciones`, `acciones`, `restricciones_alimentarias`).
- `SaludFichaItem`: Para el tab de Fichas.
- `SaludMedicacionItem`: Para el tab de Medicaciones.
- `SaludAccionItem` y `TipoAccionSalud`: Para el tab de Acciones y el combo de registro.
- `RegistrarAccionPayload`: Payload POST para registrar acciones.

## Fase 2: Rutas Proxy (Next.js API Routes)
Crear los proxies en `app/api/programas/[id]/salud/...` para encapsular las llamadas al backend real y manejar la autenticación/tokens:
1. `GET /api/programas/[id]/salud/panel`: Proxy a `/programas/{idEvento}/salud/panel` (soporta query params de filtros).
2. `GET /api/programas/[id]/salud/participantes/[idInvitado]/detalle`: Proxy a `/programas/{idEvento}/salud/participantes/{id_invitado}/detalle`.
3. `GET /api/programas/[id]/salud/fichas`: Proxy a `/programas/{idEvento}/salud/fichas`.
4. `GET /api/programas/[id]/salud/medicaciones`: Proxy a `/programas/{idEvento}/salud/medicaciones`.
5. `GET /api/programas/[id]/salud/acciones`: Proxy a `/programas/{idEvento}/salud/acciones`.
6. `POST /api/programas/[id]/salud/acciones/registrar`: Proxy a `/programas/{idEvento}/salud/acciones/registrar`.
7. `GET /api/programas/salud/tipos-accion`: Proxy a `/programas/salud/tipos-accion?idIdioma=1`.

## Fase 3: Capa de Servicios Frontend
Crear `src/services/saludService.ts` (o similar en la estructura) con funciones exportadas que consuman los endpoints proxy definidos en la Fase 2, tipando fuertemente tanto el Request como el Response.

## Fase 4: Componentes UI y Dashboard
Ubicación: `app/programas/[id]/salud/page.tsx` o similar, junto con sus subcomponentes.

### 4.1. Layout Principal y Cards
- Renderizar las **4 Cards de resumen** (el cálculo se hace en el front desde los datos de los tabs, como indica el doc):
  - Problemas médicos (calculado: `tiene_problema_medico = true`)
  - Participantes con Alertas (calculado: `alerta_visual = true`)
  - Medicaciones (calculado: `tiene_medicacion = true`)
  - Seguimientos (calculado: `requiere_seguimiento = true`)
- Integrar componentes de Tab (como los de Tailwind/shadcn) para alternar vistas.

### 4.2. Vistas (Tabs)
1. **Tab Panel Principal**:
   - Barra de filtros: Búsqueda (q), Solo Alertas, Nivel Alerta, Con Medicación, etc.
   - Grilla con columnas de resumen rápido.
   - Botón "Ver detalle / Registrar acción".
2. **Tab Fichas**:
   - Barra de filtros específica (Tiene problema médico, alergias, autoriza emergencia, etc.).
   - Grilla de fichas declaradas.
3. **Tab Medicaciones**:
   - Barra de filtros: Buscar, Requiere autorización, Tiene horario, Medicación específica.
   - Grilla solo de medicaciones.
4. **Tab Acciones / Incidentes**:
   - Grilla estilo timeline del registro histórico operativo.
   - Filtros: Tipo de acción, contacto familia, seguimiento, fechas.
5. **Tab Restricciones Alimentarias**:
   - Mismo endpoint del Panel, pero filtrando las restricciones. Filtros específicos (alergia, intolerancia, religioso, etc.).

### 4.3. Modales / Drawers (Sidebars)
- **Modal/Drawer de Detalle del Participante**:
  - Puede implementarse como un Drawer (como en Autorizaciones/Cocina) o Modal grande.
  - Secciones internas: Datos Generales, Salud, Contactos, Medicaciones, Restricciones, Timeline de Acciones.
- **Modal/Drawer de Registro de Acción**:
  - Formulario con: Fecha/Hora, Participante (lectura), Tipo de Acción (combo), Descripción, Toggles para contacto de familia y seguimiento.
  - Llamada al servicio POST y recarga de las grillas relevantes.

## Fase 5: Integración y Testing
- Conectar todo el estado mediante React Hooks (`useState`, `useEffect`).
- Implementar validaciones en el formulario de Registrar Acción.
- Verificar el mapeo de campos de la API (snake_case) al frontend (mantener snake_case si los proxies de la app lo pasan directo, o mapear a camelCase según la convención del proyecto).
- Asegurar responsividad y UI/UX coherente con los módulos Cocina/Retiros/Transporte/Autorizaciones.
