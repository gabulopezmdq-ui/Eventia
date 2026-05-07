# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# CIRCUITO AUTORIZACIONES

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho


**Programa → Gestión Inscripciones → Autorizaciones**

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
  - Autorizaciones???

- Clínica de Tenis (card?)
  - ……..



Las autorizaciones legales están guardadas en 

- ef\_programa\_inscripcion\_autorizaciones, con 
  - id\_inscripcion, 
  - id\_rsvp\_grupo\_integrante, 
  - codigo, 
  - texto\_aceptado, 
  - aceptada, 
  - fecha\_aceptacion, 
  - nombre\_firmante, 
  - ip\_aceptacion, 
  - activo . 

Y en la inscripción pública ya estaba definido que hay autorizaciones por participante y autorizaciones generales del grupo.

**Endpoint**

**GET /programas/inscripciones/{idInscripcion}/autorizaciones?idIdioma=1**

Ejemplo:

**GET /programas/inscripciones/24/autorizaciones?idIdioma=1**

Response:

{

`    `"id\_inscripcion": 24,

`    `"responsable": "Marta Rovira",

`    `"email": "marta.rovira.acogida@test.com",

`    `"telefono": "+34600999111",

`    `"autorizaciones\_grupo": [

`        `{

`            `"id\_inscripcion\_autorizacion": 12,

`            `"id\_inscripcion": 24,

`            `"id\_rsvp\_grupo\_integrante": **null**,

`            `"participante": **null**,

`            `"id\_programa\_autorizacion\_config": 3,

`            `"codigo": "CUSTOM\_TRATAMIENTO\_DATOS\_AQUAMAR",

`            `"titulo": "Autorización para el tratamiento de datos por parte de Aquamar",

`            `"texto\_aceptado": "Autoritzo Aquamar a tractar les dades facilitades en aquesta inscripció per a la gestió del casal i les comunicacions relacionades.",

`            `"aceptada": **true**,

`            `"fecha\_aceptacion": "2026-05-05T16:36:22.941297+00:00",

`            `"nombre\_firmante": "Marta Rovira"

`        `}

`    `],

`    `"autorizaciones\_participantes": [

`        `{

`            `"id\_inscripcion\_autorizacion": 8,

`            `"id\_inscripcion": 24,

`            `"id\_rsvp\_grupo\_integrante": 85,

`            `"participante": "Pau Rovira",

`            `"id\_programa\_autorizacion\_config": 1,

`            `"codigo": "EMERGENCIA\_MEDICA",

`            `"titulo": "EMERGENCIA\_MEDICA",

`            `"texto\_aceptado": "Autoritzo l’equip del programa a actuar davant una emergència mèdica i a contactar amb els serveis corresponents si fos necessari.",

`            `"aceptada": **true**,

`            `"fecha\_aceptacion": "2026-05-05T16:36:20.614863+00:00",

`            `"nombre\_firmante": "Marta Rovira"

`        `},

`        `{

`            `"id\_inscripcion\_autorizacion": 10,

`            `"id\_inscripcion": 24,

`            `"id\_rsvp\_grupo\_integrante": 86,

`            `"participante": "Laia Rovira",

`            `"id\_programa\_autorizacion\_config": 1,

`            `"codigo": "EMERGENCIA\_MEDICA",

`            `"titulo": "EMERGENCIA\_MEDICA",

`            `"texto\_aceptado": "Autoritzo l’equip del programa a actuar davant una emergència mèdica i a contactar amb els serveis corresponents si fos necessari.",

`            `"aceptada": **true**,

`            `"fecha\_aceptacion": "2026-05-05T16:36:22.58015+00:00",

`            `"nombre\_firmante": "Marta Rovira"

`        `},

`        `{

`            `"id\_inscripcion\_autorizacion": 9,

`            `"id\_inscripcion": 24,

`            `"id\_rsvp\_grupo\_integrante": 85,

`            `"participante": "Pau Rovira",

`            `"id\_programa\_autorizacion\_config": 2,

`            `"codigo": "USO\_IMAGEN",

`            `"titulo": "USO\_IMAGEN",

`            `"texto\_aceptado": "Autoritzo l’ús d’imatges del participant preses durant el programa per a comunicacions internes o promocionals del programa.",

`            `"aceptada": **true**,

`            `"fecha\_aceptacion": "2026-05-05T16:36:20.814879+00:00",

`            `"nombre\_firmante": "Marta Rovira"

`        `},

`        `{

`            `"id\_inscripcion\_autorizacion": 11,

`            `"id\_inscripcion": 24,

`            `"id\_rsvp\_grupo\_integrante": 86,

`            `"participante": "Laia Rovira",

`            `"id\_programa\_autorizacion\_config": 2,

`            `"codigo": "USO\_IMAGEN",

`            `"titulo": "USO\_IMAGEN",

`            `"texto\_aceptado": "Autoritzo l’ús d’imatges del participant preses durant el programa per a comunicacions internes o promocionals del programa.",

`            `"aceptada": **false**,

`            `"fecha\_aceptacion": "2026-05-05T16:36:22.758832+00:00",

`            `"nombre\_firmante": "Marta Rovira"

`        `}

`    `]

}

**Pantalla**

Opciones**:**

- Una opción es en la grilla de Inscriptos, cuando se abre el detalle mostrar una ficha con las autorizaciones

  Otra opción es hacer una pantalla de Autorizaciones, mostrar una grilla de inscriptos, y al hacer clic en el botón ver autorizaciones mostrar la siguiente info (este sería el endpoint para la grilla de inscriptos **GET /programas/{idEvento}/inscriptos**)


Autorizaciones legales\
\
Grupo familiar\
✔ Tratamiento de datos personales\
Firmó: Laura Serra\
Fecha: 02/05/2026 14:22\
\
Participantes\
\
Eloi Serra\
✔ Condiciones generales\
✖ Uso de imagen\
\
Txell Serra\
✔ Condiciones generales\
✔ Uso de imagen


*Reglas visuales:*

aceptada = true  → chip verde "Aceptada" o tilde\
aceptada = false → chip rojo/gris "No aceptada" o cruz
