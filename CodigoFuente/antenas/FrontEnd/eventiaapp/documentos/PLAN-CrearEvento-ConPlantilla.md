# 📋 Documentación y Plan de Implementación
## "Crear Evento CON Plantilla" — Análisis de Brechas

**Fecha:** 2026-02-24  
**Documento de referencia:** `Eventia-Crear Evento-CON Plantilla.docx`  
**Archivo actual:** `src/app/dashboard/events/new/page.tsx`

---

## 📖 1. RESUMEN DEL DOCUMENTO DE ESPECIFICACIÓN

El documento define un flujo de **6 pasos** para crear un evento usando plantillas:

| Paso | Nombre | Descripción |
|------|--------|-------------|
| **1** | Crear Evento Base | Formulario con datos básicos → `POST /eventos` |
| **2** | Elegir Plantilla/Estructura | Mostrar cards de plantillas → `GET /plantillas_evento/GetByTipo` + `GET /plantillas_evento/{id}/Detalle` |
| **3** | Fecha y Ubicación Base | Mini-form con fecha_base, lugar, dirección, lat/long |
| **4** | Aplicar Plantilla | Enviar datos al backend → `POST /eventos_plantillas/Aplicar?idEvento=X` |
| **5** | Cargar Estructura | Obtener estructura creada → `GET /eventos_plantillas/Estructura?idEvento=X` |
| **6** | Editor (3 tabs) | **Tab 1:** Editar Tramos, **Tab 2:** Editar Accesos + Default, **Tab 3:** Matriz acceso-tramo |

---

## 🔍 2. ESTADO ACTUAL DEL FRONTEND (`page.tsx`)

El archivo actual tiene **896 líneas** con un wizard de **4 pasos**:

| Step actual | Lo que hace |
|-------------|-------------|
| **1** Información Básica | ✅ Idioma, Tipo Evento, Plantilla (select), Tramos (preview read-only), Anfitriones, Saludo, Mensaje Bienvenida, Notas |
| **2** Ubicación | ✅ Fecha/Hora, Lugar, Dirección |
| **3** Mensajes | ✅ Vista previa tipo tarjeta de invitación |
| **4** Revisión | ✅ Resumen final + botón "Crear Evento" |

### Lo que YA está implementado:
- ✅ Selección de idioma (`GET /idiomas`)
- ✅ Selección de tipo de evento (`GET /tipos-evento`)
- ✅ Carga de plantillas por tipo (`GET /plantillas-evento`)
- ✅ Carga de tramos por plantilla (preview read-only)
- ✅ Campos: Anfitriones, Saludo, Mensaje Bienvenida, Notas
- ✅ Campos: Fecha/Hora, Lugar, Dirección
- ✅ Vista previa de la invitación
- ✅ Revisión final y `POST /eventos` (crea el evento base)
- ✅ Wizard con navegación step-by-step
- ✅ Validaciones por step

---

## ❌ 3. LO QUE FALTA (Gap Analysis)

### 🔴 3.1 — Campo "Dress Code" (Paso 1)
**Documento dice:**
> Dress code (opcional-dropdown) → `GET /dress_code/GetAll?idIdioma=2`

**Estado actual:** ❌ **No existe** en el form ni en los types.

**Se necesita:**
- Nuevo type `DressCode` en `types.ts`  
- Nuevo service `getDressCodes(idIdioma)` en `event.service.ts`
- Nueva ruta proxy API `/api/dress-codes/route.ts`
- Campo select en el Step 1
- Agregar `idDressCode` al `CreateEventPayload`

---

### 🔴 3.2 — Flujo POST/eventos separado del "Aplicar Plantilla"
**Documento dice:**
> Paso 1 crea el evento con `POST /eventos` y obtiene un `idEvento`.  
> Pasos 2-4 usan ese `idEvento` para aplicar la plantilla.

**Estado actual:** ❌ El flujo actual **mezcla todo en un solo submit** al final del wizard. No guarda el `idEvento` intermedio.

**Se necesita:**
- Separar la creación del evento base (al final del paso 1 → `POST /eventos`)
- Guardar el `idEvento` retornado en estado
- Usar ese `idEvento` en los pasos subsiguientes

---

### 🔴 3.3 — Pantalla de Selección de Plantillas con Cards Detalladas (Paso 2 del doc)
**Documento dice:**
> Pantalla 2: "Elegí una estructura para tu evento"  
> - Mostrar Cards con: Nombre, Descripción ("Incluye: Iglesia - Cena - Fiesta"), Footer ("Accesos: 4 opciones")
> - Cada card tiene botón "Usar esta estructura" o radio button
> - Botón secundario: "No encontré la estructura..." / "Voy a crear la estructura de mi evento"
> - Endpoint detalle: `GET /plantillas_evento/{idPlantilla}/Detalle`

**Estado actual:** ❌ Solo hay un **select dropdown** para elegir plantilla, no hay cards visuales ni detalle de cada plantilla.

**Se necesita:**
- Nuevo service `getPlantillaDetalle(idPlantilla)` → `GET /plantillas_evento/{id}/Detalle`
- Nueva ruta proxy API
- Nuevos types: `PlantillaDetalle`, `PlantillaAcceso`, `PlantillaRelacion`
- UI de cards con nombre, tramos incluidos, cantidad de accesos
- Radio button o botón "Usar esta estructura"  
- Botón secundario dinámico ("No encontré..." / "Voy a crear...")

---

### 🔴 3.4 — Pantalla "Datos Base" para aplicar plantilla (Paso 3 del doc)
**Documento dice:**
> Pantalla 3: "Datos base para inicializar el evento"  
> - Fecha y Hora de inicio (obligatoria)
> - Lugar (opcional), Dirección (opcional)
> - Latitud/Longitud (opcionales)
> - Subtítulo: "Usaremos estos datos como base para todos los tramos"

**Estado actual:** ⚠️ **Parcialmente existe** — el Step 2 actual tiene Fecha, Lugar y Dirección, pero:
- No tiene Latitud/Longitud visibles para el usuario
- No se presenta como "datos base para tramos"
- No se envía como payload al endpoint de Aplicar

---

### 🔴 3.5 — Endpoint "Aplicar Plantilla" (Paso 4 del doc)
**Documento dice:**
> `POST /eventos_plantillas/Aplicar?idEvento=8`  
> Body: `{ id_plantilla, borrar_existente, fecha_base, lugar_base, direccion_base, latitud_base, longitud_base }`  
> Backend crea: tramos, accesos, matriz acceso-tramo, setea id_acceso_default

**Estado actual:** ❌ **No existe**

**Se necesita:**
- Nuevo service `aplicarPlantilla(idEvento, payload)`
- Nueva ruta proxy API `/api/eventos-plantillas/aplicar/route.ts`
- Nuevo type `AplicarPlantillaPayload`
- Llamada después de confirmar fecha/ubicación base

---

### 🔴 3.6 — Endpoint "Cargar Estructura" (Paso 5 del doc)
**Documento dice:**
> `GET /eventos_plantillas/Estructura?idEvento=8`  
> Devuelve: `{ id_evento, id_acceso_default, tramos[], accesos[], relaciones[] }`

**Estado actual:** ❌ **No existe**

**Se necesita:**
- Nuevo service `getEstructuraEvento(idEvento)`
- Nueva ruta proxy API `/api/eventos-plantillas/estructura/route.ts`
- Nuevos types: `EstructuraEvento`, `TramoEvento`, `AccesoEvento`, `RelacionAccesoTramo`

---

### 🔴 3.7 — Editor de Estructura (Paso 6 del doc — 3 Tabs)
**Documento dice:**
> **Tab 1 — Agenda/Tramos:** Cards editables (nombre, fecha inicio/fin, lugar, dirección, lat/long, leyenda visible, orden, activo) con botón Guardar individual → `PUT /evento_tramos/{idTramo}`  
> **Tab 2 — Accesos/Tipos de Invitación:** Cards editables (nombre, mensaje RSVP, orden, activo, marcar default con radio) con botón Guardar individual → `PUT /evento_accesos/{idAcceso}` + `PUT /eventos/{idEvento}/acceso-default?idAcceso=X`  
> **Tab 3 — Matriz acceso-tramo:** Grilla con checkboxes (filas=accesos, cols=tramos, tildado si existe relación)

**Estado actual:** ❌ **Nada de esto existe.** El wizard actual termina en "Crear Evento" y redirige a `/dashboard/events`.

**Se necesita:**
- Página nueva o sección nueva: Editor de Estructura del Evento
- Tab 1: Componente `TramoEditor` con form y PUT individual
- Tab 2: Componente `AccesoEditor` con form, radio default, y PUT individual
- Tab 3: Componente `MatrizAccesoTramo` con grilla de checkboxes
- 3 nuevas rutas proxy API
- 3+ nuevos services
- Múltiples types nuevos

---

### 🔴 3.8 — Setear Acceso Default
**Documento dice:**
> `PUT /eventos/{idEvento}/acceso-default?idAcceso=11`  
> Resaltar la card que se marcó como "default"  
> Checked si `acceso.id_acceso === estructura.id_acceso_default`

**Estado actual:** ❌ **No existe**

---

## 📊 4. TABLA RESUMEN DE BRECHAS

| # | Feature | Prioridad | Complejidad | Estado |
|---|---------|-----------|-------------|--------|
| 1 | Campo Dress Code | 🟡 Media | Baja | ❌ Falta |
| 2 | Flujo en 2 fases (crear base + aplicar plantilla) | 🔴 Alta | Media | ❌ Falta |
| 3 | Cards de selección de plantilla con detalle | 🔴 Alta | Media | ❌ Falta |
| 4 | Pantalla datos base para plantilla | 🔴 Alta | Baja | ⚠️ Parcial |
| 5 | Endpoint Aplicar Plantilla | 🔴 Alta | Media | ❌ Falta |
| 6 | Endpoint Cargar Estructura | 🔴 Alta | Media | ❌ Falta |
| 7 | Tab 1: Editor de Tramos | 🔴 Alta | Alta | ❌ Falta |
| 8 | Tab 2: Editor de Accesos + Default | 🔴 Alta | Alta | ❌ Falta |
| 9 | Tab 3: Matriz acceso-tramo | 🟡 Media | Alta | ❌ Falta |
| 10 | Setear acceso default | 🔴 Alta | Baja | ❌ Falta |

---

## 🗓️ 5. PLAN DE IMPLEMENTACIÓN (por fases)

### ✅ FASE 1 — Preparación de infraestructura (Types + Services + API Routes) — COMPLETADA
**Estimación:** 1-2 días | **Estado:** ✅ Completada (2026-02-24)

#### 1.1 Actualizar `types.ts`
```typescript
// Agregar estos tipos:

export interface DressCode {
    id: number;
    codigo: string;
    texto: string;
    orden: number | null;
}

export interface PlantillaDetalle {
    id_plantilla: number;
    id_tipo_evento: number;
    codigo: string;
    nombre: string;
    activo: boolean;
    tramos: PlantillaTramo[];
    accesos: PlantillaAccesoDetalle[];
    relaciones: PlantillaRelacion[];
    tramos_count: number;
    accesos_count: number;
}

export interface PlantillaAccesoDetalle {
    id_plantilla_acceso: number;
    nombre_default: string;
    mensaje_rsvp_default: string;
    es_publico_default: boolean;
    orden: number;
    es_default: boolean;
    activo: boolean;
}

export interface PlantillaRelacion {
    id_plantilla_acceso: number;
    id_plantilla_tramo: number;
}

export interface AplicarPlantillaPayload {
    id_plantilla: number;
    borrar_existente: boolean;
    fecha_base: string;
    lugar_base?: string;
    direccion_base?: string;
    latitud_base?: number;
    longitud_base?: number;
}

export interface EstructuraEvento {
    id_evento: number;
    id_acceso_default: number | null;
    tramos: TramoEvento[];
    accesos: AccesoEvento[];
    relaciones: RelacionAccesoTramo[];
}

export interface TramoEvento {
    id_tramo: number;
    id_tramo_tipo: number;
    nombre: string;
    leyenda_visible: string | null;
    notas_internas: string | null;
    fecha_hora_inicio: string | null;
    fecha_hora_fin: string | null;
    lugar: string | null;
    direccion: string | null;
    latitud: number | null;
    longitud: number | null;
    orden: number;
    cupo: number | null;
    activo: boolean;
}

export interface AccesoEvento {
    id_acceso: number;
    nombre: string;
    mensaje_rsvp: string | null;
    es_publico: boolean;
    cupo: number | null;
    precio: number | null;
    orden: number;
    activo: boolean;
}

export interface RelacionAccesoTramo {
    id_acceso: number;
    id_tramo: number;
}
```

#### 1.2 Agregar services en `event.service.ts`
```typescript
// Nuevos services a agregar:

getDressCodes(idIdioma: number)           → GET /api/dress-codes?idIdioma=X
getPlantillaDetalle(idPlantilla: number)  → GET /api/plantillas-evento/{id}/detalle
aplicarPlantilla(idEvento: number, payload)→ POST /api/eventos-plantillas/aplicar?idEvento=X
getEstructuraEvento(idEvento: number)     → GET /api/eventos-plantillas/estructura?idEvento=X
updateTramo(idTramo: number, payload)     → PUT /api/evento-tramos/{idTramo}
updateAcceso(idAcceso: number, payload)   → PUT /api/evento-accesos/{idAcceso}
setAccesoDefault(idEvento, idAcceso)      → PUT /api/eventos/{idEvento}/acceso-default?idAcceso=X
```

#### 1.3 Crear rutas API proxy en Next.js
```
src/app/api/
├── dress-codes/route.ts                    ← NUEVO
├── plantillas-evento/
│   ├── route.ts                            ← YA EXISTE
│   ├── [id]/
│   │   └── detalle/route.ts                ← NUEVO
├── eventos-plantillas/
│   ├── aplicar/route.ts                    ← NUEVO
│   └── estructura/route.ts                 ← NUEVO
├── evento-tramos/
│   └── [idTramo]/route.ts                  ← NUEVO (PUT)
├── evento-accesos/
│   └── [idAcceso]/route.ts                 ← NUEVO (PUT)
└── events/
    └── [id]/
        └── acceso-default/route.ts         ← NUEVO (PUT)
```

---

### ✅ FASE 2 — Refactorizar el Wizard (Crear Evento Base + Selección Plantilla) — COMPLETADA
**Estimación:** 2-3 días | **Estado:** ✅ Completada (2026-02-24)

#### 2.1 Cambiar la estructura del Wizard
**De 4 pasos a 6 pasos:**

| Step | Nombre | UI |
|------|--------|----|
| 1 | Información Básica | Idioma, Tipo Evento, Anfitriones, Saludo, Msg Bienvenida, **Dress Code**, Notas → **`POST /eventos`** al avanzar |
| 2 | Elegir Estructura | Cards de plantillas con detalle + botón "Usar esta estructura" / "No encontré..." |
| 3 | Datos Base | Fecha, Lugar, Dirección, Lat/Long → **`POST /eventos_plantillas/Aplicar`** al avanzar |
| 4 | Editor: Tramos | Cards editables de cada tramo + Guardar individual |
| 5 | Editor: Accesos | Cards editables de cada acceso + radio Default + Guardar individual |
| 6 | Editor: Matriz | Grilla acceso-tramo con checkboxes (read-only o editable) |

#### 2.2 Implementar Step 1 mejorado
- **Agregar campo Dress Code** (dropdown)
- **Hacer `POST /eventos` al pasar al Step 2** (no al final del wizard)
- **Guardar `idEvento` en estado local**
- **Ajustar validaciones**

#### 2.3 Implementar Step 2: Selección de Plantilla con Cards
- Fetch plantillas por tipo → `GET /plantillas_evento/GetByTipo?idTipoEvento=X`
- Para cada plantilla, fetch detalle → `GET /plantillas_evento/{id}/Detalle`  
- Renderizar cards con:
  - Nombre de la plantilla
  - Lista de tramos incluidos
  - Cantidad de accesos
  - Botón "Usar esta estructura"
- Botón secundario dinámico
- Radio button o selección visual con highlight

#### 2.4 Implementar Step 3: Datos Base
- Form con: Fecha/Hora, Lugar (opcional), Dirección (opcional), Lat/Long (opcional)
- Al confirmar → `POST /eventos_plantillas/Aplicar?idEvento=X`
- Manejar respuesta `{ ok: true }`

---

### ✅ FASE 3 — Editor de Estructura (3 Tabs) — COMPLETADA
**Estimación:** 3-4 días | **Estado:** ✅ Completada (2026-02-24)

#### 3.1 Cargar estructura
- Al entrar al editor → `GET /eventos_plantillas/Estructura?idEvento=X`
- Guardar en estado: tramos[], accesos[], relaciones[], id_acceso_default

#### 3.2 Tab 1: Editor de Tramos
- Lista de cards, una por tramo
- Campos editables:
  - Nombre
  - Fecha/Hora inicio, Fecha/Hora fin (opcional)
  - Lugar, Dirección
  - Latitud, Longitud
  - Leyenda visible
  - Orden
  - Activo (toggle)
- Botón "Guardar" por card → `PUT /evento_tramos/{idTramo}`
- No se permite agregar/eliminar tramos (vino de plantilla)

#### 3.3 Tab 2: Editor de Accesos
- Lista de cards, una por acceso
- Campos editables:
  - Nombre
  - Mensaje RSVP
  - Orden
  - Activo (toggle)
  - ~~Cupo, Precio, Es público~~ (ocultos por ahora según doc)
- Radio button "Marcar como Default" 
  - Checked si `acceso.id_acceso === estructura.id_acceso_default`
  - Al cambiar → `PUT /eventos/{idEvento}/acceso-default?idAcceso=X`
  - Highlight visual en la card marcada como default
- Botón "Guardar" por card → `PUT /evento_accesos/{idAcceso}`

#### 3.4 Tab 3: Matriz Acceso-Tramo
- Tabla/grilla:
  - Columnas = tramos (ordenados por `orden`)
  - Filas = accesos (ordenados por `orden`)
  - Checkbox en cada celda:
    - ✅ tildado si `relaciones` contiene `{idAcceso, idTramo}`
    - ❌ destildado si no existe la relación
- Datos cargados desde la respuesta de Estructura
- ✅ **Matriz Editable:** Implementada (clic en celda togglea relación en DB)
- ✅ **Loading States:** Spinners individuales por celda
- ✅ **Feedback visual:** Estilos diferenciados para estados de relación.

---

### 📦 FASE 4 — Pulido, UX y Detalle de Evento
**Estimación:** 1-2 días | **Estado:** 🏗️ En curso

- ✅ **Refactorización Detalle de Evento:** Diseño premium, resumen de estructura, acceso rápido al editor.
- ✅ **Indicadores de "guardado exitoso"**: Implementados en cards de tramos y accesos.
- ✅ **Loading states**: Implementados en todas las operaciones del editor y matriz.
- ⏳ **Animaciones de transición**: Refinar transiciones entre editor tabs.
- ⏳ **Confirmación de salida**: Toast o confirm() si hay cambios pendientes sin guardar.
- ⏳ **Mejora Vista Listado**: Adaptar las cards de `/dashboard/events` al nuevo estilo visual.
- ⏳ **Matriz - Opción Reset**: Botón para volver a la configuración original de la plantilla.

---

## 🏗️ 6. ÁRBOL DE ARCHIVOS A CREAR/MODIFICAR

```
src/
├── features/events/
│   ├── types.ts                              ← MODIFICAR (agregar ~80 líneas de types)
│   └── event.service.ts                      ← MODIFICAR (agregar ~7 funciones nuevas)
│
├── app/api/
│   ├── dress-codes/route.ts                  ← CREAR
│   ├── plantillas-evento/
│   │   └── [id]/detalle/route.ts             ← CREAR
│   ├── eventos-plantillas/
│   │   ├── aplicar/route.ts                  ← CREAR
│   │   └── estructura/route.ts               ← CREAR
│   ├── evento-tramos/
│   │   └── [idTramo]/route.ts                ← CREAR
│   ├── evento-accesos/
│   │   └── [idAcceso]/route.ts               ← CREAR
│   └── events/[id]/
│       └── acceso-default/route.ts           ← CREAR
│
├── app/dashboard/events/
│   ├── new/page.tsx                          ← MODIFICAR COMPLETAMENTE
│   └── [id]/
│       └── estructura/page.tsx               ← CREAR (Editor de Estructura - opción alternativa)
│
└── components/events/                        ← CREAR (carpeta de componentes)
    ├── PlantillaCard.tsx                     ← CREAR
    ├── TramoEditorCard.tsx                   ← CREAR
    ├── AccesoEditorCard.tsx                  ← CREAR
    └── MatrizAccesoTramo.tsx                 ← CREAR
```

---

## 📝 7. ENDPOINTS BACKEND REQUERIDOS (todos según el doc)

| Método | Endpoint | Uso | Ruta Proxy Existe? |
|--------|----------|-----|-------------------|
| GET | `/tipos_evento/GetAll?idIdioma=2` | Tipos de evento | ✅ Sí |
| GET | `/idiomas/Activos` | Idiomas | ✅ Sí |
| GET | `/dress_code/GetAll?idIdioma=2` | Dress codes | ❌ Crear |
| POST | `/eventos` | Crear evento base | ✅ Sí |
| GET | `/plantillas_evento/GetByTipo?idTipoEvento=X` | Plantillas por tipo | ✅ Sí |
| GET | `/plantillas_evento/{id}/Detalle` | Detalle plantilla | ❌ Crear |
| POST | `/eventos_plantillas/Aplicar?idEvento=X` | Aplicar plantilla | ❌ Crear |
| GET | `/eventos_plantillas/Estructura?idEvento=X` | Cargar estructura | ❌ Crear |
| PUT | `/evento_tramos/{idTramo}` | Editar tramo | ❌ Crear |
| PUT | `/evento_accesos/{idAcceso}` | Editar acceso | ❌ Crear |
| PUT | `/eventos/{id}/acceso-default?idAcceso=X` | Setear default | ❌ Crear |

---

## ⏱️ 8. ESTIMACIÓN TOTAL

| Fase | Duración est. | Dependencias |
|------|--------------|--------------|
| Fase 1: Infraestructura | 1-2 días | Ninguna |
| Fase 2: Wizard refactorizado | 2-3 días | Fase 1 |
| Fase 3: Editor de Estructura | 3-4 días | Fase 2 |
| Fase 4: Pulido y UX | 1-2 días | Fase 3 |
| **TOTAL** | **7-11 días** | — |

---

## 🎯 9. DECISIONES DE DISEÑO A TOMAR

1. **¿El editor de estructura va en la misma página del wizard o en una página separada?**
   - Opción A: Todo en una sola página con 6+ steps (largo pero lineal)
   - Opción B: Wizard de 3 steps → redirige a `/dashboard/events/[id]/estructura` (modular)
   - 👉 **Recomendación:** Opción B — mantiene los archivos manejables y permite reutilizar el editor

2. **¿La matriz acceso-tramo es editable o read-only?**
   - El doc no menciona endpoint de edición de relaciones
   - 👉 **Recomendación:** Dejarlo read-only por ahora, mostrar un mensaje "Las relaciones se definieron automáticamente desde la plantilla"

3. **¿Usar mapa interactivo para Lat/Long?**
   - 👉 **Recomendación:** Por ahora inputs numéricos, se puede agregar mapa después

4. **¿Guardar automáticamente el acceso default al cambiar el radio, o esperar botón "Guardar"?**
   - 👉 **Recomendación:** Guardar automáticamente al hacer clic en el radio (feedback inmediato con toast)
