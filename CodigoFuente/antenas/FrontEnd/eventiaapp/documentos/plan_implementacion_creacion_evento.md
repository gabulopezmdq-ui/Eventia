# Plan de Implementación: Ajustes en Creación de Eventos (B2B vs B2C)

**Objetivo:** Ajustar el payload enviado al backend durante la creación de un nuevo evento (`POST /eventos`) para reflejar correctamente el contexto del evento a través de las propiedades `modalidad`, `idUnidad`, `idCliente` y `codigoPlan`.

**Criterios de Aceptación:**
- Se mantiene el uso de `camelCase` en el frontend, como es el estándar actual.
- Los eventos creados desde "Cuenta" (B2B) deben enviar `modalidad` como `"PROPIO"` o `"CLIENTE"`, incluyendo siempre el `idUnidad`, y el `idCliente` solo si corresponde. 
- Los eventos creados desde "Mi espacio" (B2C) deben enviar `modalidad: null`, `idUnidad: null`, `idCliente: null`, y el `codigoPlan`.

---

## Tarea 1: Actualizar la Interfaz del Payload (`types.ts`)
**Archivo:** `src/features/events/types.ts`

**Acción:** Agregar la propiedad `modalidad` (que puede recibir los strings permitidos o `null`) a la interfaz `CreateEventPayload`.

**Código Propuesto:**
```typescript
// En src/features/events/types.ts

export interface CreateEventPayload {
    idTipoEvento: number;
    idIdioma: number;
    idPlantilla?: number;
    idDressCode?: number;
    anfitrionesTexto: string;
    saludo?: string;
    mensajeBienvenida?: string;
    notas?: string;
    fechaHora?: string;
    lugar?: string;
    direccion?: string;
    latitud?: number;
    longitud?: number;
    
    // 👇 Nuevos campos añadidos / actualizados 👇
    modalidad?: 'PROPIO' | 'CLIENTE' | null;
    idUnidad?: number | null;
    idCliente?: number | null;
    codigoPlan?: string | null;
}
```

---

## Tarea 2: Modificar la Construcción del Payload (`page.tsx`)
**Archivo:** `src/app/dashboard/events/new/page.tsx`
**Función:** `handleCreateEvento`

**Acción:** Refactorizar el objeto que se le pasa a `createEvent` para resolver los campos basados en el contexto en el que se encuentra el usuario (`isB2BContext`). Se recomienda enviar los campos en `null` explícitamente para evitar problemas de datos faltantes en la serialización, garantizando el comportamiento que la documentación espera.

**Código Propuesto:**
```typescript
// En src/app/dashboard/events/new/page.tsx dentro de handleCreateEvento()

const payload: CreateEventPayload = {
    idTipoEvento: basicInfo.idTipoEvento,
    idIdioma: basicInfo.idIdioma,
    idDressCode: basicInfo.idDressCode > 0 ? basicInfo.idDressCode : undefined,
    anfitrionesTexto: basicInfo.anfitrionesTexto,
    saludo: basicInfo.saludo || undefined,
    mensajeBienvenida: basicInfo.mensajeBienvenida || undefined,
    notas: basicInfo.notas || undefined,
    
    ...(isB2BContext 
        ? {
            // Lógica para eventos de Cuenta (B2B)
            modalidad: b2bInfo.destinatario, // Asume que es 'PROPIO' o 'CLIENTE'
            idUnidad: b2bInfo.idUnidad !== '' ? (b2bInfo.idUnidad as number) : null,
            idCliente: b2bInfo.destinatario === 'CLIENTE' && b2bInfo.idCliente !== '' 
                         ? (b2bInfo.idCliente as number) 
                         : null,
            codigoPlan: null
        } 
        : {
            // Lógica para eventos Mi Espacio (B2C)
            modalidad: null,
            idUnidad: null,
            idCliente: null,
            codigoPlan: codigoPlan || null
        }
    )
};

const result = await createEvent(payload);
```

---

## Consideraciones Adicionales para el Equipo Frontend:
1. **Validación del Estado Inicial:** Verificar en `page.tsx` que el estado inicial de `b2bInfo.destinatario` esté definido por defecto en `"PROPIO"` y que el select o radio button del formulario actualice este valor de forma fiable a `"CLIENTE"` cuando corresponda.
2. **Proxy / Middleware:** Asegurarse de que el proxy intermedio de Next.js (`src/app/api/events/route.ts`) no esté bloqueando o sanitizando propiedades en `null`. (Actualmente usa `JSON.stringify(body)` por lo que la serialización de valores nulos se transmitirá correctamente).
3. **Casings:** Dado que seguimos con `camelCase`, asumimos que el serializador JSON en el backend de .NET/.NET Core está utilizando políticas de case-insensitivity (el estándar), lo que significa que procesará `modalidad` independientemente de si la documentación menciona `"Modalidad"`.
