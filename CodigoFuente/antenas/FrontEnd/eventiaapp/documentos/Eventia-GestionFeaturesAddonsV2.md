# Eventia – Gestión de Features / Gestión de Add-ons (B2C/B2B)

# Gestión de Features

Objetivo

Explicar, el funcionamiento de la gestión de features en Eventia:

- entender qué es una feature
- entender quién define qué
- saber qué endpoints llamar
- saber qué mostrar en cada pantalla

Una feature es una funcionalidad que se puede usar en un evento o en una cuenta. Ejemplos: sugerencias musicales, playlist del organizador, bloqueos musicales, álbum, regalos, hospedajes, traslados, etc.

Para que una feature realmente se use, intervienen 3 capas:

|**Capa**|**Tabla**|**Para qué sirve**|**Quién la define**|
| :- | :- | :- | :- |
|**1. Catálogo global**|ef\_param\_features|Define qué features existen|Eventia / SuperAdmin|
|**2. Plan**|ef\_plan\_features|Define qué features permite cada plan|Eventia / SuperAdmin|
|**3. Evento**|ef\_evento\_features|Define qué features quedan prendidas o apagadas en un evento puntual|Organizador del evento|

Una feature se usa si:

- el plan la permite 
- el evento la tiene activa

Las features pueden estar incluidas en el plan o pueden comercializarse como características separadas en add-ons.

Esto significa que el front sólo debe consultar la respuesta del backend y mostrar lo que corresponda.

Tablas que intervienen

**ef\_param\_features:** 

Es el catálogo global. Acá se da de alta cada feature una sola vez.

- codigo: identificador técnico
- nombre: nombre visible
- descripcion: explicación corta
- categoria: Música, Logística, Comunicación, etc.
- scope\_default: EVENTO o CUENTA
- fase\_sugerida: en qué fase pensás usarla
- monetizable: si puede formar parte de un plan o addon
- activo: si sigue disponible
- config\_json: configuración por defecto
##
**ef\_param\_feature\_dependencias:**

Sirve para indicar que una feature necesita otra.

Ejemplo: MUSICA\_VOTACION requiere MUSICA\_SUGERENCIAS.

Si una feature depende de otra, el backend no debería dejar activarla sola.

**ef\_plan\_features:**

Define qué features incluye cada plan.

Ejemplo:

- B2C\_FREE: pocas features
- B2C\_BASIC: algunas
- B2C\_PRO: casi todas
- B2B\_STARTER / TEAM / PREMIUM: mismas ideas, pero a nivel cuenta

**ef\_evento\_features:**

Guarda el prendido/apagado real de cada feature en un evento puntual.

Ejemplo: el plan permite Música, pero el organizador decide usar solo Playlist y Bloqueos, y dejar apagadas las sugerencias.

**ef\_evento\_feature\_visibilidad:**

Guarda la visibilidad de una feature para un evento/programa.\
\
No define si la feature está activa. Eso lo sigue haciendo ef\_evento\_features.\
\
Sirve para indicar dónde se muestra una feature:

- visible\_acceso\_evento
- visible\_centro\_evento
- visible\_acceso\_programa
- visible\_centro\_programa

ACCESO = pantalla inicial:

- invitación RSVP
- registro público
- inscripción a programa

CENTRO = portal posterior:

- centro del invitado
- portal responsable/familia

\
El front no debe insertar esta tabla directamente.\
El backend la genera automáticamente después de guardar features.

Lugares distintos donde se trabaja con features

|**Lugar**|**Quién entra**|**Qué hace**|
| :- | :- | :- |
|**Configuración / Módulos (Features)**|SuperAdmin|Da de alta features y define catálogo|
|**Evento / Configuración / Características**|Organizador|Prende o apaga las features que el plan le permite|


Visibilidad de Features: dónde se muestra cada funcionalidad

Además de activar o desactivar una feature en un evento/programa, Eventia permite definir **en qué superficie se verá**.

Una feature puede estar activa, pero no necesariamente mostrarse en todos lados.

Ejemplo:

- Novedades puede verse en el portal, pero no en la invitación inicial.
- Regalos puede verse en el portal del invitado, pero no en el RSVP.
- Servicios contratados puede verse en el portal del responsable de un programa, pero no en la inscripción pública.
- Restricciones alimentarias puede aparecer en RSVP de eventos y también en inscripción/portal de programas.

Conceptos importantes

- Feature activa: 
  - indica si la funcionalidad **se usa o no en el evento/programa.**
  - Tabla: ef\_evento\_features
  - Campo principal: activo

    Ejemplo:

    NOVEDADES\_EVENTO activa = true

    Significa que el evento puede usar novedades.

- Feature visible:
  - indica **dónde se muestra** una feature activa.
  - Tabla: ef\_evento\_feature\_visibilidad
  - Campos:
    - visible\_acceso\_evento: Mostrar en invitación / RSVP / landing inicial de evento
    - visible\_centro\_evento: Mostrar en portal persistente del invitado
    - visible\_acceso\_programa: Mostrar en inscripción pública inicial de programa
    - visible\_centro\_programa: Mostrar en portal persistente del responsable/familia

Diferencia entre ACCESO y CENTRO

|**Concepto**|**Qué es**|**Ejemplo**|
| :- | :- | :- |
|ACCESO|Pantalla inicial antes de confirmar o inscribirse|invitación RSVP, landing pública, inscripción al casal|
|CENTRO|Portal posterior persistente|portal del invitado, Mi Eventia, portal del responsable/familia|

Ejemplos:

- Evento privado:
  - ACCESO EVENTO = invitación RSVP
  - CENTRO EVENTO = portal del invitado

- Programa:
  - ACCESO PROGRAMA = inscripción pública del casal
  - CENTRO PROGRAMA = portal del responsable/familia

Defaults de visibilidad

La tabla: ef\_param\_features tiene campos default para cada feature:

- visible\_acceso\_evento\_default
- visible\_centro\_evento\_default
- visible\_acceso\_programa\_default
- visible\_centro\_programa\_default

Estos valores se usan cuando el evento/programa todavía no tiene una configuración específica en: ef\_evento\_feature\_visibilidad

Regla:

- Si existe ef\_evento\_feature\_visibilidad para el evento + feature:
  - usar esos valores
- Si no existe:
  - usar los defaults de ef\_param\_features


**Pantalla: Características del Evento / Programa**

Agregar una sección o botón:

- Características

Objetivo:

Cuando el usuario toca el botón **“Características”**, se ejecuta un endpoint que le devuelve al front todo junto:

- qué trae el **plan** 
- qué agrega el **addon** 
- qué dejó prendido o apagado el **evento** 
- qué queda **realmente usable**

Esta pantalla sirve para que el organizador decida:

- qué features quiere usar;
- dónde quiere mostrarlas;
- qué secciones se habilitan luego en el portal.

**Endpoint para cargar el formulario**:

**GET /features\_efectivas/GetByEvento?idEvento={idEvento}**

Ejemplo

GET /features\_efectivas/GetByEvento?idEvento=93

Respuesta:

{

`    `"id\_evento": 93,

`    `"scope\_comercial": "CUENTA",

`    `"id\_cuenta": 2,

`    `"id\_plan": 5,

`    `"plan\_codigo": "B2B\_STARTER",

`    `"plan\_nombre": "B2B Starter",

`    `"trial": {

`        `"dias\_restantes": 30,

`        `"vencido": **false**,

`        `"current\_period\_end": "2026-07-08T12:05:09.017788+00:00"

`    `},

`    `"addons\_evento": [

`        `{

`            `"id\_scope\_addon": 5,

`            `"id\_addon": 13,

`            `"codigo": "ADDON\_REGALOS",

`            `"nombre": "Regalos / lista",

`            `"estado": "ACTIVO",

`            `"activo": **true**,

`            `"fecha\_desde": "2026-06-05T17:12:06.221145+00:00",

`            `"fecha\_hasta": **null**,

`            `"config\_override": **null**,

`            `"descripcion": "Lista de regalos o datos de transferencia.",

`            `"scope": "EVENTO",

`            `"origen": "ADDON\_EVENTO",

`            `"categoria": "LOGISTICA",

`            `"features": [

`                `{

`                    `"id\_feature": 18,

`                    `"codigo": "REGALOS",

`                    `"nombre": "Regalos / lista",

`                    `"descripcion": "Lista de regalos, datos de transferencia o links; marcar comprado opcional.",

`                    `"categoria": "LOGISTICA",

`                    `"monetizable": **true**

`                `},

`                `{

`                    `"id\_feature": 34,

`                    `"codigo": "REGALOS\_FONDO\_METAS",

`                    `"nombre": "Fondo de aportes con metas",

`                    `"descripcion": "Metas con barra de progreso. Aportes por transferencia y confirmación del organizador.",

`                    `"categoria": "LOGISTICA",

`                    `"monetizable": **true**

`                `},

`                `{

`                    `"id\_feature": 33,

`                    `"codigo": "REGALOS\_LISTA",

`                    `"nombre": "Lista de regalos",

`                    `"descripcion": "Lista de regalos con reservas para evitar duplicados.",

`                    `"categoria": "LOGISTICA",

`                    `"monetizable": **true**

`                `}

`            `]

`        `}

`    `],

`    `"addons\_cuenta": [

`        `{

`            `"id\_scope\_addon": 2,

`            `"id\_addon": 19,

`            `"codigo": "ADDON\_BRANDING",

`            `"nombre": "Marca blanca / branding",

`            `"estado": "ACTIVO",

`            `"activo": **true**,

`            `"fecha\_desde": "2026-04-23T16:55:44.914358+00:00",

`            `"fecha\_hasta": **null**,

`            `"config\_override": "{\"pedido\": {\"moneda\": \"EUR\", \"mercado\": \"ES\"}}",

`            `"descripcion": "Branding avanzado sin marca Eventia.",

`            `"scope": "CUENTA",

`            `"origen": "ADDON\_CUENTA",

`            `"categoria": "MARCA",

`            `"features": [

`                `{

`                    `"id\_feature": 30,

`                    `"codigo": "BRANDING\_AVANZADO",

`                    `"nombre": "Branding avanzado / marca blanca",

`                    `"descripcion": "Logo/colores y experiencia sin marca Eventia (orientado B2B).",

`                    `"categoria": "MARCA",

`                    `"monetizable": **true**

`                `}

`            `]

`        `}

`    `],

`    `"features": [

`        `{

`            `"id\_feature": 38,

`            `"codigo": "AGENDA\_EVENTO",

`            `"nombre": "Agenda / Cronograma",

`            `"categoria": "COMUNICACION",

`            `"monetizable": **false**,

`            `"config\_default": "{\"modos\": [\"CRONOGRAMA\_EVENTO\", \"DIA\_TIPO\", \"FECHA\_ESPECIFICA\"], \"permitir\_importar\_tramos\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **true**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Permite configurar cronograma del evento, agenda tipo de programas y fechas especiales.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **true**,

`            `"permite\_centro\_programa": **true**

`        `},

`        `{

`            `"id\_feature": 5,

`            `"codigo": "CENTRO\_INVITADO",

`            `"nombre": "Centro del invitado",

`            `"categoria": "COMUNICACION",

`            `"monetizable": **true**,

`            `"config\_default": "{\"modo\_wallet\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **false**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Pantalla persistente del invitado con su acceso, RSVP y módulos habilitados (evita link perdido).",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **true**,

`            `"permite\_acceso\_evento": **false**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **true**

`        `},

`        `{

`            `"id\_feature": 7,

`            `"codigo": "NOTIFICACIONES",

`            `"nombre": "Notificaciones multicanal",

`            `"categoria": "COMUNICACION",

`            `"monetizable": **true**,

`            `"config\_default": "{\"opt\_in\": true, \"canales\": [\"EMAIL\", \"IN\_APP\"]}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **false**,

`            `"permite\_centro": **false**,

`            `"descripcion": "Notificaciones por email/in-app/push (sin WhatsApp).",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **false**,

`            `"permite\_centro\_evento": **false**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 6,

`            `"codigo": "NOVEDADES\_EVENTO",

`            `"nombre": "Novedades del evento",

`            `"categoria": "COMUNICACION",

`            `"monetizable": **true**,

`            `"config\_default": "{\"visibilidad\": \"POR\_ACCESO\", \"programacion\": false, \"permitir\_adjuntos\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **true**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **false**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Feed de publicaciones del organizador (previa, avisos, recordatorios, links).",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **false**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **true**

`        `},

`        `{

`            `"id\_feature": 19,

`            `"codigo": "HOSPEDAJES",

`            `"nombre": "Hospedajes sugeridos",

`            `"categoria": "LOGISTICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"mostrar\_mapa\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **true**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Listado de hospedajes recomendados por el organizador con links/mapa.",

`            `"visible\_acceso\_evento": **true**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 18,

`            `"codigo": "REGALOS",

`            `"nombre": "Regalos / lista",

`            `"categoria": "LOGISTICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"modo\": \"LINKS\_Y\_TRANSFERENCIA\", \"permitir\_marcar\_comprado\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **true**,

`            `"incluida\_por\_addon\_evento": **true**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **true**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN\_Y\_ADDON",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Lista de regalos, datos de transferencia o links; marcar comprado opcional.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 34,

`            `"codigo": "REGALOS\_FONDO\_METAS",

`            `"nombre": "Fondo de aportes con metas",

`            `"categoria": "LOGISTICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"permitir\_anonimo\": true, \"modo\_confirmacion\": \"INVITADO\_Y\_ORGANIZADOR\", \"mostrar\_pendientes\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **true**,

`            `"incluida\_por\_addon\_evento": **true**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **true**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "ADDON\_EVENTO",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Metas con barra de progreso. Aportes por transferencia y confirmación del organizador.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 33,

`            `"codigo": "REGALOS\_LISTA",

`            `"nombre": "Lista de regalos",

`            `"categoria": "LOGISTICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"sin\_vencimiento\": true, \"permitir\_reservas\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **true**,

`            `"incluida\_por\_addon\_evento": **true**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **true**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "ADDON\_EVENTO",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Lista de regalos con reservas para evitar duplicados.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 32,

`            `"codigo": "REGALOS\_TRANSFERENCIAS",

`            `"nombre": "Datos para transferir",

`            `"categoria": "LOGISTICA",

`            `"monetizable": **false**,

`            `"config\_default": "{\"modo\": \"TEXTO\_LIBRE\", \"multi\_moneda\": true, \"multi\_destino\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **true**,

`            `"activo\_resuelto": **false**,

`            `"disponible": **false**,

`            `"editable": **false**,

`            `"origen": "NO\_INCLUIDA",

`            `"motivo\_inactivo": "NO\_INCLUIDA",

`            `"mensaje\_ui": "Disponible contratando un addon o cambiando de plan.",

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Publica datos de transferencia (texto libre) por moneda y destino.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 20,

`            `"codigo": "TRANSPORTE",

`            `"nombre": "Transporte / transfers",

`            `"categoria": "LOGISTICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"modo\": \"INFORMATIVO\", \"permitir\_reservas\": false}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **true**,

`            `"visible\_centro": **true**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **true**,

`            `"descripcion": "Opciones de transporte, puntos de encuentro, horarios, cupos (si aplica).",

`            `"visible\_acceso\_evento": **true**,

`            `"visible\_centro\_evento": **true**,

`            `"visible\_acceso\_programa": **true**,

`            `"visible\_centro\_programa": **true**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **true**,

`            `"permite\_acceso\_programa": **true**,

`            `"permite\_centro\_programa": **true**

`        `},

`        `{

`            `"id\_feature": 30,

`            `"codigo": "BRANDING\_AVANZADO",

`            `"nombre": "Branding avanzado / marca blanca",

`            `"categoria": "MARCA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"white\_label\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **true**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **true**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "ADDON\_CUENTA",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **false**,

`            `"permite\_centro": **false**,

`            `"descripcion": "Logo/colores y experiencia sin marca Eventia (orientado B2B).",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **false**,

`            `"permite\_centro\_evento": **false**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 1,

`            `"codigo": "MUSICA\_SUGERENCIAS",

`            `"nombre": "Sugerencias musicales",

`            `"categoria": "MUSICA",

`            `"monetizable": **false**,

`            `"config\_default": "{\"solo\_si\_rsvp\_si\": true, \"max\_sugerencias\_por\_invitado\": 1}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **true**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **false**,

`            `"descripcion": "Permite a los invitados sugerir temas (tema, artista, link).",

`            `"visible\_acceso\_evento": **true**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **false**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 16,

`            `"codigo": "CHECKIN\_MANUAL",

`            `"nombre": "Check-in manual",

`            `"categoria": "OPERACION",

`            `"monetizable": **true**,

`            `"config\_default": "{\"modo\": \"BUSQUEDA\_RAPIDA\"}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **false**,

`            `"permite\_centro": **false**,

`            `"descripcion": "Ingreso manual/búsqueda rápida como plan B.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **false**,

`            `"permite\_centro\_evento": **false**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 39,

`            `"codigo": "CHECKLIST\_EVENTO",

`            `"nombre": "Checklist del organizador",

`            `"categoria": "OPERACION",

`            `"monetizable": **false**,

`            `"config\_default": "{\"prioridades\": [\"BAJA\", \"MEDIA\", \"ALTA\", \"URGENTE\"]}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **false**,

`            `"permite\_centro": **false**,

`            `"descripcion": "Permite gestionar tareas internas del organizador para un evento o programa.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **false**,

`            `"permite\_centro\_evento": **false**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 40,

`            `"codigo": "HISTORIAL\_EVENTO",

`            `"nombre": "Historial del evento",

`            `"categoria": "OPERACION",

`            `"monetizable": **false**,

`            `"config\_default": "{\"modulos\": [\"AGENDA\", \"NOVEDADES\", \"CHECKLIST\"]}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **false**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **false**,

`            `"permite\_centro": **false**,

`            `"descripcion": "Bitácora interna de acciones realizadas sobre el evento o programa.",

`            `"visible\_acceso\_evento": **false**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **false**,

`            `"visible\_centro\_programa": **false**,

`            `"permite\_acceso\_evento": **false**,

`            `"permite\_centro\_evento": **false**,

`            `"permite\_acceso\_programa": **false**,

`            `"permite\_centro\_programa": **false**

`        `},

`        `{

`            `"id\_feature": 21,

`            `"codigo": "RESTRICCIONES\_ALIMENTARIAS",

`            `"nombre": "Restricciones alimentarias",

`            `"categoria": "SALUD",

`            `"monetizable": **true**,

`            `"config\_default": "{\"visibilidad\": \"ORGANIZADOR\", \"permitir\_observaciones\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **true**,

`            `"incluida\_por\_addon": **false**,

`            `"incluida\_por\_addon\_evento": **false**,

`            `"incluida\_por\_addon\_cuenta": **false**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"disponible": **true**,

`            `"editable": **true**,

`            `"origen": "PLAN",

`            `"motivo\_inactivo": **null**,

`            `"mensaje\_ui": **null**,

`            `"visible\_acceso": **true**,

`            `"visible\_centro": **false**,

`            `"permite\_acceso": **true**,

`            `"permite\_centro": **false**,

`            `"descripcion": "Selección de restricciones por integrante + observaciones.",

`            `"visible\_acceso\_evento": **true**,

`            `"visible\_centro\_evento": **false**,

`            `"visible\_acceso\_programa": **true**,

`            `"visible\_centro\_programa": **true**,

`            `"permite\_acceso\_evento": **true**,

`            `"permite\_centro\_evento": **false**,

`            `"permite\_acceso\_programa": **true**,

`            `"permite\_centro\_programa": **true**

`        `}

`    `]

}


Es decir, este endpoint devuelve la **foto completa** de las features del evento.

O sea, para cada feature te dice:

- si viene por plan 
- si viene por addon 
- si el evento la apagó o la dejó prendida 
- si realmente está activa o no



**Reglas de Edición del Front:**

Caso A — La feature está incluida (viene por plan o addon)

Si:

- incluida\_en\_plan = true\
  **o** 
- incluida\_por\_addon = true 

Entonces la feature está **disponible** para ese evento.

El front debe:

- mostrarla con toggle editable.
- Permitir toggle activa
- Permitir editar visibilidad

Caso B — La feature no incluida (no viene ni por plan ni por addon)

Si:

- incluida\_en\_plan = false 
- incluida\_por\_addon = false 

Entonces esa feature **no está disponible**.

El front puede:

- ocultarla
- o mostrarla bloqueada con texto “Disponible con otro plan o addon” 

No debe permitir activar ni modificar visibilidad

Caso C — La feature está activa pero no visible en portal

Si:

- activo\_resuelto = false 

El front debe:

- mostrar toggle Activa en OFF;
- deshabilitar toggles de visibilidad;
- no mostrar esa funcionalidad en otras pantallas.

Caso D — La feature está disponible, pero el evento la apagó

Ejemplo:

- activo\_resuelto = true
- visible\_centro\_evento = false

La feature está disponible para uso interno, pero no aparece en el portal.

Ejemplo práctico:

- El organizador usa agenda internamente.
- Pero decide no mostrar agenda en el portal del invitado.


**Pantalla:**

Cabecera:

- Título: Características** 
- Subtítulo: Activá o desactivá las funcionalidades que querés usar en este evento.”
- mostrar: 
  - Plan: B2C Basic 

Lista de features:

Cada fila debería tener:

- Nombre 
  - campo nombre
  - tipo texto
  - descripción: nombre visible de la feature
- Descripción 
  - Campo descripcion
  - Tipo texto corto
  - Descripción: explicación de la feature
- Categoría
  - Campo categoria
  - Tipo chip/texto
  - Descripción: Comunicación, Logística, Salud, Música, etc.
- Origen
  - Campo origen
  - chip
    - PLAN 
    - ADDON\_EVENTO 
    - PLAN\_Y\_ADDON
    - NO\_INCLUIDA
- Activa
  - Campo activo\_resuelto
  - Campo activo\_evento
  - Toggle
  - Descripción: prende o apaga la feature
- Mostrar en acceso
  - visible\_acceso\_evento o visible\_acceso\_programa
  - toggle
  - descripción: se ve en invitación / inscripción inicial
- Mostrar en portal
  - visible\_centro\_evento o visible\_centro\_programa
  - toggle
  - descripción: se ve en portal 
- Botón **Guardar Features y visibilidad**

Regla según tipo de operación

El evento puede ser:

- tipo\_operacion = EVENTO
- tipo\_operacion = PROGRAMA

Si es EVENTO, el front debe mostrar estas columnas de visibilidad:

|Toggle|Campo|
| :- | :- |
|Mostrar en invitación / RSVP|visible\_acceso\_evento|
|Mostrar en portal del invitado|visible\_centro\_evento|

Si es PROGRAMA, el front debe mostrar estas columnas de visibilidad:

|Toggle|Campo|
| :- | :- |
|Mostrar en inscripción pública|visible\_acceso\_programa|
|Mostrar en portal del responsable/familia|visible\_centro\_programa|

No mostrar los 4 toggles siempre. Para que sea más claro para el usuario, mostrar solo los que aplican al tipo de operación.

Al hacer clic en el Botón **Guardar Features y visibilidad** se guardan los cambios:

**Endpoint**:

**PUT /evento\_features/SetActivosBulk?idEvento={idEvento}**

Ejemplo

PUT /evento\_features/SetActivosBulk?idEvento=93

JSON:

{ 

`    `"items": [

`         `{ 

`            `"id\_feature": 6, 

`            `"activo": **true**, 

`            `"visible\_acceso\_evento": **false**, 

`            `"visible\_centro\_evento": **true**, 

`            `"visible\_acceso\_programa": **false**, 

`            `"visible\_centro\_programa": **false** 

`        `}, 

`        `{ 

`            `"id\_feature": 18, "activo": **true**, 

`            `"visible\_acceso\_evento": **false**, 

`            `"visible\_centro\_evento": **true**, 

`            `"visible\_acceso\_programa": **false**, 

`            `"visible\_centro\_programa": **false** 

`        `} 

`    `] 

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_evento": 93,

`    `"updated": 2

}

Este endpoint prende o apaga features **que ya están disponibles** por plan/addon

Después de guardar, el front vuelve a llamar:

**GET /features\_efectivas/GetByEvento?idEvento=93**

Y redibuja la pantalla.

Qué hace el backend al guardar

- Actualiza o crea registros en: ef\_evento\_features
- Actualiza o crea registros en: ef\_evento\_feature\_visibilidad
- Ejecutar post-proceso de sincronización del portal.
- Crear/actualizar registros en: ef\_evento\_portal\_config según las secciones que correspondan.



Sincronización automática del portal

El front NO debe insertar ni actualizar directamente:

ef\_evento\_portal\_config se sincroniza desde backend.

La lógica es:

Feature activa + visible\_centro\_evento / visible\_centro\_programa + ef\_param\_portal\_secciones.requiere\_feature\_codigo = sección visible en el portal

Ejemplo 1 — Evento con novedades

- Si el organizador 
  - activa: NOVEDADES\_EVENTO
  - y marca: visible\_centro\_evento = true
- el backend debe crear/activar:
  - ef\_evento\_portal\_config → sección NOVEDADES

Ejemplo 2 — Programa con salud

- Si el organizador 
  - activa: PROGRAMA\_SALUD
  - y marca: visible\_centro\_programa = true
- el backend debe crear/activar:
  - ef\_evento\_portal\_config → sección SALUD
  - ef\_evento\_portal\_config → sección SALUD\_ACCIONES

Ejemplo 3 — Programa con servicios contratados

- Si el organizador 
  - activa: PROGRAMA\_SERVICIOS
  - y marca: visible\_centro\_programa = true
- el backend debe crear/activar:
  - ef\_evento\_portal\_config → sección SERVICIOS


Tabla de secciones del portal

Las secciones posibles están en: ef\_param\_portal\_secciones

Esta tabla **es catálogo global**. No es por evento.

Campos principales:

|**Campo**|**Descripción**|
| :- | :- |
|codigo|Código técnico de sección|
|descripcion|Título default|
|aplica\_evento|Si aplica a eventos|
|aplica\_programa|Si aplica a programas|
|requiere\_feature\_codigo|Feature necesaria para mostrarla|
|orden\_default|Orden sugerido|
|activo|Si la sección existe/habilitada globalmente|


Tabla de configuración del portal por evento

La tabla: ef\_evento\_portal\_config

define qué secciones concretas están visibles para un evento/programa.

|**Campo**|**Descripción**|
| :- | :- |
|id\_evento|Evento/programa|
|id\_portal\_seccion|Sección del catálogo|
|visible|Si se muestra|
|orden|Orden de visualización|
|titulo\_override|Título personalizado opcional|
|config\_json|Configuración adicional opcional|
|activo|Si el registro está activo|

Esta tabla no la edita el front directamente.

El front solo consume el resultado final desde:

GET /evento\_portal\_config/full/{tokenConsulta}?idIdioma=1


Cómo renderiza el front (Esto me lo pasó chatgpt juanchi)

El front debe recorrer secciones[]

y por cada codigo, pintar el componente correspondiente.

|**Código**|**Data**|**Componente sugerido**|
| :- | :- | :- |
|RESUMEN|data.resumen|PortalResumenSection|
|AGENDA|data.agenda|PortalAgendaSection|
|NOVEDADES|data.novedades|PortalNovedadesSection|
|REGALOS|data.regalos|PortalRegalosSection|
|PARTICIPANTES|data.participantes|PortalParticipantesSection|
|SERVICIOS|data.servicios|PortalServiciosSection|
|PAGOS|data.pagos|PortalPagosSection|
|SALUD|data.salud|PortalSaludSection|
|SALUD\_ACCIONES|data.saludAcciones|PortalSaludAccionesSection|
|AUTORIZACIONES|data.autorizaciones|PortalAutorizacionesSection|
|QRS\_RETIRO|data.qrsRetiro|PortalQrsRetiroSection|
|RETIROS|data.retiros|PortalRetirosSection|
|TRANSPORTE|data.transporte|PortalTransporteSection|
|FOTOS|data.fotos|PortalFotosSection|

Si una sección no viene en secciones[], el front no debe mostrarla.


**Mi-Eventia y portal puntual**

Mi-Eventia muestra todas las cards asociadas a una persona.

**Endpoint**:

**GET /mi-eventia/{tokenPortal}**

Cuando el usuario toca una card para ver las características del evento, el front usa:

token\_consulta

y llama:

**GET /evento\_portal\_config/full/{token\_consulta}?idIdioma=1**


Features específicas agregadas para programas

Para programas se agregan features específicas, para no mezclar conceptos.

|**Feature**|**Uso**|
| :- | :- |
|PROGRAMA\_SERVICIOS|Servicios contratados, períodos, días seleccionados, subtotales|
|PROGRAMA\_SALUD|Ficha médica, contactos, medicación, alertas y acciones/incidentes|
|PROGRAMA\_AUTORIZACIONES|Consentimientos legales del programa|
|RETIRO\_INFANTIL\_AUTORIZACIONES|Personas autorizadas a retirar niños|
|RETIRO\_INFANTIL\_REGISTRO|Registro operativo de retiros|
|RESTRICCIONES\_ALIMENTARIAS|Restricciones alimentarias en RSVP, inscripción, cocina y comedor|

Importante:

- RESTRICCIONES\_ALIMENTARIAS no reemplaza PROGRAMA\_SALUD.
- PROGRAMA\_SALUD no reemplaza RESTRICCIONES\_ALIMENTARIAS.

Restricciones alimentarias puede existir en:

- RSVP de eventos privados;
- inscripción de programas;
- cocina/comedor;
- portal del responsable.

Sección SERVICIOS en portal de programas

La sección SERVICIOS muestra lo contratado por la familia.

Depende de: PROGRAMA\_SERVICIOS

Data:

"servicios": {

`  `"inscripcion": {

`    `"id\_inscripcion": 12,

`    `"responsable": "Nuria Costa",

`    `"responsable\_email": "nuria@test.com",

`    `"responsable\_telefono": "+34600123456",

`    `"total\_general": 450,

`    `"moneda": "EUR"

`  `},

`  `"participantes": [

`    `{

`      `"id\_invitado": 103,

`      `"id\_rsvp\_grupo\_integrante": 63,

`      `"participante": "Aina Costa",

`      `"periodos": [

`        `{

`          `"id\_programa\_periodo": 1,

`          `"codigo": "SEMANA\_01",

`          `"nombre": "Setmana 1",

`          `"fecha\_desde": "2026-06-22",

`          `"fecha\_hasta": "2026-06-26",

`          `"precio\_base": 120,

`          `"moneda": "EUR"

`        `}

`      `],

`      `"servicios": [

`        `{

`          `"codigo": "COMEDOR",

`          `"nombre": "Menjador",

`          `"tipo\_calculo": "POR\_DIA",

`          `"precio": 9,

`          `"moneda": "EUR",

`          `"cantidad\_calculada": 3,

`          `"fechas": [

`            `"2026-06-22",

`            `"2026-06-23",

`            `"2026-06-24"

`          `],

`          `"subtotal": 27

`        `},

`        `{

`          `"codigo": "CAMISETA",

`          `"nombre": "Samarreta",

`          `"tipo\_calculo": "POR\_INSCRIPCION",

`          `"precio": 0,

`          `"moneda": "EUR",

`          `"cantidad\_calculada": 1,

`          `"fechas": [],

`          `"subtotal": 0

`        `}

`      `],

`      `"restricciones\_alimentarias": [

`        `{

`          `"codigo": "GLUTEN\_CELIACO",

`          `"texto": "Celíaco / Sin gluten",

`          `"categoria": "ALERGIA",

`          `"requiere\_alerta\_visual": true,

`          `"observaciones": "Evitar contaminación cruzada"

`        `}

`      `]

`    `}

`  `]

}

El front debe mostrar esta sección como resumen claro para el responsable:

- participantes;
- semanas/períodos contratados;
- servicios por participante;
- días seleccionados;
- restricciones alimentarias;

Sección REGALOS en portal de eventos

La sección REGALOS depende de: REGALOS

Adentro se filtra por subfeatures:

|**Submódulo**|**Feature**|
| :- | :- |
|Transferencias|REGALOS\_TRANSFERENCIAS|
|Lista de regalos|REGALOS\_LISTA|
|Fondo / metas|REGALOS\_FONDO\_METAS|

Regla:

Si una subfeature está apagada, el backend no devuelve ese bloque aunque haya datos cargados.

Ejemplo:

"regalos": {

`  `"transferencias\_habilitado": true,

`  `"lista\_habilitado": true,

`  `"fondo\_metas\_habilitado": false,

`  `"config": {},

`  `"transferencias": [],

`  `"lista": [],

`  `"fondo": null,

`  `"metas": null

}


**Flujo final** 

Pantalla Características

1. Entrar al detalle del evento/programa.
1. Llamar:

`	`GET /features\_efectivas/GetByEvento?idEvento={idEvento}

3. Mostrar features con:
   1. nombre;
   1. descripción;
   1. categoría;
   1. origen;
   1. toggle activo;
   1. toggle acceso;
   1. toggle centro.
3. Guardar con:

`	`PUT /evento\_features/SetActivosBulk?idEvento={idEvento}

5. Volver a llamar:

`	`GET /features\_efectivas/GetByEvento?idEvento={idEvento}

Portal

1. Usuario entra a Mi-Eventia.
1. Front llama:

`	`GET /mi-eventia/{tokenPortal}

3. Usuario elige una card.
3. Front toma:

`	`token\_consulta

5. Front llama:

`	`GET /evento\_portal\_config/full/{token\_consulta}?idIdioma=1

6. Front renderiza por:

`	`secciones[].codigo

7. Front toma la data desde:

`	`data






# Gestión de Addons (B2C/B2B)

- B2C: business to customer
- B2B: business to bussiness

**Conceptos y reglas**

Qué es un add-on

- Es un “extra contratables” que habilita una o más **features**. 
- Se define en: 
  - ef\_addons (catálogo) 
  - ef\_addon\_features (qué features habilita) 

Dónde se “contrata”

Se guarda en ef\_scope\_addons:

- scope='EVENTO' → add-on contratado para **un evento** (B2C o un evento puntual en B2B). 
- scope='CUENTA' → add-on contratado para **la cuenta** (B2B), impacta en todos sus eventos. 

Estados del add-on contratado (ef\_scope\_addons.estado)

- PENDIENTE → el usuario lo solicitó, falta activación (pago manual). 
- ACTIVO → ya está habilitado. 
- SUSPENDIDO → lo desactivaste temporalmente (futuro). 
- EXPIRADO → se venció (futuro). 

Pago manual

- El usuario **solo “solicita”** → queda PENDIENTE. 
- El **SUPERADMIN** registra el pago manual y eso: 
  - pasa el scope\_addon a ACTIVO 
  - crea un ef\_pagos con estado='APROBADO' (para trazabilidad)

**B2C (usuario final)**

¿Cuándo se puede solicitar un add-on?

- **Para contratar add-ons de EVENTO, primero hay que crear el evento.**\
  Porque el registro de contratación (ef\_scope\_addons) necesita id\_evento.

¿El evento debe tener plan?

- Sí, el evento debe tener un plan asignado (mínimo B2C\_FREE).\
  (El plan puede estar en trial / pendiente de pago / activo.)

¿El evento debe estar “aprobado/pago” para pedir add-ons?

- **No es necesario**.\
  El usuario puede **solicitarlos** y quedan **PENDIENTE**, y el superadmin los activa cuando registra el pago manual.

**Menú B2C**

Mis eventos 

→ seleccionar un evento (ya tiene que estar creado y tener un plan) 

→ se habilita Botón Plan y facturación 

→ Mostrar: plan de evento / estado comercial (trial, pago pendiente)

→ Add-ons del evento

**Pantalla “Add-ons del evento”**

Objetivo

- que el usuario vea los add-ons disponibles para el Evento, pueda solicitarlos y ver su estado (pendiente / activo)

Datos que muestra

- Cards por cada add-on: 
  - nombre, descripción
  - precio (si hay)
  - features que habilita
  - estado. De acuerdo al estado habilita:
    - **No contratado**: botón “Contratar” 
    - **Pendiente de activación**: badge “Pendiente de activación” 
    - **Activo**: badge “Activo” 

**B2C / EVENTO: cards “Add-ons del evento”**

1\. Traer Catálogo (para armar cards): 

**Endpoint**:

**GET /addonsPublic/PublicCatalog?mercado=AR&moneda=ARS&scope=EVENTO**

(postman: Add-ons\Traer catalogo para evento (cards))

Respuesta:

[

`    `{

`        `"id\_addon": 6,

`        `"codigo": "ADDON\_ALBUM\_POST",

`        `"nombre": "Álbum post evento",

`        `"descripcion": "Galería post evento.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 13,

`                `"codigo": "ALBUM\_POST\_EVENTO",

`                `"nombre": "Álbum post evento",

`                `"categoria": "FOTOS",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 5,

`        `"codigo": "ADDON\_ALBUM\_QR",

`        `"nombre": "Álbum colaborativo + QR",

`        `"descripcion": "QR para subir fotos/videos y ver el álbum del evento.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 12,

`                `"codigo": "ALBUM\_COLABORATIVO\_QR",

`                `"nombre": "Álbum colaborativo con QR",

`                `"categoria": "FOTOS",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 4,

`        `"codigo": "ADDON\_ANECDOTARIO",

`        `"nombre": "Anecdotario divertido",

`        `"descripcion": "Anécdotas con opción anónima y lectura en fiesta o post.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 11,

`                `"codigo": "ANECDOTARIO",

`                `"nombre": "Anecdotario divertido",

`                `"categoria": "INTERACCION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 10,

`        `"codigo": "ADDON\_CHECKIN\_MANUAL",

`        `"nombre": "Check-in manual",

`        `"descripcion": "Búsqueda y check-in manual como plan B.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 16,

`                `"codigo": "CHECKIN\_MANUAL",

`                `"nombre": "Check-in manual",

`                `"categoria": "OPERACION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 11,

`        `"codigo": "ADDON\_FEED",

`        `"nombre": "Novedades del evento (feed)",

`        `"descripcion": "Publicaciones del organizador y avisos.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 6,

`                `"codigo": "NOVEDADES\_EVENTO",

`                `"nombre": "Novedades del evento",

`                `"categoria": "COMUNICACION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 7,

`        `"codigo": "ADDON\_FOTOCABINA",

`        `"nombre": "Fotocabina digital",

`        `"descripcion": "Photobooth en modo kiosk; guarda capturas en el álbum.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 14,

`                `"codigo": "FOTOCABINA",

`                `"nombre": "Fotocabina digital",

`                `"categoria": "FOTOS",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 14,

`        `"codigo": "ADDON\_HOSPEDAJES",

`        `"nombre": "Hospedajes sugeridos",

`        `"descripcion": "Hospedajes recomendados por el organizador.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 19,

`                `"codigo": "HOSPEDAJES",

`                `"nombre": "Hospedajes sugeridos",

`                `"categoria": "LOGISTICA",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 9,

`        `"codigo": "ADDON\_LOGS\_ACCESO",

`        `"nombre": "Logs de acceso",

`        `"descripcion": "Auditoría de accesos e ingresos.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 17,

`                `"codigo": "LOGS\_ACCESO",

`                `"nombre": "Logs de acceso",

`                `"categoria": "OPERACION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 3,

`        `"codigo": "ADDON\_MENSAJES\_EMOTIVOS",

`        `"nombre": "Mensajes emotivos",

`        `"descripcion": "Mensajes para momentos clave, con moderación.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 10,

`                `"codigo": "MENSAJES\_EMOTIVOS",

`                `"nombre": "Mensajes emotivos",

`                `"categoria": "INTERACCION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 18,

`        `"codigo": "ADDON\_MUSICA",

`        `"nombre": "Módulo música",

`        `"descripcion": "Sugerencias + votación + playlist + bloqueos (según plan).",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 4,

`                `"codigo": "MUSICA\_BLOQUEOS",

`                `"nombre": "Bloqueos musicales",

`                `"categoria": "MUSICA",

`                `"monetizable": **true**

`            `},

`            `{

`                `"id\_feature": 3,

`                `"codigo": "MUSICA\_PLAYLIST\_ORGANIZADOR",

`                `"nombre": "Playlist del organizador",

`                `"categoria": "MUSICA",

`                `"monetizable": **true**

`            `},

`            `{

`                `"id\_feature": 1,

`                `"codigo": "MUSICA\_SUGERENCIAS",

`                `"nombre": "Sugerencias musicales",

`                `"categoria": "MUSICA",

`                `"monetizable": **false**

`            `},

`            `{

`                `"id\_feature": 2,

`                `"codigo": "MUSICA\_VOTACION",

`                `"nombre": "Votación de música",

`                `"categoria": "MUSICA",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 12,

`        `"codigo": "ADDON\_NOTIFICACIONES",

`        `"nombre": "Notificaciones",

`        `"descripcion": "Notificaciones email/in-app/push.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 7,

`                `"codigo": "NOTIFICACIONES",

`                `"nombre": "Notificaciones multicanal",

`                `"categoria": "COMUNICACION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 8,

`        `"codigo": "ADDON\_QR\_CHECKIN",

`        `"nombre": "Check-in por QR",

`        `"descripcion": "Control de ingreso por QR.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 15,

`                `"codigo": "QR\_CHECKIN",

`                `"nombre": "Check-in por QR",

`                `"categoria": "OPERACION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 13,

`        `"codigo": "ADDON\_REGALOS",

`        `"nombre": "Regalos / lista",

`        `"descripcion": "Lista de regalos o datos de transferencia.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 18,

`                `"codigo": "REGALOS",

`                `"nombre": "Regalos / lista",

`                `"categoria": "LOGISTICA",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 16,

`        `"codigo": "ADDON\_RESTRICCIONES\_ALIM",

`        `"nombre": "Restricciones alimentarias",

`        `"descripcion": "Gestión de restricciones por invitado/integrante.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 21,

`                `"codigo": "RESTRICCIONES\_ALIMENTARIAS",

`                `"nombre": "Restricciones alimentarias",

`                `"categoria": "SALUD",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 17,

`        `"codigo": "ADDON\_RETIRO\_INFANTIL",

`        `"nombre": "Módulo infantil: retiros",

`        `"descripcion": "Autorizaciones + registro de retiros.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 22,

`                `"codigo": "RETIRO\_INFANTIL\_AUTORIZACIONES",

`                `"nombre": "Autorizaciones de retiro (infantil)",

`                `"categoria": "INFANTIL",

`                `"monetizable": **true**

`            `},

`            `{

`                `"id\_feature": 23,

`                `"codigo": "RETIRO\_INFANTIL\_REGISTRO",

`                `"nombre": "Registro de retiros (infantil)",

`                `"categoria": "INFANTIL",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 15,

`        `"codigo": "ADDON\_TRANSPORTE",

`        `"nombre": "Transporte / transfers",

`        `"descripcion": "Opciones de transporte y puntos de encuentro.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 20,

`                `"codigo": "TRANSPORTE",

`                `"nombre": "Transporte / transfers",

`                `"categoria": "LOGISTICA",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 2,

`        `"codigo": "ADDON\_VOTACIONES\_LIVE",

`        `"nombre": "Votaciones en vivo",

`        `"descripcion": "Votaciones en tiempo real durante el evento.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 9,

`                `"codigo": "VOTACIONES\_EN\_VIVO",

`                `"nombre": "Votaciones en vivo",

`                `"categoria": "INTERACCION",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 1,

`        `"codigo": "ADDON\_VOTACIONES\_PRE",

`        `"nombre": "Votaciones (pre-evento)",

`        `"descripcion": "Encuestas para decidir cosas antes del evento.",

`        `"scope": "EVENTO",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 8,

`                `"codigo": "VOTACIONES\_PRE\_EVENTO",

`                `"nombre": "Votaciones antes del evento",

`                `"categoria": "INTERACCION",

`                `"monetizable": **true**

`            `}

`        `]

`    `}

]


2\. Traer “mis add-ons” del evento, es decir los ya contratados (para marcar estado) 

**Endpoint**:

**GET / evento\_addons/GetByEvento?idEvento={id\_evento}**

(postman: Add-ons\Traer mis add-ons del evento)

Header: Authorization: Bearer {TOKEN}

Ejemplo:

GET / evento\_addons/GetByEvento?idEvento=21

Respuesta:

`	`[]

En este caso no tiene ningún add-on



3\. Cruce catálogo + contratados (lógica para el front)

3\.1 Construir un diccionario por id\_addon

// pseudo TS

const contratadoByAddonId = new Map<number, AddonContratadoDTO>();

contratados.forEach(x => contratadoByAddonId.set(x.id\_addon, x));

3\.2 Enriquecer cada card del catálogo con estado UI

Para cada item del catálogo:

- si no existe en contratadoByAddonId → estado\_ui = "DISPONIBLE" 
- si existe con estado = "PENDIENTE" → estado\_ui = "PENDIENTE" 
- si existe con estado = "ACTIVO" → estado\_ui = "ACTIVO" 

Pseudocódigo:

catalogo.map(a => {\
`  `const c = contratadoByAddonId.get(a.id\_addon);\
`  `let estado\_ui = "DISPONIBLE";\
`  `if (c?.estado === "PENDIENTE") estado\_ui = "PENDIENTE";\
`  `if (c?.estado === "ACTIVO") estado\_ui = "ACTIVO";\
\
`  `return { ...a, contratado: c ?? null, estado\_ui };\
});

Perdón Juanchi…. Esto me lo tiró el chatgpt cuando le pregunté cómo se cruzaba la info

**Qué botón y qué texto muestra cada card**

Estado 1 — DISPONIBLE

- Badge: (ninguno) o “Disponible” 
- Botón: **Solicitar** 

Estado 2 — PENDIENTE

- Badge: **Pendiente de activación** 
- Botón: deshabilitado o “Pendiente” 
- Texto debajo: “Lo activaremos cuando registremos el pago.” 

Estado 3 — ACTIVO

- Badge: **Activo** 
- Botón: opcional “Ver” (o nada) 
- Texto: “Ya disponible en tu evento.”



**Acción “Solicitar” un add-on para el evento**

**Endpoint**:

**POST / evento\_addons/ Solicitar?idEvento={id\_evento}**

(postman: Add-ons\Solicitar add-on para el evento)

Header: Authorization: Bearer {TOKEN}

Ejemplo:

POST / evento\_addons/ Solicitar?idEvento=21

JSON:

{ 

`    `"id\_addon": 18, 

`    `"mercado": "AR", 

`    `"moneda": "ARS" 

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_scope\_addon": 1,

`    `"estado": "PENDIENTE"

}

Si vuelvo a consultar mis add-ons:

[

`    `{

`        `"id\_scope\_addon": 1,

`        `"id\_addon": 18,

`        `"codigo": "ADDON\_MUSICA",

`        `"nombre": "Módulo música",

`        `"estado": "PENDIENTE",

`        `"activo": **true**,

`        `"fecha\_desde": "2026-04-23T15:30:19.325648+00:00",

`        `"fecha\_hasta": **null**,

`        `"config\_override": "{\"pedido\": {\"moneda\": \"ARS\", \"mercado\": \"AR\"}}"

`    `}

]

Qué hace el backend

1. Valida que el addon exista, esté activo y sea scope='EVENTO'. 
1. Resuelve precio vigente en ef\_precios (objeto\_tipo='ADDON', mercado/moneda, rango vigente). 
1. Inserta ef\_scope\_addons con: 
- scope=EVENTO 
- id\_evento=21
- id\_addon=18 
- estado=PENDIENTE 
- activo=true 
4. Inserta ef\_pagos con: 
- id\_evento=21
- estado=PENDIENTE 
- tipo=UNICO 
- moneda/importe/total 
- precio\_referencia\_id = id\_precio 
- concepto: “Addon XXX pendiente - evento 21”

(El circuito de registro de pago lo hace el Superadmin y se explica más abajo)

**B2B (Cuentas/Salones/Planners)**

**Menú B2B**

Mi Plan y facturación 

→ Plan y facturación (ya está)

→ Add-ons de cuenta (nuevo)

**Pantalla “Add-ons de Cuenta”**

Objetivo

La cuenta puede solicitar add-ons de CUENTA (branding/dominio/reportes/dashboard), quedan pendientes y el admin los activa.

**B2B / CUENTA: cards “Add-ons de cuenta”**

1\. Traer Catálogo (para armar cards): 

**Endpoint**:

**GET /addonsPublic/PublicCatalog?mercado=ES&moneda=EUR&scope=CUENTA**

(postman: Add-ons\Traer catalogo para cuenta (cards))

Respuesta:

[

`    `{

`        `"id\_addon": 19,

`        `"codigo": "ADDON\_BRANDING",

`        `"nombre": "Marca blanca / branding",

`        `"descripcion": "Branding avanzado sin marca Eventia.",

`        `"scope": "CUENTA",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 30,

`                `"codigo": "BRANDING\_AVANZADO",

`                `"nombre": "Branding avanzado / marca blanca",

`                `"categoria": "MARCA",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 22,

`        `"codigo": "ADDON\_DASHBOARD",

`        `"nombre": "Dashboard operativo",

`        `"descripcion": "Métricas y panel operativo.",

`        `"scope": "CUENTA",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 29,

`                `"codigo": "DASHBOARD",

`                `"nombre": "Dashboard operativo",

`                `"categoria": "ANALITICA",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 20,

`        `"codigo": "ADDON\_DOMINIO",

`        `"nombre": "Dominio / URL personalizada",

`        `"descripcion": "Dominio/URL personalizada.",

`        `"scope": "CUENTA",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 31,

`                `"codigo": "DOMINIO\_PERSONALIZADO",

`                `"nombre": "Dominio / URL personalizada",

`                `"categoria": "MARCA",

`                `"monetizable": **true**

`            `}

`        `]

`    `},

`    `{

`        `"id\_addon": 21,

`        `"codigo": "ADDON\_REPORTES",

`        `"nombre": "Reportes / export",

`        `"descripcion": "Export CSV/XLSX y reportes.",

`        `"scope": "CUENTA",

`        `"precio": **null**,

`        `"features": [

`            `{

`                `"id\_feature": 28,

`                `"codigo": "EXPORT\_REPORTES",

`                `"nombre": "Reportes / export",

`                `"categoria": "ANALITICA",

`                `"monetizable": **true**

`            `}

`        `]

`    `}

]



2\. Traer “mis add-ons” de cuenta, es decir los ya contratados (para marcar estado) 

**Endpoint**:

**GET** **/cuenta\_addons/MisAddons** 

(postman: Add-ons\Traer mis add-ons de Cuenta)

Header: Authorization: Bearer {TOKEN}

Respuesta:

`	`[]

En este caso la Cuenta no tiene ningún add-on

3\. Cruce catálogo + contratados + UI

Idem que para B2C

**Acción “Solicitar” un add-on para la Cuenta**

**Endpoint**:

**POST/cuenta\_addons/Solicitar**

(postman: Add-ons\Solicitar add-on para la Cuenta)

Header: Authorization: Bearer {TOKEN}

JSON:

{ 

`    `"id\_addon": 19, 

`    `"mercado": "ES", 

`    `"moneda": "EUR" 

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_scope\_addon": 2,

`    `"estado": "PENDIENTE"

}



**Superadmin**

**Pago manual de add-ons y activación**

Menú sugerido (va en la parte de pago y cobranzas…. Ver cómo quedó el menú del superadmin para ver dónde poner estas opciones)

Por ejemplo:

Cobranzas

- Pagos eventos (planes B2C) (ya está en otro doc)
- Pagos cuentas (planes B2B) (ya está en otro doc)

Add-ons

- Add-ons EVENTO (pendientes) (nuevo)
- Add-ons CUENTA (pendientes) (nuevo)
###
**Circuito**

**Pantalla admin: “Add-ons EVENTO pendientes”**

Objetivo

Ver solicitudes pendientes y activar registrando el pago manual.

**Endpoint**

**GET** **/admin/addons\_evento/pendientes?mercado=AR&moneda=ARS**\
(postman: Add-ons\Superadmin-Addons EVENTO pendientes)

Header: Authorization: Bearer {TOKEN\_SUPERADMIN}

Muestra grilla con:

- evento (id, anfitriones, tipo evento) 
- addon (codigo/nombre) 
- estado (PENDIENTE) 
- importe sugerido (si hay precio vigente) 
- flag inconsistente si no hay precio 
- Botón **Registrar Pago**

Respuesta:

[

`    `{

`        `"id\_scope\_addon": 1,

`        `"scope": "EVENTO",

`        `"id\_evento": 21,

`        `"id\_cuenta": **null**,

`        `"addon\_codigo": "ADDON\_MUSICA",

`        `"addon\_nombre": "Módulo música",

`        `"evento\_anfitriones": "Los ochentosos",

`        `"tipo\_evento\_codigo": "TARDEO",

`        `"cuenta\_nombre": **null**,

`        `"estado": "PENDIENTE",

`        `"fecha\_solicitud": "2026-04-23T15:30:19.325648+00:00",

`        `"mercado": "AR",

`        `"moneda": "ARS",

`        `"importe\_sugerido": **null**,

`        `"inconsistente": **true**,

`        `"detalle": "No hay precio vigente para este addon (mercado/moneda)."

`    `}

]



**Registrar Pago manual y Activar**

Al hacer clic en el botón, abrir  un modal para poder ingresar el importe si no lo hubiera o modificarlo, y un concepto (como por ejemplo el número de transferencia)

**Endpoint:**

**GET** **/admin/addons\_evento/registrar**

(postman: Add-ons\Superadmin-Registrar pago para Evento)

Header: Authorization: Bearer {TOKEN\_SUPERADMIN}

JSON:

{

`  `"id\_scope\_addon": 1,

`  `"moneda": "ARS",

`  `"importe": 15000,

`  `"concepto": "Transferencia - comp 000123"

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_scope\_addon": 1,

`    `"estado": "ACTIVO"

}


Qué cambia en BD

- ef\_scope\_addons.estado pasa a ACTIVO 
- Se inserta un ef\_pagos con estado='APROBADO' (id\_evento seteado)


**Pantalla admin: “Add-ons CUENTA pendientes”**

**Endpoint**

**GET** **/admin/addons\_cuentas/pendientes?mercado=ES&moneda=EUR**\
(postman: Add-ons\Superadmin-Addons CUENTA pendientes)

Header: Authorization: Bearer {TOKEN\_SUPERADMIN}

Muestra grilla con:

- cuenta (nombre) 
- addon (codigo/nombre) 
- estado (PENDIENTE) 
- importe sugerido (si hay precio vigente) 
- flag inconsistente si no hay precio 
- Botón **Registrar Pago**

Respuesta:

[

`    `{

`        `"id\_scope\_addon": 2,

`        `"scope": "CUENTA",

`        `"id\_evento": **null**,

`        `"id\_cuenta": 2,

`        `"addon\_codigo": "ADDON\_BRANDING",

`        `"addon\_nombre": "Marca blanca / branding",

`        `"evento\_anfitriones": **null**,

`        `"tipo\_evento\_codigo": **null**,

`        `"cuenta\_nombre": "Salon Eventos Full",

`        `"estado": "PENDIENTE",

`        `"fecha\_solicitud": "2026-04-23T16:55:44.914358+00:00",

`        `"mercado": "ES",

`        `"moneda": "EUR",

`        `"importe\_sugerido": **null**,

`        `"inconsistente": **true**,

`        `"detalle": "No hay precio vigente para este addon (mercado/moneda)."

`    `}

]



**Registrar Pago manual y Activar**

Al hacer clic en el botón, abrir  un modal para poder ingresar el importe si no lo hubiera o modificarlo, y un concepto (como por ejemplo el número de transferencia)

**Endpoint:**

**GET** **/admin/addons\_cuentas/registrar**

(postman: Add-ons\Superadmin- Superadmin-Registrar pago para add-on Cuenta)

Header: Authorization: Bearer {TOKEN\_SUPERADMIN}

JSON:

{

`  `"id\_scope\_addon": 2,

`  `"moneda": "EUR",

`  `"importe": 29.99,

`  `"concepto": "Pago Branding - abril"

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_scope\_addon": 2,

`    `"estado": "ACTIVO"

}


Qué cambia en BD

- ef\_scope\_addons.estado=ACTIVO (scope CUENTA) 
- ef\_pagos APROBADO con id\_cuenta seteado

