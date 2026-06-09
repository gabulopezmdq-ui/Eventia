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

Lugares distintos donde se trabaja con features

|**Lugar**|**Quién entra**|**Qué hace**|
| :- | :- | :- |
|**Configuración / Módulos (Features)**|SuperAdmin|Da de alta features y define catálogo|
|**Evento / Configuración / Características**|Organizador|Prende o apaga las features que el plan le permite|


**Pantalla Evento: Características del evento**

Agregar una sección o botón:

- Características

Objetivo:

Cuando el usuario toca el botón **“Características”**, se ejecuta un endpoint que le devuelve al front todo junto:

- qué trae el **plan** 
- qué agrega el **addon** 
- qué dejó prendido o apagado el **evento** 
- qué queda **realmente usable**

**Endpoint**:

**GET /features\_efectivas/GetByEvento?idEvento=21**

(postman: Eventos \Mostrar Características del Plan de un evento+Addons)

Respuesta:

{

`    `"id\_evento": 21,

`    `"id\_plan": 1,

`    `"plan\_codigo": "B2C\_FREE",

`    `"plan\_nombre": "B2C Free",

`    `"trial": {

`        `"dias\_restantes": 0,

`        `"vencido": **true**,

`        `"current\_period\_end": "2026-04-21T17:36:22.127007+00:00"

`    `},

`    `"addons\_evento": [

`        `{

`            `"id\_scope\_addon": 1,

`            `"id\_addon": 18,

`            `"codigo": "ADDON\_MUSICA",

`            `"nombre": "Módulo música",

`            `"estado": "ACTIVO",

`            `"activo": **true**,

`            `"fecha\_desde": "2026-04-23T15:30:19.325648+00:00",

`            `"fecha\_hasta": **null**,

`            `"config\_override": "{\"pedido\": {\"moneda\": \"ARS\", \"mercado\": \"AR\"}}"

`        `}

`    `],

`    `"features": [

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

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"motivo\_inactivo": **null**

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

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"motivo\_inactivo": **null**

`        `},

`        `{

`            `"id\_feature": 4,

`            `"codigo": "MUSICA\_BLOQUEOS",

`            `"nombre": "Bloqueos musicales",

`            `"categoria": "MUSICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"max\_bloqueos\": 50, \"permitir\_bloquear\_por\_artista\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **true**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"motivo\_inactivo": **null**

`        `},

`        `{

`            `"id\_feature": 3,

`            `"codigo": "MUSICA\_PLAYLIST\_ORGANIZADOR",

`            `"nombre": "Playlist del organizador",

`            `"categoria": "MUSICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"habilitar\_momentos\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **true**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"motivo\_inactivo": **null**

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

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **true**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"motivo\_inactivo": **null**

`        `},

`        `{

`            `"id\_feature": 2,

`            `"codigo": "MUSICA\_VOTACION",

`            `"nombre": "Votación de música",

`            `"categoria": "MUSICA",

`            `"monetizable": **true**,

`            `"config\_default": "{\"modo\": \"UN\_VOTO\", \"permitir\_cambiar\_voto\": true}",

`            `"config\_plan\_override": **null**,

`            `"config\_addon\_override": **null**,

`            `"config\_evento\_override": **null**,

`            `"incluida\_en\_plan": **false**,

`            `"incluida\_por\_addon": **true**,

`            `"activo\_evento": **null**,

`            `"activo\_resuelto": **true**,

`            `"motivo\_inactivo": **null**

`        `}

`    `]

}


Es decir, este endpoint devuelve la **foto completa** de las features del evento.

O sea, para cada feature te dice:

- si viene por plan 
- si viene por addon 
- si el evento la apagó o la dejó prendida 
- si realmente está activa o no


**Cómo lo interpreta el front:**

Caso A — La feature viene por plan o addon

Si:

- incluida\_en\_plan = true\
  **o** 
- incluida\_por\_addon = true 

Entonces la feature está **disponible** para ese evento.

Qué hace el front:

- La muestra con toggle editable.
- El valor del toggle lo toma de:
  - activo\_resuelto

Caso B — La feature no viene ni por plan ni por addon

Si:

- incluida\_en\_plan = false 
- incluida\_por\_addon = false 

Entonces esa feature **no está disponible**.

Qué hace el front:

Dos opciones válidas:

- no la muestra 
- la muestra bloqueada con texto: 
  - “No incluida” 
  - “Disponible con otro plan o addon” 

Mostrarla bloqueada **solo si queremos vender upgrade**. Si no, ocultarla.

Caso C — La feature está disponible, pero el evento la apagó

Ejemplo:

- viene por plan 
- activo\_evento = false 
- activo\_resuelto = false 

Qué hace el front

La muestra con toggle OFF.

**Pantalla:**

Cabecera:

- Título: Características** 
- Subtítulo: Activá o desactivá las funcionalidades que querés usar en este evento.”
- mostrar: 
  - Plan: B2C Basic 

Lista de features:

Cada fila debería tener:

- nombre 
- descripción 
- origen: se podría mostrar:
  - “Incluido en plan” 
  - “Incluido por addon” 
  - “No incluido” 
- toggle / estado 

Front:

Para cada feature:

- si disponible = true → mostrar fila 
- toggle = activo\_resuelto 
- si editable = true → usuario puede tocarlo 
- mostrar origen: 
  - PLAN 
  - ADDON\_EVENTO 
  - PLAN\_Y\_ADDON

Ejemplo:

{\
`  `"codigo": "MUSICA\_BLOQUEOS",\
`  `"origen": "ADDON\_EVENTO",\
`  `"disponible": true,\
`  `"editable": true,\
`  `"activo\_evento": null,\
`  `"activo\_resuelto": true\
}

Se muestra con toggle ON.


Toggle Estado:

El usuario por ejemplo:

- apaga MUSICA\_SUGERENCIAS 
- prende MUSICA\_BLOQUEOS 
- no puede tocar ALBUM\_EVENTO porque no está incluida

El usuario guarda los cambios:

Endpoint:

**PUT /evento\_features/SetActivosBulk?idEvento=21**

(postman: Eventos\Activar Caracteristicas del Evento-Ej3)

JSON:

{

`  `"items": [

`    `{ "id\_feature": 1, "activo": **false** },

`    `{ "id\_feature": 4, "activo": **true** }

`  `]

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_evento": 21,

`    `"updated": 2

}

Este endpoint prende o apaga features **que ya están disponibles** por plan/addon

Después de guardar, el front vuelve a llamar:

**GET /features\_efectivas/GetByEvento?idEvento=21**

Y redibuja la pantalla.


En el caso de Cuentas B2B, el proceso y los endpoints son los mismos, solo cambia el SCOPE.

Ejemplo:

**Endpoint**:

**GET /features\_efectivas/GetByEvento?idEvento=21**

(postman: Eventos \Mostrar Características del Plan de un evento que perteneces a una cuenta+Addons)


**Qué hace el sistema con las features activas?**

features\_efectivas no solo sirve para mostrar toggles en “Características”.\
Sirve para decidir qué módulos, botones, secciones y formularios se muestran en todo el evento.

1\. Dónde se usan las features activas

*A. Panel del organizador*

Es la administración privada del evento.

Ejemplo:

si MUSICA\_PLAYLIST\_ORGANIZADOR.activo\_resuelto = true\
→ mostrar menú/tab **Música** 

si MUSICA\_BLOQUEOS.activo\_resuelto = true\
→ dentro de Música mostrar sección **Temas bloqueados** 

si HOSPEDAJES.activo\_resuelto = true\
→ mostrar sección **Hospedajes sugeridos** 

si REGALOS.activo\_resuelto = true\
→ mostrar sección **Regalos / Lista** 

*B. Web pública del evento / invitación*

Es lo que ve el invitado cuando entra a la invitación o landing del evento.

Ejemplo:

si HOSPEDAJES.activo\_resuelto = true\
→ mostrar bloque **Dónde alojarse** 

si TRANSPORTE.activo\_resuelto = true\
→ mostrar bloque **Transporte / cómo llegar** 

si REGALOS.activo\_resuelto = true\
→ mostrar bloque **Regalos** 

si NOVEDADES\_EVENTO.activo\_resuelto = true\
→ mostrar bloque **Novedades / avisos** 

*C. Web RSVP*

Es la pantalla donde el invitado confirma asistencia.

Ejemplo:

si MUSICA\_SUGERENCIAS.activo\_resuelto = true\
→ mostrar campo **¿Qué tema no debería faltar?** 

si RESTRICCIONES\_ALIMENTARIAS.activo\_resuelto = true\
→ mostrar selector de restricciones alimentarias 

si RSVP\_ACOMPANIANTES.activo\_resuelto = true\
→ permitir cargar acompañantes

El front siempre hace:

GET /features\_efectivas/GetByEvento?idEvento={idEvento}

Y usa activo\_resuelto.

Regla

- Si activo\_resuelto = true → mostrar funcionalidad
- Si activo\_resuelto = false → ocultar o mostrar bloqueada

**Ejemplos**

Música

*En pantalla Características*

El usuario ve:

- Sugerencias musicales 
- Playlist del organizador 
- Bloqueos musicales 

Puede prender/apagar cada una.

*En panel del organizador*

Si está activa: MUSICA\_PLAYLIST\_ORGANIZADOR

mostrar:

- Menú/tab Música 
- Sección Playlist 
- Botón Agregar tema 
- Botón Exportar para DJ 

Si está activa: MUSICA\_BLOQUEOS

mostrar:

- Sección “Temas que NO deben sonar” 

Si está activa: MUSICA\_SUGERENCIAS

mostrar:

- Bandeja “Sugerencias de invitados” 
- Acciones: Incluir en playlist / Rechazar 

*En RSVP*

Si está activa: MUSICA\_SUGERENCIAS

mostrar al invitado:

- “¿Qué tema te gustaría escuchar?” 
- campos: 
  - título 
  - artista 
  - link 

Si no está activa, no se muestra nada de música al invitado.

Hospedajes

*En panel del organizador*

Si: HOSPEDAJES.activo\_resuelto = true

mostrar menú/sección:

- Hospedajes sugeridos 
- Alta/edición de hospedajes 
- Orden 
- Mostrar en invitación 

*En web pública/invitación*

Si está activa y hay hospedajes cargados:

- mostrar bloque **Hospedajes sugeridos** 

Si no está activa:

- ocultar el bloque 

Restricciones alimentarias

*En panel organizador*

Si: RESTRICCIONES\_ALIMENTARIAS.activo\_resuelto = true

mostrar:

- sección para consultar restricciones por invitado 
- reportes/listados para catering 

*En RSVP*

Mostrar:

- “¿Tenés alguna restricción alimentaria?” 
- checkboxes o combo: 
  - vegetariano 
  - vegano 
  - celíaco 
  - alergias 
  - otro 


**Flujo completo con features activas**

Cuando se abre el panel del evento

1. Front llama: 

GET /features\_efectivas/GetByEvento?idEvento=21

1. Guarda en memoria del evento una lista de features activas. 
1. Construye menú/secciones: 
- Si HOSPEDAJES activo → mostrar Hospedajes
- Si MUSICA\_PLAYLIST activo o MUSICA\_SUGERENCIAS activo o MUSICA\_BLOQUEOS activo → mostrar Música
- Si REGALOS activo → mostrar Regalos

Cuando se abre la web pública del evento

1. Front llama datos públicos del evento. 
1. También debe recibir o consultar features públicas. 
1. Muestra bloques según features activas. 

Ejemplo:

HOSPEDAJES activo → mostrar hospedajes\
REGALOS activo → mostrar regalos\
TRANSPORTE activo → mostrar transporte

Cuando se abre RSVP

- Front valida token RSVP. 
- Backend devuelve datos del invitado/evento. 
- Front consulta features efectivas o el backend RSVP ya las incluye. 
- Muestra campos extra según features: 
  - MUSICA\_SUGERENCIAS activo → sugerir tema
  - RESTRICCIONES\_ALIMENTARIAS activo → restricciones
  - RSVP\_ACOMPANIANTES activo → acompañantes



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

