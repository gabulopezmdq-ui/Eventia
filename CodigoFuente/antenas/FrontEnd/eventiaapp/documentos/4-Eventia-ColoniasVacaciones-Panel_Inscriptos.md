# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# MODULO PANEL DE INSCRIPTOS

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho

**Programa → Gestión Inscripciones → Inscriptos**

No lo mezclamos con la configuración del programa. Tiene que ser una pantalla nueva dentro del programa (evento) y dentro de otro menú.

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



**Pantalla INCRIPTOS (la más importante de todas, tipo CRM operativo)**

Es el “centro operativo” del Programa.

Objetivo:

- ver familias inscriptas
- ver participantes
- estado de pago
- semanas contratadas
- servicios contratados
- alertas de salud/restricciones
- acceso rápido a detalle

**Endpoints Principales:**

- Lista:

  **GET /programas/{idEvento}/inscriptos**

- Detalle:

  **GET /programas/inscripciones/{idInscripcion}/detalle-operativo?idIdioma=1**

**Pantalla Inscriptos**

Para el Header y Cards usar **Endpoint**:

**GET /programas/{idEvento}/inscriptos/resumen**

Ejemplo:

**GET /programas/34/inscriptos/resumen**

`	`Respuesta:

{

`    `"id\_evento": 34,

`    `"programa": "Casal d’estiu Aquamar 2026",

`    `"modulo": "Inscriptos",

`    `"total\_familias": 15,

`    `"total\_participantes": 34,

`    `"total\_deuda": 5096.00,

`    `"moneda": "EUR",

`    `"pendientes": 14,

`    `"parciales": 1,

`    `"pagados": 0,

`    `"sin\_cargo": 0,

`    `"con\_alertas": 0

}

Header

Panel de Inscriptos al Programa: Casal d’estiu Aquamar 2026 (campo “programa)

Filtros:

- Buscar (buscar por nombre / mail / teléfono)
- Estado de pago:
  - Combo de opciones:
    - TODOS
    - PENDIENTE
    - PARCIAL
    - PAGADO
- Solo alertas:
  - toggle

- **Endpoint de búsqueda**:
  - Por string:

    GET /programas/34/inscriptos?q=serra

  - Con estado de pago:

    GET /programas/34/inscriptos?estadoPago=PENDIENTE

  - Solo alertas:

    GET /programas/34/inscriptos?soloAlertas=true

  - Combinado:

    GET /programas/34/inscriptos?q=pons&estadoPago=PARCIAL&soloAlertas=true



Y con el resultado se arma cada registro de la grilla:

` `{

`        `"idInscripcion": 14,

`        `"idRsvpGrupo": 29,

`        `"responsable": "Elena Ribas",

`        `"email": "elena.ribas.cocina@test.com",

`        `"telefono": "+34600345678",

`        `"participantes": [

`            `"Clara Ribas",

`            `"Nil Ribas"

`        `],

`        `"cantidadParticipantes": 2,

`        `"cantidadPeriodos": 2,

`        `"cantidadServicios": 2,

`        `"tieneRestriccionesAlimentarias": **true**,

`        `"tieneAlertasSalud": **true**,

`        `"totalOriginal": 294.00,

`        `"totalPagado": 0.0,

`        `"saldo": 294.00,

`        `"moneda": "EUR",

`        `"estadoPago": "PENDIENTE",

`        `"estadoInscripcion": "CONFIRMADA"

`    `},


Luego mostrar: cards resumen

- Familias (mostrar “total\_familias”)
- Participantes (mostrar “total\_participantes”)
- Deuda (mostrar “total\_deuda”)
- Estado de pago (se podría mostrar “pendientes”, “parciales”, “pagados”)
- Alertas (mostrar “con\_alertas”)

15 familias

34 participantes

![](Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.001.png)![](Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.002.png)![](Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.003.png)


Grilla principal:

|![](Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.004.png)|**Responsable**|**Participantes**|**Períodos**|**Servicios**|**Estado Pago**|**Saldo**|**Ver Detalle**|
| :- | :- | :- | :- | :- | :- | :- | :- |
|![ref1]|Elena Ribas|2|2|2|PENDIENTE|294 EUR||
|||||||||
|||||||||
![ref1]

00 	tieneAlertasSalud = true

![](Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.006.png)tieneRestriccionesAlimentarias = true

![](Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.007.png)Sin alertas

` `{

`        `"idInscripcion": 14,

`        `"idRsvpGrupo": 29,

`        `"responsable": "Elena Ribas",

`        `"email": "elena.ribas.cocina@test.com",

`        `"telefono": "+34600345678",

`        `"participantes": [

`            `"Clara Ribas",

`            `"Nil Ribas"

`        `],

`        `"cantidadParticipantes": 2,

`        `"cantidadPeriodos": 2,

`        `"cantidadServicios": 2,

`        `"tieneRestriccionesAlimentarias": **true**,

`        `"tieneAlertasSalud": **true**,

`        `"totalOriginal": 294.00,

`        `"totalPagado": 0.0,

`        `"saldo": 294.00,

`        `"moneda": "EUR",

`        `"estadoPago": "PENDIENTE",

`        `"estadoInscripcion": "CONFIRMADA"

`    `},


**Botón Ver detalle (por registro)**

**Endpoint**

**GET /programas/inscripciones/{idInscripcion}/detalle-operativo?idIdioma=1**

Ejemplo:

GET /programas/inscripciones/12/detalle-operativo?idIdioma=1

Respuesta

{

`    `"idInscripcion": 12,

`    `"idRsvpGrupo": 27,

`    `"responsable": "Nuria Costa",

`    `"email": "nuria.costa.cocina@test.com",

`    `"telefono": "+34600123456",

`    `"estadoInscripcion": "CONFIRMADA",

`    `"estadoPago": "PENDIENTE",

`    `"totalOriginal": 450.00,

`    `"totalPagado": 0.0,

`    `"saldo": 450.00,

`    `"moneda": "EUR",

`    `"participantes": [

`        `{

`            `"idInvitado": 86,

`            `"idRsvpGrupoIntegrante": 46,

`            `"nombreCompleto": "Aina Costa",

`            `"fechaNacimiento": **null**,

`            `"observaciones": **null**,

`            `"periodos": [

`                `{

`                    `"idProgramaPeriodo": 1,

`                    `"nombre": "Setmana 1 - del 22/06 al 26/06",

`                    `"fechaDesde": "2026-06-22",

`                    `"fechaHasta": "2026-06-26",

`                    `"precioBase": 120.00,

`                    `"moneda": "EUR"

`                `}

`            `],

`            `"servicios": [

`                `{

`                    `"idProgramaServicio": 1,

`                    `"codigo": "COMEDOR",

`                    `"nombre": "Menjador",

`                    `"tipoCalculo": "POR\_DIA",

`                    `"precio": 9.00,

`                    `"subtotal": 45.00,

`                    `"moneda": "EUR",

`                    `"cantidadCalculada": 5

`                `}

`            `],

`            `"restriccionesAlimentarias": [

`                `{

`                    `"idRestriccionAlim": 7,

`                    `"codigo": "GLUTEN\_CELIACO",

`                    `"texto": "Celíaco / Sin gluten",

`                    `"categoria": "INTOLERANCIA",

`                    `"requiereAlertaVisual": **true**,

`                    `"esAlergeno": **true**,

`                    `"observaciones": "Celíaca. No puede consumir gluten ni trazas.",

`                    `"severidad": **null**

`                `}

`            `],

`            `"salud": **null**,

`            `"autorizadosRetiro": []

`        `},

`        `{

`            `"idInvitado": 88,

`            `"idRsvpGrupoIntegrante": 48,

`            `"nombreCompleto": "Jana Costa",

`            `"fechaNacimiento": **null**,

`            `"observaciones": **null**,

`            `"periodos": [

`                `{

`                    `"idProgramaPeriodo": 1,

`                    `"nombre": "Setmana 1 - del 22/06 al 26/06",

`                    `"fechaDesde": "2026-06-22",

`                    `"fechaHasta": "2026-06-26",

`                    `"precioBase": 120.00,

`                    `"moneda": "EUR"

`                `}

`            `],

`            `"servicios": [

`                `{

`                    `"idProgramaServicio": 1,

`                    `"codigo": "COMEDOR",

`                    `"nombre": "Menjador",

`                    `"tipoCalculo": "POR\_DIA",

`                    `"precio": 9.00,

`                    `"subtotal": 18.00,

`                    `"moneda": "EUR",

`                    `"cantidadCalculada": 2

`                `}

`            `],

`            `"restriccionesAlimentarias": [

`                `{

`                    `"idRestriccionAlim": 22,

`                    `"codigo": "VEGETARIANO",

`                    `"texto": "Vegetariano",

`                    `"categoria": "ELECCION",

`                    `"requiereAlertaVisual": **false**,

`                    `"esAlergeno": **false**,

`                    `"observaciones": "Menú vegetariano todos los días que use comedor.",

`                    `"severidad": **null**

`                `}

`            `],

`            `"salud": **null**,

`            `"autorizadosRetiro": []

`        `},

`        `{

`            `"idInvitado": 87,

`            `"idRsvpGrupoIntegrante": 47,

`            `"nombreCompleto": "Pol Costa",

`            `"fechaNacimiento": **null**,

`            `"observaciones": **null**,

`            `"periodos": [

`                `{

`                    `"idProgramaPeriodo": 1,

`                    `"nombre": "Setmana 1 - del 22/06 al 26/06",

`                    `"fechaDesde": "2026-06-22",

`                    `"fechaHasta": "2026-06-26",

`                    `"precioBase": 120.00,

`                    `"moneda": "EUR"

`                `}

`            `],

`            `"servicios": [

`                `{

`                    `"idProgramaServicio": 1,

`                    `"codigo": "COMEDOR",

`                    `"nombre": "Menjador",

`                    `"tipoCalculo": "POR\_DIA",

`                    `"precio": 9.00,

`                    `"subtotal": 27.00,

`                    `"moneda": "EUR",

`                    `"cantidadCalculada": 3

`                `}

`            `],

`            `"restriccionesAlimentarias": [

`                `{

`                    `"idRestriccionAlim": 8,

`                    `"codigo": "ALERGIA\_FRUTOS\_SECOS",

`                    `"texto": "Alergia a frutos secos",

`                    `"categoria": "ALERGIA",

`                    `"requiereAlertaVisual": **true**,

`                    `"esAlergeno": **true**,

`                    `"observaciones": "Alergia a frutos secos. Evitar nueces, almendras y trazas.",

`                    `"severidad": **null**

`                `}

`            `],

`            `"salud": **null**,

`            `"autorizadosRetiro": []

`        `}

`    `]

}


Pantalla

**Header**

Responsable:

Nuria Costa\
+34600123456\
nuria.costa@test.com

Estado Inscripción:

Estado: CONFIRMADA\
Pago: PENDIENTE\
Saldo: €450

Participantes

(una card por cada niño o “participante”)

![ref2]![ref2]

Aina Costa                    \
\
` `📅 Periodos                   \
` `- Semana 1 (22/06 - 26/06)    \
\
` `🚌 Servicios                  \
` `- Comedor (5 días)

\
` `⚠ Restricciones               \
` `- Celíaco                     \
\
` `🩺 Salud                      \
` `Asma leve                     \
\
` `👤 Retiro                     \
` `- Marta Puig                  \
` `- Jordi Costa                 

[ref1]: Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.005.png
[ref2]: Aspose.Words.fca12d58-6fa5-4e6c-ad51-b46091f8d1a8.008.png
