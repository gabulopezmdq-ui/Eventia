# Eventia – Panel Audiencias

Hoy el panel de Audicencia (CRM) está mostrando información toda mezclada, los responsables de familia, los niños de una colonia, los que asistieron a un tardeo, y esta visualización no sirve para sacar info que pueda servir para armar una campaña, convocatoria, etc.

Lo que haría:

En el menú **Audiencia (CRM)** no mostraría una única grilla plana. 

Opción: Pondría filtros rápidos arriba:

[Todos] [Responsables] [Participantes] [Asistentes evento públicos] [Invitados eventos privados] [Staff]

**Endpoint — Opcional pero muy útil: filtros disponibles**

GET /audiencia\_crm/filtros?idCuenta=5

Response:

{

`    `"tipos": [

`        `{

`            `"codigo": "TODOS",

`            `"texto": "Todos"

`        `},

`        `{

`            `"codigo": "RESPONSABLE\_PROGRAMA",

`            `"texto": "Responsables / familias"

`        `},

`        `{

`            `"codigo": "PARTICIPANTE\_PROGRAMA",

`            `"texto": "Participantes programas"

`        `},

`        `{

`            `"codigo": "EVENTO\_PUBLICO",

`            `"texto": "Asistentes eventos públicos"

`        `},

`        `{

`            `"codigo": "EVENTO\_PRIVADO",

`            `"texto": "Invitados eventos privados"

`        `},

`        `{

`            `"codigo": "STAFF",

`            `"texto": "Staff"

`        `},

`        `{

`            `"codigo": "SIN\_CLASIFICAR",

`            `"texto": "Sin clasificar"

`        `}

`    `],

`    `"alertas": [

`        `{

`            `"codigo": "COMEDOR",

`            `"texto": "Comedor"

`        `},

`        `{

`            `"codigo": "RESTRICCION\_ALIMENTARIA",

`            `"texto": "Restricción alimentaria"

`        `},

`        `{

`            `"codigo": "SALUD",

`            `"texto": "Salud"

`        `}

`    `]

}

Grilla principal mejorada

**Endpoint 1 — Listado CRM segmentado**

**GET /audiencia\_crm/listar?idCuenta=5&tipo=TODOS&q=&idEvento=**

Parámetros:

- **idCuenta**: obligatorio
- **tipo**: TODOS | RESPONSABLE\_PROGRAMA | PARTICIPANTE\_PROGRAMA | EVENTO\_PUBLICO | EVENTO\_PRIVADO | STAFF
- **q**: búsqueda opcional
- **idEvento**: opcional

Respuesta ejemplo:

[

`    `{

`        `"id\_audiencia\_persona": 74,

`        `"nombre": "Laura",

`        `"apellido": "Benet",

`        `"email": "laura.benet.salud@test.com",

`        `"celular": "+34600777111",

`        `"tipo\_persona": "RESPONSABLE\_PROGRAMA",

`        `"tipo\_label": "Responsable / familia",

`        `"contexto": "Casal d’estiu Aquamar 2026",

`        `"id\_evento\_contexto": 34,

`        `"ultima\_participacion": "2026-05-06T15:19:21.48115+00:00",

`        `"eventos\_registrados": 1,

`        `"eventos\_asistidos": 0,

`        `"alertas": [],

`        `"tags": []

`    `},

`    `{

`        `"id\_audiencia\_persona": 75,

`        `"nombre": "Marc",

`        `"apellido": "Benet",

`        `"email": **null**,

`        `"celular": **null**,

`        `"tipo\_persona": "PARTICIPANTE\_PROGRAMA",

`        `"tipo\_label": "Participante programa",

`        `"contexto": "Casal d’estiu Aquamar 2026",

`        `"id\_evento\_contexto": 34,

`        `"ultima\_participacion": "2026-05-06T15:19:25.978188+00:00",

`        `"eventos\_registrados": 1,

`        `"eventos\_asistidos": 0,

`        `"alertas": [

`            `"RESTRICCION\_ALIMENTARIA",

`            `"SALUD"

`        `],

`        `"tags": []

`    `},

Columnas sugeridas:

- Persona
- Tipo
- Contexto
- Contacto
- Última participación
- Eventos/Programas
- Alertas
- Tags
- Ver Detalle

Ejemplo:

**Persona          Tipo             Contexto              Contacto              Alertas**\
Jordi Serra      Responsable      Casal Aquamar         email/teléfono        -\
Eloi Serra       Participante     Casal Aquamar         Sin contacto          Salud / Comedor\
Kai Pons         Participante     Casal Aquamar         Sin contacto          Restricción alim.\
Ana Pérez        Asistente        Tardeo Sunset         email/teléfono        Beneficio



**Endpoint 2 — Detalle CRM inteligente**

**GET /audiencia\_crm/{idAudienciaPersona}/detalle**

`	`Ejemplo:

**GET /audiencia\_crm/75/detalle**

Response:

{

`    `"id\_audiencia\_persona": 75,

`    `"nombre": "Marc",

`    `"apellido": "Benet",

`    `"email": **null**,

`    `"celular": **null**,

`    `"fecha\_nacimiento": "2017-03-14T00:00:00",

`    `"edad": 9,

`    `"tipo\_persona": "PARTICIPANTE\_PROGRAMA",

`    `"tipo\_label": "Participante programa",

`    `"alertas": [

`        `"RESTRICCION\_ALIMENTARIA",

`        `"SALUD"

`    `],

`    `"tags": [],

`    `"historial": [

`        `{

`            `"id\_evento": 34,

`            `"evento": "Casal d’estiu Aquamar 2026",

`            `"tipo\_operacion": "PROGRAMA",

`            `"origen\_registro": "PROGRAMA\_INSCRIPCION",

`            `"fecha\_registro": "2026-05-06T15:19:25.978188+00:00",

`            `"asistio": **false**,

`            `"beneficio\_otorgado": **false**,

`            `"beneficio\_canjeado": **false**

`        `}

`    `],

`    `"programa": {

`        `"id\_evento": 34,

`        `"evento": "Casal d’estiu Aquamar 2026",

`        `"id\_inscripcion": 26,

`        `"id\_rsvp\_grupo": 41,

`        `"nombre\_grupo": "Familia Benet",

`        `"responsable": {

`            `"idAudienciaPersona": 74,

`            `"nombreCompleto": "Laura Benet",

`            `"email": "laura.benet.salud@test.com",

`            `"telefono": "+34600777111",

`            `"relacion": "Madre"

`        `},

`        `"participantes\_grupo": [

`            `{

`                `"idAudienciaPersona": 75,

`                `"idInvitado": 131,

`                `"idRsvpGrupoIntegrante": 91,

`                `"nombreCompleto": "Marc Benet",

`                `"edad": 9

`            `}

`        `],

`        `"periodos": [

`            `{

`                `"nombre": "Setmana 1 - del 22/06 al 26/06",

`                `"fechaDesde": "2026-06-22",

`                `"fechaHasta": "2026-06-26",

`                `"precioBase": 120.00,

`                `"moneda": "EUR"

`            `}

`        `],

`        `"servicios": [

`            `{

`                `"nombre": "Acollida",

`                `"codigo": "ACOGIDA",

`                `"tipoCalculo": "POR\_DIA",

`                `"precio": 4.00,

`                `"subtotal": 12.00,

`                `"moneda": "EUR",

`                `"fechas": [

`                    `"2026-06-24",

`                    `"2026-06-25",

`                    `"2026-06-26"

`                `]

`            `}

`        `],

`        `"restricciones": [

`            `{

`                `"idRestriccionAlim": 7,

`                `"codigo": "GLUTEN\_CELIACO",

`                `"categoria": "INTOLERANCIA",

`                `"iconKey": "GLUTEN",

`                `"requiereAlertaVisual": **true**,

`                `"requiereConfirmacionOrganizador": **true**,

`                `"esAlergeno": **true**,

`                `"observaciones": **null**,

`                `"severidad": **null**

`            `}

`        `],

`        `"salud": {

`            `"tieneProblemaMedico": **true**,

`            `"problemaMedicoDetalle": "Asma leve. Puede necesitar inhalador ante esfuerzo físico.",

`            `"tieneAlergiasNoAlimentarias": **false**,

`            `"alergiasNoAlimentariasDetalle": **null**,

`            `"necesidadEspecial": "Evitar carrera intensa si hace mucho calor.",

`            `"coberturaMedica": "Sanitas",

`            `"observacionesFamilia": "Avisar si presenta tos persistente o dificultad para respirar.",

`            `"autorizaEmergenciaMedica": **true**

`        `},

`        `"autorizados\_retiro": [

`            `{

`                `"nombreAutorizado": "Laura Benet",

`                `"telefonoAutorizado": "+34600777111",

`                `"relacion": "Madre",

`                `"observaciones": **null**

`            `},

`            `{

`                `"nombreAutorizado": "Oriol Benet",

`                `"telefonoAutorizado": "+34600777222",

`                `"relacion": "Padre",

`                `"observaciones": **null**

`            `}

`        `]

`    `}

}



**Detalle de persona:** 

**Después lo analizamos bien para ver qué mostrar y no tener que hacer un detalle personalizado sino uno genérico que se adapte a eventos, tardeos, colonias, padres responsables, niños, etc**

