# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# SALUD DEL PROGRAMA

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho

**Programa → Gestión Inscripciones → Ficha de Salud**

No lo mezclamos con la configuración del programa. Tiene que ser una pantalla nueva dentro del programa (evento) y dentro de otro menú, al igual que los Pagos por ejemplo.

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

Asociado al Evento / Programa debería estar la Ficha de Salud en la que se puede ver todo lo que los padres registraron al inscribir a sus hijos y todos los incidentes que el staff registró.

Objetivo

Gestionar y consultar toda la información médica declarada en la inscripción:

- Ficha médica
- Contactos de emergencia
- Medicaciones
- Acciones / incidentes
- Restricciones alimentarias

Está pensado para:

- Operación diaria
- Seguimiento
- Seguridad
- Comunicación con las familias
- Coordinación interna

**Estructura general de pantalla:**

Programa: Casal d’estiu Aquamar 2026 (campo “programa)

Cards Resumen

El endpoint no lo devuelve, si el front puede calcularlo, poner las cards, si no, obviarlas

Seguimientos 1

Medicaciones 0

Participantes con Alertas 28

Problemas médicos 0

![](Aspose.Words.16f10c2c-dcf6-45d6-858c-ca5bb4f9063c.001.png)![](Aspose.Words.16f10c2c-dcf6-45d6-858c-ca5bb4f9063c.002.png)![](Aspose.Words.16f10c2c-dcf6-45d6-858c-ca5bb4f9063c.003.png)![](Aspose.Words.16f10c2c-dcf6-45d6-858c-ca5bb4f9063c.004.png)

Reglas para armar las cards:

- Problemas médicos: cantidad de items donde tiene\_problema\_medico = true
- Participantes con alertas: cantidad de items donde alerta\_visual = true
- Medicaciones: cantidad de items donde tiene\_medicacion = true
- Seguimientos: cantidad de items donde requiere\_seguimiento = true

Le pregunté al chatgpt como las calculaba el front y me respondió esto:

const totalProblemasMedicos = items.filter(x => x.tiene\_problema\_medico).length;\
\
const totalAlertas = items.filter(x => x.alerta\_visual).length;\
\
const totalMedicaciones = items.filter(x => x.tiene\_medicacion).length;\
\
const totalSeguimientos = items.filter(x => x.requiere\_seguimiento).length;

Tabs:

- Panel Principal
- Fichas
- Medicaciones
- Acciones / incidentes
- Restricciones alimentarias

**Tab Panel Principal**

Objetivo:

Muestra la grilla operativa general rápida.

Debe responder:

- ¿Qué niños requieren atención?
- ¿Quién tiene alertas?
- ¿Quién tiene seguimiento?
- ¿Quién tiene medicación?

Filtros (los filtros son por tab, cada tab filtra distinto):

- Buscar (por participante / responsable / teléfono)
- Solo alertas (si/no)
- Nivel alerta: Combo: TODOS / ALTA / MEDIA / NORMAL
- Con Medicación (si/no)

**Endpoint**

**GET /programas/{idEvento}/salud/panel**

Ejemplos:

GET /programas/34/salud/panel?soloAlertas=false

GET /programas/34/salud/panel?q=martina&soloAlertas=true



Descripción filtros:

|**Parámetro**|**Tipo**|**Descripción**|
| :- | :- | :- |
|**q**|string|Busca participante, responsable, teléfono|
|**soloAlertas**|bool|Solo registros con alertas|
|**nivelAlerta**|string|TODOS / ALTA / MEDIA / NORMAL|
|**tieneMedicacion**|bool|Filtra participantes con medicación|
|**requiereSeguimiento**|bool|Filtra participantes con seguimiento|
|**tieneRestricciones**|bool|Filtra restricciones alimentarias|


Response ejemplo

`    `{

`        `"id\_inscripcion": 25,

`        `"id\_invitado": 128,

`        `"id\_rsvp\_grupo\_integrante": 88,

`        `"participante": "Arnau Soler",

`        `"responsable": "Nuria Soler",

`        `"telefono\_responsable": "+34600888111",

`        `"email\_responsable": "nuria.soler.emergencias@test.com",

`        `"tiene\_problema\_medico": **true**,

`        `"problema\_medico\_detalle": "Asma leve. Lleva inhalador en mochila.",

`        `"tiene\_alergias\_no\_alimentarias": **false**,

`        `"alergias\_no\_alimentarias\_detalle": **null**,

`        `"tiene\_necesidad\_especial": **true**,

`        `"necesidad\_especial\_detalle": "Evitar actividad intensa si hace mucho calor.",

`        `"tiene\_restricciones\_alimentarias": **true**,

`        `"restricciones\_alimentarias": [

`            `"GLUTEN\_CELIACO"

`        `],

`        `"tiene\_medicacion": **true**,

`        `"medicaciones": [

`            `"Ventolin"

`        `],

`        `"contacto\_emergencia": "Nuria Soler",

`        `"telefono\_emergencia": "+34600888111",

`        `"autoriza\_emergencia\_medica": **true**,

`        `"observaciones\_familia": "Avisar si se agita o tose mucho.",

`        `"acciones\_salud\_count": 0,

`        `"requiere\_seguimiento": **false**,

`        `"alerta\_visual": **true**,

`        `"nivel\_alerta": "ALTA"

`    `},

`    `{

Grilla

|**Participante**|**Responsable**|**Teléfono**|**Restricciones Alimentarias**|**Medicación**|**Seguimiento**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- |
|**Abril Prats**|Gemma Prats|+34600611111|HALAL|No|No|Ver detalle / Registrar acción|
|**Aina Costa**|Nuria Costa|+34600123456|GLUTEN\_CELIACO|No|No|Ver detalle / Registrar acción|
|**Bruna Pons**|Carla Pons|+34600633333|ALERGIA\_APIO, ALERGIA\_SULFITOS|No|No|Ver detalle / Registrar acción|
|**Iu Mas**|Paula Mas|+34600567890|ALERGIA\_LECHE, ALERGIA\_HUEVO|No|No|Ver detalle / Registrar acción|
|**Arlet Vidal**|Clara Vidal|+34600444555|—|No|No|Ver detalle / Registrar acción|
|**Biel Vidal**|Clara Vidal|+34600444555|—|No|No|Ver detalle / Registrar acción|
|**Arnau Soler**|Nuria Soler|+34600888111|GLUTEN\_CELIACO|SI|NO|Ver detalle / Registrar acción|
|**"participante"**|"responsable"|<p>"telefono\_</p><p>responsable"</p>|<p>"restricciones\_</p><p>\_alimentarias"</p>|<p>"tiene\_</p><p>medicacion"</p>|<p>"requiere\_</p><p>seguimiento"</p>||

Botón Ver Detalle:

**Endpoint**:

**GET /programas/34/salud/participantes/{id\_invitado}/detalle**

Ejemplo:

GET /programas/34/salud/participantes/128/detalle

Respuesta:

{

`    `"id\_evento": 34,

`    `"id\_inscripcion": 16,

`    `"id\_invitado": 103,

`    `"id\_rsvp\_grupo\_integrante": 63,

`    `"participante": "Roc Mas",

`    `"responsable": "Paula Mas",

`    `"telefono\_responsable": "+34600567890",

`    `"email\_responsable": "paula.mas.cocina@test.com",

`    `"ficha": **null**,

`    `"medicaciones": [],

`    `"acciones": [],

`    `"restricciones\_alimentarias": [

`        `"SIN\_PICANTE",

`        `"ALERGIA\_COLORANTES"

`    `]

}

Abre un modal con los siguientes campos:

Sección 1 — Datos generales

- Participante
- Responsable
- Teléfono
- Email

{

`    `"id\_evento": 34,

`    `"id\_inscripcion": 25,

`    `"id\_invitado": 128,

`    `"id\_rsvp\_grupo\_integrante": 88,

`    `"participante": "Arnau Soler",

`    `"responsable": "Nuria Soler",

`    `"telefono\_responsable": "+34600888111",

`    `"email\_responsable": "nuria.soler.emergencias@test.com",


Sección 2 — Salud

- Problema médico
- Alergias
- Necesidades especiales
- Cobertura médica
- Observaciones familia

"ficha": {

`        `"id\_invitado": 128,

`        `"id\_ficha\_salud": 15,

`        `"id\_evento": 34,

`        `"id\_inscripcion": 25,

`        `"tiene\_problema\_medico": **true**,

`        `"detalle\_problema\_medico": "Asma leve. Lleva inhalador en mochila.",

`        `"tiene\_alergias\_no\_alimentarias": **false**,

`        `"detalle\_alergias\_no\_alimentarias": **null**,

`        `"tiene\_necesidad\_especial": **true**,

`        `"detalle\_necesidad\_especial": "Evitar actividad intensa si hace mucho calor.",

`        `"tiene\_cobertura\_medica": **true**,

`        `"cobertura\_medica\_nombre": "Mutua Salut",

`        `"cobertura\_medica\_numero": **null**,

`        `"contacto\_emergencia\_nombre": **null**,

`        `"contacto\_emergencia\_telefono": **null**,

`        `"contacto\_emergencia\_relacion": **null**,

`        `"autoriza\_emergencia\_medica": **true**,

`        `"observaciones\_familia": "Avisar si se agita o tose mucho.",

`        `"observaciones\_internas": **null**,

`        `"activo": **true**,

`        `"fecha\_alta": "2026-05-06T12:33:03.495342+00:00",

`        `"id\_rsvp\_grupo\_integrante": 88,


Sección 3 — Contactos emergencia

Grilla:

- Nombre
- Teléfono
- Relación

"contactos\_emergencia": [

`            `{

`                `"nombre": "Nuria Soler",

`                `"telefono": "+34600888111",

`                `"relacion": "Madre",

`                `"orden": 1

`            `},

`            `{

`                `"nombre": "Pere Soler",

`                `"telefono": "+34600888222",

`                `"relacion": "Padre",

`                `"orden": 2

`            `},

`            `{

`                `"nombre": "Rosa Martí",

`                `"telefono": "+34600888333",

`                `"relacion": "Abuela",

`                `"orden": 3

`            `}

`        `],


Sección 4 — Medicaciones

Grilla:

- Medicamento
- Dosis
- Frecuencia
- Horario
- Indicaciones
- Administración autorizada?
- Requiere refrigeración?

"medicaciones": [

`        `{

`            `"id\_medicacion": 3,

`            `"id\_evento": 34,

`            `"id\_inscripcion": 25,

`            `"id\_participante": **null**,

`            `"participante": **null**,

`            `"nombre\_medicamento": "Ventolin",

`            `"dosis": "2 puff",

`            `"frecuencia": "En caso de crisis",

`            `"horario": **null**,

`            `"instrucciones": "Usar si presenta dificultad respiratoria.",

`            `"administracion\_autorizada": **true**,

`            `"debe\_llevar\_participante": **false**,

`            `"requiere\_refrigeracion": **false**,

`            `"activo": **true**,

`            `"fecha\_alta": "2026-05-06T12:32:58.986035+00:00"

`        `}

Sección 5 — Restricciones alimentarias

Lista chips:

- CELÍACO
- SIN LACTOSA
- VEGETARIANO

"restricciones\_alimentarias": [

`        `"GLUTEN\_CELIACO"

`    `]

Sección 6 — Acciones / incidentes

Grilla / Timeline:

|**Fecha**|**Tipo Acción**|**Descripción**|
| :- | :- | :- |
|**24/06/2026 13:40**|DERIVACION|Se deriva a centro médico por dificultad respiratoria persistente|
|**24/06/2026 13:05**|CONTACTO\_FAMILIA|Se contactó a la madre por persistencia de tos y cansancio. Se acordó retiro anticipado|
|**24/06/2026 12:20**|MEDICACION|Se administró Ventolin por episodio leve de dificultad respiratoria|
|**24/06/2026 11:40**|PRIMEROS\_AUXILIOS|Golpe leve en rodilla durante actividad deportiva. Se aplicó hielo|

"acciones": [

`        `{

`            `"id\_accion\_salud": 5,

`            `"id\_evento": 34,

`            `"id\_participante": 128,

`            `"idInscripcion": 0,

`            `"fecha\_hora": "2026-06-24T13:40:00+00:00",

`            `"tipo\_accion": "DERIVACION",

`            `"descripcion": "Se deriva a centro médico por dificultad respiratoria persistente.",

`            `"requirio\_contacto\_familia": **true**,

`            `"contacto\_realizado": **true**,

`            `"requiere\_seguimiento": **true**,

`            `"usuario\_registro": 9,

`            `"activo": **true**

`        `},

`        `{

`            `"id\_accion\_salud": 4,

`            `"id\_evento": 34,

`            `"id\_participante": 128,

`            `"idInscripcion": 0,

`            `"fecha\_hora": "2026-06-24T13:05:00+00:00",

`            `"tipo\_accion": "CONTACTO\_FAMILIA",

`            `"descripcion": "Se contactó a la madre por persistencia de tos y cansancio. Se acordó retiro anticipado.",

`            `"requirio\_contacto\_familia": **true**,

`            `"contacto\_realizado": **true**,

`            `"requiere\_seguimiento": **true**,

`            `"usuario\_registro": 9,

`            `"activo": **true**

`        `},

`        `{

`            `"id\_accion\_salud": 3,

`            `"id\_evento": 34,

`            `"id\_participante": 128,

`            `"idInscripcion": 0,

`            `"fecha\_hora": "2026-06-24T12:20:00+00:00",

`            `"tipo\_accion": "MEDICACION",

`            `"descripcion": "Se administró Ventolin por episodio leve de dificultad respiratoria.",

`            `"requirio\_contacto\_familia": **true**,

`            `"contacto\_realizado": **true**,

`            `"requiere\_seguimiento": **true**,

`            `"usuario\_registro": 9,

`            `"activo": **true**

`        `},

`        `{

`            `"id\_accion\_salud": 2,

`            `"id\_evento": 34,

`            `"id\_participante": 128,

`            `"idInscripcion": 0,

`            `"fecha\_hora": "2026-06-24T11:40:00+00:00",

`            `"tipo\_accion": "PRIMEROS\_AUXILIOS",

`            `"descripcion": "Golpe leve en rodilla durante actividad deportiva. Se aplicó hielo.",

`            `"requirio\_contacto\_familia": **false**,

`            `"contacto\_realizado": **false**,

`            `"requiere\_seguimiento": **false**,

`            `"usuario\_registro": 9,

`            `"activo": **true**

`        `},


Botón Registrar Acción:

Al hacer clic se abre modal con los siguientes campos:

- Fecha Y Hora
- Participante
  - Sólo lectura
- Tipo de Acción:
  - Combo
  - **Endpoint**:

    **GET / programas/salud/tipos-accion?idIdioma=1**	

    El valor que guarda es código

[

`    `{

`        `"id": 1,

`        `"codigo": "MEDICACION",

`        `"texto": "Medicación",

`        `"orden": 1

`    `},

`    `{

`        `"id": 2,

`        `"codigo": "PRIMEROS\_AUXILIOS",

`        `"texto": "Primeros auxilios",

`        `"orden": 2

`    `},

- Descripción
  - text
- Requirió contactar a la familia? 
  - Toggle (o checkbox)
  - Si false, inhabilitar el campo “El contacto fue realizado?” y dejarlo en false
- El contacto fue realizado? 
  - Toggle (o checkbox)
- Requiere seguimiento? 
  - Toggle (o checkbox)

Al hacer clic en **Guardar** llama al **endpoint**:

**POST /programas/34/salud/acciones/registrar**

JSON ejemplo:

{

`  `"id\_inscripcion": 25,

`  `"id\_participante": 128,

`  `"fecha\_hora": "2026-06-24T13:40:00+00:00",

`  `"tipo\_accion": "DERIVACION",

`  `"descripcion": "Se deriva a centro médico por dificultad respiratoria persistente.",

`  `"requirio\_contacto\_familia": **true**,

`  `"contacto\_realizado": **true**,

`  `"requiere\_seguimiento": **true**

}

Y se actualiza la grilla


**Tab Fichas**

Objetivo

Ver la información declarada por la familia durante la inscripción.

Ejemplos:

- Problema médico informado
- Alergias no alimentarias
- Observaciones de salud
- Autorización ante emergencia
- Contacto de emergencia

Filtros

- Buscar
  - Texto
- Tiene problema médico
  - checkbox
- Tiene alergias
  - checkbox
- Tiene medicación
  - checkbox
- autoriza emergencia médica
  - checkbox

Grilla

**Endpoint:**

**GET /programas/{idEvento}/salud/fichas**

Ejemplo:

**GET /programas/34/salud/fichas**

|**Participante**|**Responsable**|**Problema médico**|**Alergias**|**Necesidad especial**|**Cobertura**|**Emergencia**|**Contactos**|**Medicaciones**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
|**Laia Puig**|Marta Puig|Sí|Sí|No|Sanitas|Sí|1|1|Ver detalle|
|**Clara Ribas**|Elena Ribas|Sí|No|No|Mutua local|Sí|0|0|Ver detalle|
|**Berta Soler**|Nuria Soler|No|Sí|No|Mutua Salut|Sí|2|0|Ver detalle|

Botón **Ver detalle** 

Al hacer clic se llama al:

**Endpoint**:

**GET /programas/34/salud/participantes/{id\_invitado}/detalle**

Ejemplo:

GET /programas/34/salud/participantes/128/detalle

***Es la misma pantalla de Ver detalle del Tab Panel Principal***




Tab Medicaciones

Objetivo:

Vista rápida SOLO de medicaciones. Ideal para enfermería, coordinador, monitores

Filtros:

- Buscar participante
  - texto
- Requiere autorización
  - Checkbox o toggle
- Tiene horario
  - Checkbox
- Medicación específica
  - text

Grilla

**Endpoint**:

**GET /programas/{idEvento}/salud/medicaciones**

Ejemplo:

**GET /programas/34/salud/medicaciones**

Respuesta

[

`    `{

`        `"id\_medicacion": 3,

`        `"id\_evento": 34,

`        `"id\_inscripcion": 25,

`        `"id\_participante": 128,

`        `"participante": "Arnau Soler",

`        `"nombre\_medicamento": "Ventolin",

`        `"dosis": "2 puff",

`        `"frecuencia": "En caso de crisis",

`        `"horario": **null**,

`        `"instrucciones": "Usar si presenta dificultad respiratoria.",

`        `"administracion\_autorizada": **true**,

`        `"debe\_llevar\_participante": **false**,

`        `"requiere\_refrigeracion": **false**,

`        `"activo": **true**,

`        `"fecha\_alta": "2026-05-06T12:32:58.986035+00:00"

`    `},

|**Participante**|**Medicación**|**Dosis**|**Frecuencia**|**Horario**|**Requiere autorización**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- |
|**Arnau Soler**|Ventolin|2 puff|En caso de crisis|—|Sí|Ver detalle|
|**Laia Puig**|Ventolin|2 puff|En caso necesario|—|Sí|Ver detalle|

Si no devuelve datos, mostrar:

- No hay medicaciones declaradas para este programa.

Botón Ver detalle:

Endpoint:

**GET /programas/{idEvento}/salud/participantes/{id\_invitado}/detalle**

`	`Ejemplo:

GET /programas/34/salud/participantes/{idInvitado}/detalle

Nos vuelve a servir el mismo endpoint. Tenemos 2 opciones:

- Armar un nuevo modal con la sección Medicaciones
- Mostrar el mismo modal y scrollear a la sección Medicaciones


Tab Acciones/Incidentes

Objetivo

Registro histórico operativo.

Filtros:

- Buscar participante
  - texto
- Tipo acción
  - Combo
  - **Endpoint**:
    - **GET /programas/salud/tipos-accion?idIdioma=1**
- contacto familia
- seguimiento
- fecha desde/hasta

Grilla

GET /programas/34/salud/acciones

|<p></p><p></p><p>**Fecha/hora**</p>|**Participante**|**Tipo**|**Descripción**|**Contactó familia**|**Seguimiento**|**Usuario**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- | :- |
|**24/06 11:20**|Aina Costa|OBSERVACION|Dolor de panza. Se observa evolución.|No|Sí|Admin|Ver detalle|
|**24/06 12:10**|Laia Puig|PRIMEROS\_AUXILIOS|Caída leve. Se aplicó hielo.|No|No|Admin|Ver detalle|
|**24/06 13:00**|Juan Pérez|CONTACTO\_FAMILIA|Se contactó al padre para retiro anticipado.|Sí|Sí|Admin|Ver detalle|

**Botón Registrar Acción:**

**Endpoint:**

**POST /programas/34/salud/acciones/registrar**	

Abre el modal que se abre en la grilla Panel Principal, botón Registrar Acción, o al abrir Detalle y registrar Acción. La funcionalidad es la misma

**Botón Ver detalle:**

**GET /programas/{idEvento}/salud/participantes/{id\_invitado}/detalle**

`	`Ejemplo:

GET /programas/34/salud/participantes/{idInvitado}/detalle

Nos vuelve a servir el mismo endpoint. Tenemos 2 opciones:

- Armar un nuevo modal con la sección Timeline
- Mostrar el mismo modal y scrollear a la sección Timeline

Tab Restricciones Alimentarias

Objetivo

Vista operativa alimentaria.

Filtros

- Buscar participante
  - texto
- restricción/categoría
  - combo de opciones:
    - ALERGIA
    - INTOLERANCIA
    - RELIGIOSO
    - ELECCION
    - OTRA
- solo alertas visuales
  - toggle o checkbox
- solo alérgenos
  - toggle o checkbox

Al no haber un endpoint específico, lo armamos como el panel Principal filtrando tiene\_restricciones\_alimentarias = true

**Endpoint**

**GET /programas/{idEvento}/salud/panel**

Ejemplos: GET /programas/34/salud/panel

|**Participante**|**Responsable**|**Restricciones**|**Nivel alerta**|**Acciones**|
| :- | :- | :- | :- | :- |
|**Bruna Pons**|Carla Pons|ALERGIA\_APIO, ALERGIA\_SULFITOS|MEDIA|Ver detalle|
|**Ona Navarro**|Sergi Navarro|ALERGIA\_PESCADO, ALERGIA\_MARISCOS|MEDIA|Ver detalle|
|**Roc Mas**|Paula Mas|SIN\_PICANTE, ALERGIA\_COLORANTES|MEDIA|Ver detalle|
|**Aina Costa**|Nuria Costa|GLUTEN\_CELIACO|MEDIA|Ver detalle|

Botón Ver detalle

Es el mismo endopoint que se usa en el panel Principal, ver detalle

**GET /programas/34/salud/participantes/{id\_invitado}/detalle**

Ejemplo:

GET /programas/34/salud/participantes/128/detalle

Ver si conviene poner botón Ver detalle o agregarle columnas a la grilla


