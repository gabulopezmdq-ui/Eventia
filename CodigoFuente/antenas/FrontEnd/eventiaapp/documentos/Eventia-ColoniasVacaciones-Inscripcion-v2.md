# Eventia — Colonias / Casales: Inscripción V2
**Visión alternativa de frontend — Foco en UX / Reducción de fricción**

---

## Por qué una V2

La V1 propone un wizard lineal de 10 pasos. Es correcto funcionalmente, pero tiene problemas reales de UX que en mobile (donde el padre completa el formulario) se sienten mucho:

- 10 pasos es demasiado para que el usuario tenga claridad del avance
- Si tiene 3 hijos, los pasos 4-8 se repiten mentalmente 3 veces
- Si el usuario cierra el navegador a mitad, pierde todo
- No puede revisar lo que puso en el paso 2 mientras está en el paso 7

La V2 cambia el **modelo mental**: en lugar de "completá pasos", el usuario ve un **panel familiar** que se va poblando. El flujo base sigue siendo igual (un único POST al final), pero la experiencia es completamente diferente.

---

## Concepto central: "Panel Familiar" progresivo

En vez de pasos secuenciales, el usuario ve una **sola pantalla que crece**.

```
┌─────────────────────────────────────┐
│  🏖️  Casal d'estiu Aquamar 2026     │
│  22 jun → 04 sep  · 8 semanas       │
│  [Català ▼]                         │
├─────────────────────────────────────┤
│  ✅ Responsable      Laura García   │  ← sección colapsada, editabe
│  ──────────────────────────────     │
│  👦 Tomás García                    │  ← tarjeta expandida
│     Semanas: S1 ✅  S2 ✅           │
│     Menjador: L M X J V / L M X J  │
│     Salud: completada ✅            │
│     Autorizados: 1 persona ✅       │
│  ──────────────────────────────     │
│  👧 Lucía García                    │  ← tarjeta en progreso
│     Semanas: [seleccionar]          │
│     ⚠️ Falta completar              │
│  ──────────────────────────────     │
│  [+ Agregar hijo/a]                 │
├─────────────────────────────────────┤
│  📋 Firma y condiciones  [pendiente]│
├─────────────────────────────────────┤
│  💰 Total estimado: 640 €           │
│  [Confirmar inscripción]            │
└─────────────────────────────────────┘
```

El botón **"Confirmar inscripción"** solo se activa cuando todo está completo.

---

## Flujo rediseñado: 4 fases (en lugar de 10 pasos)

| Fase | Contenido | Equivale a (V1) |
|------|-----------|-----------------|
| **A** | Presentación del casal | Paso 1 |
| **B** | Quién inscribe (responsable) | Paso 2 |
| **C** | Quiénes vienen (1 tarjeta por hijo, expansible) | Pasos 3→8 |
| **D** | Firma + confirmación | Pasos 9→10 |

La magia está en la **Fase C**: en lugar de pasar por pasos separados para semanas, servicios, restricciones, etc., todo vive **dentro de la tarjeta del hijo**, organizado en tabs o secciones colapsables.

---

## Fase A — Landing del Casal

**Ruta:** `/inscripcion/[token]`

**Layout:** fullscreen, sin navbar. Foto o banner del casal si viene en la config.

```
┌─────────────────────────────────────┐
│                                     │
│  🌊  Casal d'estiu Aquamar 2026     │
│  22/06 — 04/09/2026                 │
│                                     │
│  [Selector idioma: CA / ES / EN]    │
│                                     │
│  ── Semanas disponibles ──          │
│  Setmana 1  22/06–26/06   120 €     │
│  Setmana 2  29/06–03/07   120 €     │
│  ...                                │
│                                     │
│  ── Servicios opcionales ──         │
│  Menjador   9 €/día                 │
│  Transport  6 €/día                 │
│                                     │
│  ── Info de pago ──                 │
│  [texto info_publica]               │
│  10% descuento por hermano/a        │
│                                     │
│       [Comenzar inscripción →]      │
│                                     │
└─────────────────────────────────────┘
```

**Decisiones técnicas:**
- Selector de idioma cambia el `idIdioma` en el query param y hace refetch (sin guardar estado aún)
- El `programaData` se almacena en `localStorage` con TTL de 24h para resistir recargas accidentales
- Al hacer click en "Comenzar", se inicializa el estado en `InscripcionContext` y se pasa a Fase B

---

## Fase B — Responsable

**No es un paso separado**. Es un **modal o un panel deslizante** que aparece al hacer "Comenzar inscripción".

Razón: el responsable es una sola vez, sin variantes. No merece su propia "pantalla".

```
┌─────────────── Drawer (bottom sheet en mobile) ──────────────┐
│  Quién realiza la inscripción                         [✕]    │
│  ───────────────────────────────────────────────────────────  │
│  Nombre *          Apellido *                                │
│  [__________]      [__________]                              │
│                                                              │
│  Email *           WhatsApp *                                │
│  [__________]      [__________]                              │
│                                                              │
│  Documento         Relación                                  │
│  [__________]      [Madre ▼]                                 │
│                                                              │
│  ☐ Acepto recibir comunicaciones del casal                   │
│  ☐ Acepto recibir promociones                                │
│                                                              │
│                         [Continuar →]                        │
└──────────────────────────────────────────────────────────────┘
```

**Alternativa mobile:** bottom sheet que sube desde abajo (patrón nativo iOS/Android).  
**Alternativa desktop:** panel lateral derecho con overlay.

---

## Fase C — Panel Familiar (el corazón del flujo)

Esta fase reemplaza los pasos 3 al 8. Es la parte más innovadora.

### C.1 Agregar participantes

Al cerrar el responsable, aparece el panel familiar vacío:

```
┌──────────────────────────────────────┐
│  👨‍👩‍👧  Quiénes vienen                  │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  + Agregar hijo/a            │   │
│  └──────────────────────────────┘   │
│                                      │
│  (Podés agregar hasta 6)            │
└──────────────────────────────────────┘
```

Cada click en "+ Agregar hijo/a" abre un mini-form inline (no otra pantalla):

```
┌──────────────────────────────────────┐
│  Nuevo participante                  │
│  Nombre *    Apellido *             │
│  [_______]   [_______]              │
│  Fecha nacim.         Documento     │
│  [__________]         [_______]     │
│  Observaciones                      │
│  [_______________________________]  │
│          [Cancelar]  [Agregar →]    │
└──────────────────────────────────────┘
```

### C.2 Tarjeta de participante (expandida)

Una vez agregado, cada hijo tiene su tarjeta propia con **tabs internos**:

```
┌──────────────────────────────────────────┐
│  👦 Tomás García  (2017)          [✏️] [🗑]│
│  ┌────────────┬──────────┬──────────┐    │
│  │ 📅 Semanas │🍽️Servicios│ 🏥 Salud │    │
│  └────────────┴──────────┴──────────┘    │
│                                          │
│  TAB ACTIVO: Semanas                     │
│  ────────────────────────────────────    │
│  ☑ Setmana 1 · 22/06–26/06 · 120€       │
│  ☑ Setmana 2 · 29/06–03/07 · 120€       │
│  ☐ Setmana 3 · 06/07–10/07 · 120€       │
│                                          │
│  Subtotal: 240€                          │
└──────────────────────────────────────────┘
```

**Tab Servicios** (se muestra según las semanas ya seleccionadas):

```
│  TAB ACTIVO: Servicios                   │
│  ────────────────────────────────────    │
│  Setmana 1 (22/06 – 26/06)              │
│  ┌ Menjador 9€/día ──────────────────┐  │
│  │  [L] [M] [X] [J] [V]             │  │
│  └──────────────────────────────────┘  │
│  ┌ Transport 6€/día ─────────────────┐  │
│  │  [L] [M] [X] [J] [V]             │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Setmana 2 (29/06 – 03/07)             │
│  ┌ Menjador 9€/día ──────────────────┐  │
│  │  [L] [M] [X] [J] [V]             │  │
│  └──────────────────────────────────┘  │
```

**Tab Salud** (combina restricciones alimentarias + ficha médica + autorizados):

```
│  TAB ACTIVO: Salud & Retiro              │
│  ─────────────────────────────────────   │
│  🥗 Restricciones alimentarias           │
│  ☐ Sin gluten  ☐ Sin lactosa  ☐ Vegano  │
│  Severidad: [ Leve ▼ ]                   │
│  Observaciones: [___________________]    │
│                                          │
│  🏥 Ficha médica (opcional)              │
│  Grupo sanguíneo: [___]                  │
│  Alergias: [__________________________]  │
│  Medicación: [________________________]  │
│                                          │
│  👤 Autorizados de retiro                │
│  [+ Agregar autorizado]                  │
│  ─ Sin autorizados cargados             │
```

### C.3 Copiado inteligente entre hermanos

Cuando hay 2+ participantes, aparece la opción:

```
┌──────────────────────────────────────────┐
│  👧 Lucía García  (2019)          [✏️] [🗑]│
│                                          │
│  💡 ¿Lucía va las mismas semanas que Tomás?  │
│     [Sí, copiar semanas] [No, elegir manualmente] │
└──────────────────────────────────────────┘
```

También aplica para servicios y autorizados.

---

## Fase D — Firma y Confirmación

### D.1 Barra de estado flotante

Mientras el padre completa las tarjetas, en el **fondo de pantalla** siempre visible:

```
┌─────────────────────────────────────────────────────┐
│  💰 Total: 480€   ·  2 participantes  ·  ⚠️ Faltan datos  │
│                          [Ver resumen] [Confirmar →]        │
└─────────────────────────────────────────────────────┘
```

- **"Confirmar"** está desactivado si hay campos obligatorios sin completar.
- **"Ver resumen"** abre un panel de revisión antes de firmar.

### D.2 Resumen + Firma

Al presionar "Ver resumen", aparece un panel expandible con todo lo cargado:

```
┌──────────────────────────────────────────────────────┐
│  📋 Resumen de inscripción                     [✕]   │
│  ────────────────────────────────────────────────    │
│  Responsable: Laura García · laura@test.com          │
│                                                      │
│  👦 Tomás García                                     │
│     Semanas: S1 + S2 · 240€                          │
│     Menjador: L,M,X (S1) · L,M,X,J (S2)             │
│     Sin restricciones                                │
│                                                      │
│  👧 Lucía García                                     │
│     Semanas: S1 · 120€                               │
│     Sin servicios adicionales                        │
│     Sin gluten (Leve)                                │
│                                                      │
│  ── Descuentos ───────────────────────────────────   │
│  Descuento hermanos (10%): -36€                      │
│  ── Total ─────────────────────────────────────────  │
│  TOTAL: 324€                                         │
│                                                      │
│  ── Firma ────────────────────────────────────────   │
│  [✏️ Nombre completo: ___________________]            │
│  Fecha: 02/05/2026 (auto)                            │
│                                                      │
│  ☑ Acepto el reglamento del casal                    │
│  ☑ Autorizo tratamiento de datos                     │
│                                                      │
│              [← Editar]   [Confirmar inscripción]    │
└──────────────────────────────────────────────────────┘
```

### D.3 Pantalla de éxito

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│         ✅  ¡Inscripción confirmada!                 │
│                                                      │
│  Tu código de referencia:                            │
│  ┌──────────────────────┐                           │
│  │   AQM-2026-00847     │  [Copiar]                 │
│  └──────────────────────┘                           │
│                                                      │
│  📧 Enviamos confirmación a laura@test.com           │
│                                                      │
│  Próximos pasos:                                     │
│  • Realizá el pago según las instrucciones           │
│  • Guardá el código para consultas                   │
│  • Recibirás el QR de cada participante por mail     │
│                                                      │
│  [Descargar comprobante PDF]                         │
│  [Consultar mi inscripción]                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Diferencias técnicas clave vs V1

### 1. Estado persistido en localStorage

```typescript
// InscripcionContext.tsx — V2
// Diferencia: se persiste en localStorage para resistir recargas

const STORAGE_KEY = (token: string) => `inscripcion_draft_${token}`;

useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY(token));
  if (saved) {
    const draft = JSON.parse(saved);
    // Si tiene < 24h de antigüedad, restaurar
    if (Date.now() - draft.timestamp < 86400000) {
      dispatch({ type: "RESTORE_DRAFT", payload: draft.state });
    }
  }
}, []);

useEffect(() => {
  localStorage.setItem(STORAGE_KEY(token), JSON.stringify({
    state: inscripcionState,
    timestamp: Date.now(),
  }));
}, [inscripcionState]);
```

**Resultado:** el padre puede cerrar el celular, volver y retomar donde lo dejó.

---

### 2. No hay "paso actual" — hay "secciones con estado de completitud"

```typescript
// V1: currentStep: number (1-10)
// V2: secciones con su propio estado

interface SeccionEstado {
  completada: boolean;
  bloqueada: boolean;   // depende de secciones previas
  valida: boolean;      // sin errores de validación
}

interface InscripcionStateV2 {
  programaData: ProgramaInscripcionData | null;
  idIdioma: number;
  
  secciones: {
    responsable: SeccionEstado;
    participantes: SeccionEstado;
    firma: SeccionEstado;
  };
  
  responsable: Partial<Responsable>;
  participantes: ParticipanteV2[];
  firma: Partial<FirmaResponsable>;
  
  // UI local
  participanteActivoId: string | null;  // cuál tarjeta está expandida
  tabActivoPorParticipante: Record<string, "semanas" | "servicios" | "salud">;
  mostrandoResumen: boolean;
  isLoading: boolean;
  error: string | null;
  confirmado: boolean;
  tokenConfirmacion: string | null;
}
```

---

### 3. Cálculo de totales en tiempo real (con descuentos)

```typescript
// hooks/useTotalEstimado.ts
export function useTotalEstimado(
  participantes: ParticipanteV2[],
  programaData: ProgramaInscripcionData
): TotalEstimado {
  return useMemo(() => {
    let subtotal = 0;

    participantes.forEach((p) => {
      // Semanas
      p.periodos.forEach(({ id_programa_periodo }) => {
        const periodo = programaData.periodos.find(
          (pe) => pe.id_programa_periodo === id_programa_periodo
        );
        if (periodo) subtotal += periodo.precio_base;
      });

      // Servicios por día
      p.servicios.forEach((svc) => {
        const servicio = programaData.servicios.find(
          (s) => s.idProgramaServicio === svc.id_programa_servicio
        );
        if (!servicio) return;
        if (servicio.tipoCalculo === "POR_DIA") {
          subtotal += servicio.precio * svc.fechas.length;
        } else if (servicio.tipoCalculo === "UNICO") {
          subtotal += servicio.precio * (svc.cantidad ?? 1);
        }
      });
    });

    // Descuento por hermanos (si hay 2+ participantes)
    const descuento = participantes.length > 1 ? subtotal * 0.1 : 0;

    return {
      subtotal,
      descuento,
      total: subtotal - descuento,
      moneda: programaData.periodos[0]?.moneda ?? "EUR",
    };
  }, [participantes, programaData]);
}
```

---

### 4. Componente `ParticipanteCard` con tabs internos

```typescript
// features/inscripcion/components/ParticipanteCard.tsx

type Tab = "semanas" | "servicios" | "salud";

interface ParticipanteCardProps {
  participante: ParticipanteV2;
  programaData: ProgramaInscripcionData;
  otrosParticipantes: ParticipanteV2[];  // para la función "copiar"
  onUpdate: (id: string, data: Partial<ParticipanteV2>) => void;
  onRemove: (id: string) => void;
}

// Internamente el card maneja su propio tab activo
// con useState local (no necesita ir al reducer global)
```

---

### 5. Estructura de archivos V2 (simplificada)

```
src/
├── app/
│   └── inscripcion/
│       └── [token]/
│           ├── layout.tsx              ← Sin navbar/dashboard
│           └── page.tsx                ← Carga datos, renderiza fases
│
├── features/
│   └── inscripcion/
│       ├── types/
│       │   └── inscripcion.types.ts
│       ├── context/
│       │   └── InscripcionContext.tsx  ← useReducer + localStorage
│       ├── hooks/
│       │   ├── useInscripcion.ts
│       │   ├── useTotalEstimado.ts     ← NUEVO: cálculo reactivo
│       │   └── useInscripcionValid.ts  ← NUEVO: validación global
│       ├── components/
│       │   ├── FaseA_Landing.tsx
│       │   ├── FaseB_ResponsableDrawer.tsx
│       │   ├── FaseC_PanelFamiliar.tsx
│       │   ├── FaseD_ResumenFirma.tsx
│       │   ├── SuccessScreen.tsx
│       │   ├── BarraTotal.tsx          ← NUEVO: barra flotante inferior
│       │   └── ui/
│       │       ├── ParticipanteCard.tsx  ← Con tabs internos
│       │       ├── DaySelector.tsx
│       │       ├── ServiceBlock.tsx
│       │       ├── CopyFromSibling.tsx   ← NUEVO: "Copiar semanas de..."
│       │       └── SaludTab.tsx          ← Restricciones + salud + autorizados
│       └── inscripcion.service.ts
│
└── app/api/inscripcion/
    ├── [token]/route.ts
    └── confirmar/route.ts
```

---

## Comparación V1 vs V2

| Aspecto | V1 (Wizard lineal) | V2 (Panel familiar) |
|---------|-------------------|---------------------|
| Navegación | 10 pasos lineales | 4 fases, no-lineal interna |
| Edición posterior | Hay que volver al paso correcto | Click en cualquier sección |
| Múltiples hijos | Se repiten los pasos por hijo | Una tarjeta por hijo, tabs internos |
| Persistencia | Se pierde si se cierra | localStorage con TTL 24h |
| Total en tiempo real | Solo en el paso 10 | Barra flotante siempre visible |
| Copiar datos | No contemplado | "¿Mismo horario que hermano?" |
| Descuento hermanos | Solo se ve al final | Se aplica y muestra en tiempo real |
| Mobile UX | Pasos en pantalla completa | Bottom sheet para responsable, scroll en panel |
| Complejidad frontend | Media | Media-Alta |
| Complejidad backend | Igual (mismo POST) | **Igual (mismo POST)** |

---

## Lo que NO cambia

> **El contrato con el backend es idéntico.**
>
> - Mismo `GET /programas/inscripcion/{token}?idIdioma=N`
> - Mismo `POST /programas/inscripcion/confirmar` con el mismo payload
> - Los tipos `InscripcionPayload` son los mismos
> - Los proxies API son los mismos

La V2 es **solo una mejora de experiencia de usuario**. El backend no se toca.

---

## Cuándo usar cada versión

| Usar **V1** si... | Usar **V2** si... |
|-------------------|-------------------|
| Querés ir rápido a producción | Querés una UX premium |
| El casal tiene 1 solo hijo habitual | Familias con 2-4 hijos es el caso común |
| Usuarios más técnicos / adultos mayores que prefieren pasos claros | Usuarios jóvenes acostumbrados a apps mobile |
| Primer MVP para validar flujo | Segunda iteración con feedback real |

---

## Orden de implementación sugerido (V2)

| Prioridad | Tarea |
|-----------|-------|
| 🔴 1 | Tipos + proxies API + Context con localStorage |
| 🔴 2 | `FaseA_Landing` (presentación + selector idioma) |
| 🔴 3 | `FaseB_ResponsableDrawer` (bottom sheet / side panel) |
| 🔴 4 | `FaseC_PanelFamiliar` + `ParticipanteCard` vacía |
| 🟡 5 | Tab "Semanas" dentro de `ParticipanteCard` |
| 🟡 6 | Tab "Servicios" + `DaySelector` |
| 🟡 7 | Tab "Salud & Retiro" |
| 🟡 8 | `BarraTotal` flotante + `useTotalEstimado` |
| 🟢 9 | `CopyFromSibling` (copiar entre hermanos) |
| 🟢 10 | `FaseD_ResumenFirma` + firma + validación global |
| 🟢 11 | POST + `SuccessScreen` |
| 🔵 12 | Animaciones entre fases + polish responsive |
