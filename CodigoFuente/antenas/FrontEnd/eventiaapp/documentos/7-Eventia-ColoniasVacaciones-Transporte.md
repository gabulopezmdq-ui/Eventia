# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# CIRCUITO TRANSPORTE

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho


**Programa → Gestión Inscripciones → Transporte**

Programas (menú)

- Aquamar – Casal de verano (card?)
  - Configuración
    - Semanas
    - Servicios
    - Salud
    - Autorizaciones

- Gestión de inscripciones
  - Inscriptos
  - Pagos
  - Cocina
  - Transporte
  - Salud
  - Retiros

- Clínica de Tenis (card?)
  - ……..


Objetivo:

Saber quién usa transporte cada día y con qué información operativa.

Poder responder:

- ¿Quién usa transporte hoy?
- ¿A qué lugar?
- ¿A qué hora?
- ¿Con qué observaciones?
- ¿Hay alertas de salud importantes?

**Pantalla Gestión de Transporte**

Para el Header y Cards usar **Endpoint**:

Ver todos los tipos de servicio de transporte por fecha:

**GET /programas/{idEvento}/transporte/dia?fecha=2026-06-24&servicioCodigo=TODOS** 

Ver sólo “acogida”:

**GET /programas/{idEvento}/transporte/dia?fecha=2026-06-24&servicioCodigo=ACOGIDA** 

Ver sólo “transporte”:

**GET /programas/{idEvento}/transporte/dia?fecha=2026-06-24&servicioCodigo=TRANSPORTE** 



Ejemplo:

`	`GET / programas/34/transporte/dia?fecha=2026-06-24&servicioCodigo=ACOGIDA

Respuesta:	

{

`    `"idEvento": 34,

`    `"programa": "Casal d’estiu Aquamar 2026",

`    `"fecha": "2026-06-24",

`    `"resumen": {

`        `"total": 4,

`        `"conObservaciones": 0,

`        `"conAlertasSalud": 1

`    `},

`    `"items": [

`        `{

`            `"idInvitado": 126,

`            `"idRsvpGrupoIntegrante": 86,

`            `"participante": "Laia Rovira",

`            `"responsable": "Marta Rovira",

`            `"telefonoResponsable": "+34600999111",

`            `"servicio": "Acollida",

`            `"servicioCodigo": "ACOGIDA",

`            `"direccion": **null**,

`            `"observacionesServicio": **null**,

`            `"tieneAlertaSalud": **true**,

`            `"observacionesSalud": "Alergia leve a picaduras. | Avisar si aparece inflamación."

`        `},

`        `{

`            `"idInvitado": 69,

`            `"idRsvpGrupoIntegrante": 29,

`            `"participante": "Arlet Vidal",

`            `"responsable": "Clara Vidal",

`            `"telefonoResponsable": "+34600444555",

`            `"servicio": "Acollida",

`            `"servicioCodigo": "ACOGIDA",

`            `"direccion": **null**,

`            `"observacionesServicio": **null**,

`            `"tieneAlertaSalud": **false**,

`            `"observacionesSalud": **null**

`        `},

`        `{

`            `"idInvitado": 125,

`            `"idRsvpGrupoIntegrante": 85,

`            `"participante": "Pau Rovira",

`            `"responsable": "Marta Rovira",

`            `"telefonoResponsable": "+34600999111",

`            `"servicio": "Acollida",

`            `"servicioCodigo": "ACOGIDA",

`            `"direccion": **null**,

`            `"observacionesServicio": **null**,

`            `"tieneAlertaSalud": **false**,

`            `"observacionesSalud": ""

`        `},

`        `{

`            `"idInvitado": 117,

`            `"idRsvpGrupoIntegrante": 77,

`            `"participante": "Sofia Domenech",

`            `"responsable": "Carla Domenech",

`            `"telefonoResponsable": "+34600999111",

`            `"servicio": "Acollida",

`            `"servicioCodigo": "ACOGIDA",

`            `"direccion": **null**,

`            `"observacionesServicio": **null**,

`            `"tieneAlertaSalud": **false**,

`            `"observacionesSalud": ""

`        `}

`    `]

}

Header

Logística Programa: Casal d’estiu Aquamar 2026 (campo “programa”)

Filtros:

- Fecha
  - Date picker
- Servicio:
  - Combo, de valores fijos:
    - TODOS
    - ACOGIDA
    - TRANSPORTE
- Acción: al cambiar la fecha o servicio volver a llamar al endpoint.

Luego mostrar: Cards resumen

- Total (mostrar “totalComedor”)
- Sin Restricciones (mostrar “sinRestricciones”)
- Especiales (mostrar “conRestricciones”)
- Alertas (mostrar “alertasAltas”)

Con Observaciones 

Con Alertas Salud 1

Total 4
![](Aspose.Words.bd5d6be6-e11d-4057-9662-b4c83080f6c5.001.png)![](Aspose.Words.bd5d6be6-e11d-4057-9662-b4c83080f6c5.002.png)![](Aspose.Words.bd5d6be6-e11d-4057-9662-b4c83080f6c5.003.png)


{

`    `"idEvento": 34,

`    `"programa": "Casal d’estiu Aquamar 2026",

`    `"fecha": "2026-06-24",

`    `"resumen": {

`        `"total": 4,

`        `"conObservaciones": 0,

`        `"conAlertasSalud": 1

`    `},


Grilla principal:

|**Participante**|**Responsable**|**Teléfono**|**Servicio**|**Observaciones Salud**|
| :- | :- | :- | :- | :- |
|<p>**Laia Rovira**</p><p></p>|<p>Marta Rovira</p><p></p>|<p>+34600999111</p><p></p>|<p>Acollida</p><p></p>|<p>Alergia leve a picaduras. | Avisar si aparece inflamación</p><p></p>|
|<p>**Pau Rovira**</p><p></p>|<p>Marta Rovira</p><p></p>|<p>+34600999111</p><p></p>|<p>Acollida</p><p></p>||
|<p>**Arlet Vidal**</p><p></p>|<p>Clara Vidal</p><p></p>|<p>+34600444555</p><p></p>|<p>Acollida</p><p></p>||
||||||

Interpretación:

tieneAlertaSalud = true:\
→ el transporte debe prestar atención especial\
→ puede necesitar asistencia

**Export rápido para logística**

- Botón Descargar PDF Logística

No lo tengo implementado, porque no sé si lo hace el front o el back.


Flujo de uso

1. Operador entra a Transporte
1. 2. Selecciona fecha
1. Se carga listado
1. Identifica:
- cantidad total
- casos con salud
- casos especiales
1. Organiza traslado

Importante

Este módulo NO gestiona rutas, vehículos ni horarios.

Es solo LISTADO OPERATIVO DIARIO

El módulo Transporte muestra qué participantes tienen contratado el servicio de transporte en una fecha determinada.

\
El objetivo es facilitar la operación diaria del traslado, mostrando:

- participante
- responsable
- teléfono
- alertas de salud
- observaciones




