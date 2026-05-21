# Eventia – B2B: Captación – Registro Público - Audiencias

Es el tramo que transforma Eventia de “organizador de eventos” en algo parecido a un **mini CRM de asistentes/clientes**.

No es solo “quién confirmó una invitación”, sino:

- quién se registró 
- a qué evento se registró 
- por qué link/campaña entró 
- si recibió beneficio 
- si asistió o no 
- si volvió a registrarse en otro evento 
- qué perfil/intereses tiene 
- a qué unidad o tipo de evento responde mejor 

Ahí está el valor fuerte para un cliente B2B.

Qué resuelve

*Registro público al evento*

Ejemplo:

- “Entrá al link del sunset y registrate” 
- “Primeros 100 con consumición gratis” 

La persona completa sus datos y queda asociada a:

- ese evento 
- esa cuenta 
- esa unidad 
- ese link de acceso/captación 

*Seguimiento de asistencia real*

No solo sabemos que se registró.

También podemos saber:

- si fue o no fue 
- si hizo check-in 
- si usó el beneficio 
- si finalmente asistió aunque no haya completado mucho dato 

Eso ya da muchísimo valor comercial.

*Audiencia acumulada*

La persona no queda solo como “invitado del evento X”.

También puede quedar consolidada como:

- ` `“esta persona ya estuvo interesada en 3 tardeos” 
- “esta persona vino al bar y después a un evento del restaurante” 
- “esta persona se registró pero no asistió” 
- “esta persona responde bien a eventos de música 80/90” 
- “esta persona entró por Instagram” 

Eso es el mini CRM.


**Cómo se estructura**

A. Evento base

Define:

- qué evento existe 
- de qué tipo es 
- si es público o privado 
- estructura 
- accesos 

(ya está implementado)

B. Captación

Define:

- por qué link entra la gente 
- si hay cupo 
- si hay beneficio 
- si registra o no 

C. Audiencias

Guarda:

- quiénes son esas personas 
- qué hicieron 
- en qué eventos participaron 
- si asistieron 
- qué afinidad tienen 

**Qué gana la cuenta con esto**

Sin audiencias

Solo ve:

- este tardeo tuvo 120 registrados 

Con audiencias

Puede ver:

- 120 registrados 
- 88 asistieron 
- 25 ya habían venido a otro evento 
- 40 vinieron desde Instagram 
- 18 eligieron música 80/90 
- 12 recibieron beneficio y lo canjearon 
- hay 60 personas del bar que todavía nunca fueron a un evento del restaurante 

Ahí empieza el valor comercial real.

Vamos a implementar un botón relacionado al Evento que nos permita registrar y hacer seguimiento de todo esto.

**Botón Audiencias**

Regla: Mostrar solo si el evento es público.

Estructura:

Tabs:

- Captación / Campañas
- Personas Registradas al Evento (con botones para registrar ingreso y canje beneficio)
- Asistencia 
- Métricas

**Tab: Captación / Campañas**

Un evento público puede tener una campaña principal y varias campañas adicionales.

Cada campaña genera su propio link de registro y permite medir de qué canal provienen los registros.

Este tab mostrará:

Una grilla:

- Título 
- Acceso 
- Activo 
- Fecha expiración 
- Cupo total 
- Cupo beneficio 
- Beneficio 
- Registrados 
- Beneficios otorgados 
- Beneficios canjeados 
- Botón “copiar link”
- Botón Activar/Desactivar Campaña

**Endpoint**

**GET /evento\_captacion\_links/GetByEvento?idEvento=27**

(postman: Eventos B2C-B2B-Completo\Listar campañas de un Evento)

Respuesta:

[

`    `{

`        `"id\_acceso\_link": 13,

`        `"id\_evento": 27,

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"titulo": "Lista VIP",

`        `"leyenda\_publica": "Acceso exclusivo para invitados especiales.",

`        `"token": "VLCJWkHzgBxieMKwcFrAN9fMMcQwPJFo",

`        `"es\_captacion\_publica": **true**,

`        `"requiere\_registro": **true**,

`        `"max\_personas\_total": 25,

`        `"max\_adultos": 1,

`        `"requiere\_nombres\_acompanantes": **false**,

`        `"cupo\_beneficio": 25,

`        `"id\_tipo\_beneficio\_registro": 1,

`        `"tipo\_beneficio\_codigo": "CONSUMICION",

`        `"beneficio\_titulo": "Acceso VIP",

`        `"beneficio\_descripcion": "Ingreso preferencial con consumición incluida.",

`        `"beneficio\_hasta": "2026-05-04T01:00:00+00:00",

`        `"mostrar\_disponibles": **false**,

`        `"mensaje\_post\_registro": "Tu acceso VIP quedó reservado.",

`        `"origen\_default": "VIP",

`        `"permite\_reutilizar\_audiencia": **true**,

`        `"fecha\_expiracion": "2026-05-03T22:30:00+00:00",

`        `"activo": **true**,

`        `"registrados": 0,

`        `"beneficios\_otorgados": 0,

`        `"beneficios\_canjeados": 0

`    `},

`    `{

`        `"id\_acceso\_link": 12,

`        `"id\_evento": 27,

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"titulo": "WhatsApp Difusión",

`        `"leyenda\_publica": "Sumate al tardeo del sábado.",

`        `"token": "smL4Nc3vcq2guXpP75wM9UMTTGVYWCFW",

`        `"es\_captacion\_publica": **true**,

`        `"requiere\_registro": **true**,

`        `"max\_personas\_total": 120,

`        `"max\_adultos": 2,

`        `"requiere\_nombres\_acompanantes": **true**,

`        `"cupo\_beneficio": 40,

`        `"id\_tipo\_beneficio\_registro": 1,

`        `"tipo\_beneficio\_codigo": "CONSUMICION",

`        `"beneficio\_titulo": "2x1 de bienvenida",

`        `"beneficio\_descripcion": "Promoción válida para los primeros 40 registrados por WhatsApp.",

`        `"beneficio\_hasta": "2026-05-03T23:30:00+00:00",

`        `"mostrar\_disponibles": **true**,

`        `"mensaje\_post\_registro": "Te anotamos. Guardá este registro para el ingreso.",

`        `"origen\_default": "WHATSAPP",

`        `"permite\_reutilizar\_audiencia": **true**,

`        `"fecha\_expiracion": "2026-05-04T02:00:00+00:00",

`        `"activo": **true**,

`        `"registrados": 0,

`        `"beneficios\_otorgados": 0,

`        `"beneficios\_canjeados": 0

`    `},

`    `{

`        `"id\_acceso\_link": 11,

`        `"id\_evento": 27,

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"titulo": "Influencers",

`        `"leyenda\_publica": "Registrate desde tu invitación exclusiva.",

`        `"token": "syaJSZECRDbBDohTZbUUepLNHhFyMfpE",

`        `"es\_captacion\_publica": **true**,

`        `"requiere\_registro": **true**,

`        `"max\_personas\_total": 30,

`        `"max\_adultos": 25,

`        `"requiere\_nombres\_acompanantes": **false**,

`        `"cupo\_beneficio": 30,

`        `"id\_tipo\_beneficio\_registro": 1,

`        `"tipo\_beneficio\_codigo": "CONSUMICION",

`        `"beneficio\_titulo": "Acceso preferencial + consumición",

`        `"beneficio\_descripcion": "Beneficio exclusivo para invitados de campaña influencers.",

`        `"beneficio\_hasta": "2026-05-04T01:00:00+00:00",

`        `"mostrar\_disponibles": **false**,

`        `"mensaje\_post\_registro": "Tu acceso preferencial quedó confirmado.",

`        `"origen\_default": "INFLUENCERS",

`        `"permite\_reutilizar\_audiencia": **true**,

`        `"fecha\_expiracion": "2026-05-03T21:00:00+00:00",

`        `"activo": **true**,

`        `"registrados": 0,

`        `"beneficios\_otorgados": 0,

`        `"beneficios\_canjeados": 0

`    `},

`    `{

`        `"id\_acceso\_link": 10,

`        `"id\_evento": 27,

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"titulo": "Instagram General",

`        `"leyenda\_publica": "Registrate al tardeo y participá por una consumición gratis.",

`        `"token": "4RY7UL3JxXPCVYN9ch7UABHKPYUSqBha",

`        `"es\_captacion\_publica": **true**,

`        `"requiere\_registro": **true**,

`        `"max\_personas\_total": 200,

`        `"max\_adultos": 200,

`        `"requiere\_nombres\_acompanantes": **false**,

`        `"cupo\_beneficio": 10,

`        `"id\_tipo\_beneficio\_registro": 1,

`        `"tipo\_beneficio\_codigo": "CONSUMICION",

`        `"beneficio\_titulo": "Consumición gratis",

`        `"beneficio\_descripcion": "Válida para los primeros 10 registrados.",

`        `"beneficio\_hasta": "2026-05-03T23:00:00+00:00",

`        `"mostrar\_disponibles": **true**,

`        `"mensaje\_post\_registro": "Tu lugar quedó registrado. Te esperamos en el Quincho.",

`        `"origen\_default": "INSTAGRAM",

`        `"permite\_reutilizar\_audiencia": **true**,

`        `"fecha\_expiracion": "2026-05-04T02:59:00+00:00",

`        `"activo": **true**,

`        `"registrados": 0,

`        `"beneficios\_otorgados": 0,

`        `"beneficios\_canjeados": 0

`    `}

]

**Botón “Alta Campaña”**

Objetivo: Dar de alta una campaña o canal de captación para **un evento público ya creado**.

Campos del Formulario

- Acceso
  - campo BD: id\_acceso 
  - Define a qué acceso del evento queda asociado el link/campaña.
  - tipo UI: combo 
  - obligatorio 
  - fuente del combo: accesos del evento 
  - **Endpoint:** **GET /evento\_accesos/GetByEvento?idEvento={idEvento}**

- Título
  - Campo BD: titulo 
  - Es el nombre interno de la campaña
  - tipo UI: input text 
  - obligatorio 
  - Ej: whatsapp difusión, Instagram General, QR Barra, Influencers, Lista VIP

- Leyenda pública
  - backend: leyenda\_publica 
  - Es el texto visible en la landing pública
  - tipo UI: textarea corta 
  - opcional 
  - ej: Registrate al tardeo del sábado y participá por una consumisión gratis
####
- Cupo total
  - backend: max\_personas\_total 
  - Es la cantidad máxima de registros permitidos para esa campaña
  - tipo UI: input numérico 
  - obligatorio 
  - validación: >= 1 
####
- Máximo adultos por registro
  - backend: max\_adultos 
  - Cantidad máxima de adultos permitidos por cada registro
  - tipo UI: input numérico 
  - opcional 
####
- Fecha expiración del link / campaña
  - backend: fecha\_expiracion 
  - Hasta cuándo el link queda habilitado para registrar gente.
  - tipo UI: datetime picker 
  - opcional 

- Pedir nombres de acompañantes
  - backend: requiere\_nombres\_acompanantes 
  - Si al registrarse se deben informar nombres de acompañantes
  - tipo UI: toggle 
  - default: false 

- Es captación pública
  - backend: es\_captacion\_publica 
  - Marca la campaña como canal público de captación.
  - tipo UI: toggle 
  - default: true en eventos públicos 

- Requiere registro
  - backend: requiere\_registro 
  - Define si el usuario debe completar el formulario para quedar registrado
  - tipo UI: toggle 
  - default: true 

- Cupo del beneficio
  - backend: cupo\_beneficio 
  - Cantidad máxima de personas que recibirán el beneficio asociado
  - tipo UI: input numérico 
  - opcional 

- Tipo de beneficio
  - backend: id\_tipo\_beneficio\_registro 
  - Tipo de incentivo asociado a la campaña
  - tipo UI: combo 
  - opcional 
  - fuente del combo: ef\_param\_tipos\_beneficio\_registro 
  - **Endpoint: 	GET /parametrica/TiposBeneficioRegistro?idEvento={idEvento}**

(postman: Parametros\Tipo Beneficio Registro por idioma evento)


- Título del beneficio
  - backend: beneficio\_titulo 
  - Nombre comercial corto del beneficio
  - tipo UI: input text 
  - obligatorio si hay tipo de beneficio 
  - Ej: Consumisión Gratis

- Descripción del beneficio
  - backend: beneficio\_descripcion 
  - Detalle visible del beneficio
  - tipo UI: textarea 
  - opcional 
  - Ej: "Promo Válida para los primeros 10 registrados."

- Vencimiento del beneficio
  - backend: beneficio\_hasta 
  - Hasta cuándo se puede otorgar/usar el beneficio.
  - tipo UI: datetime picker 
  - opcional 

- Mostrar disponibles en la landing
  - backend: mostrar\_disponibles 
  - Si en la landing se muestra disponibilidad/cupos restantes.
  - tipo UI: toggle 

- Mensaje post registro
  - backend: mensaje\_post\_registro 
  - Texto que se devuelve/muestra después de registrarse.
  - tipo UI: textarea 
  - opcional 
  - Ej: "Tu lugar quedó registrado. Te esperamos en el Quincho."

- Origen default
  - backend: origen\_default 
  - Etiqueta interna del canal por el que entra la persona
  - tipo UI: combo con valores sugeridos: INSTAGRAM, QR\_BARRA, WHATSAPP, VIP, INFLUENCERS,  STAFF
  - opcional 
  - ejemplos: INSTAGRAM, QR\_MESA, WHATSAPP 

- Permite reutilizar audienciapara otras acciones?
  - backend: permite\_reutilizar\_audiencia 
  - Si esa audiencia puede reutilizarse para futuras acciones/campañas
  - tipo UI: toggle 

- Activo
  - backend: activo 
  - Si la campaña está habilitada o no
  - tipo UI: toggle 

**Endpoint para guardar campaña:**

`	`**POST /evento\_captacion\_links/Upsert?idEvento={idEvento}**

(postman: Eventos B2C-B2B-Completo\Guardar campaña)

JSON ejemplo:

{

`  `"id\_acceso\_link": **null**,

`  `"id\_acceso": 48,

`  `"titulo": "Instagram General",

`  `"leyenda\_publica": "Registrate al tardeo y participá por una consumición gratis.",

`  `"max\_personas\_total": 200,

`  `"max\_adultos": 2,

`  `"fecha\_expiracion": "2026-05-03T23:59:00-03:00",

`  `"requiere\_nombres\_acompanantes": **false**,

`  `"es\_captacion\_publica": **true**,

`  `"requiere\_registro": **true**,

`  `"cupo\_beneficio": 10,

`  `"id\_tipo\_beneficio\_registro": 1,

`  `"beneficio\_titulo": "Consumición gratis",

`  `"beneficio\_descripcion": "Válida para los primeros 10 registrados.",

`  `"beneficio\_hasta": "2026-05-03T20:00:00-03:00",

`  `"mostrar\_disponibles": **true**,

`  `"mensaje\_post\_registro": "Tu lugar quedó registrado. Te esperamos en el Quincho.",

`  `"origen\_default": "INSTAGRAM",

`  `"permite\_reutilizar\_audiencia": **true**,

`  `"activo": **true**

}

Activar / desactivar campaña

(ef\_evento\_acceso\_links)

**Endpoint:**

**PUT /evento\_captacion\_links/SetActivo?idAccesoLink={idAccesoLink}&activo={true|false}**

Ejemplo

PUT /evento\_captacion\_links/SetActivo?idAccesoLink=11&activo=false

Respuesta:

{

`    `"ok": **true**,

`    `"id\_acceso\_link": 11,

`    `"activo": **false**

}


**Página publica de registro de campaña**

Objetivo

Mostrar la pantalla pública a la que entra la persona desde Instagram / QR / WhatsApp / etc.

**Endpoint**

**GET /evento\_captacion\_links/Landing?token={token}**

(postman: Eventos B2C-B2B-Completo\Mostrar pantalla pública evento)

Ejemplo

GET /evento\_captacion\_links/Landing?token=VLCJWkHzgBxieMKwcFrAN9fMMcQwPJFo

Qué devuelve

- datos del evento 
- datos de la campaña 
- beneficio 
- vencimiento 
- mensaje posterior 

Respuesta

{

`    `"id\_evento": 27,

`    `"id\_acceso\_link": 13,

`    `"id\_acceso": 48,

`    `"acceso\_nombre": "Lista con beneficio",

`    `"titulo": "Lista VIP",

`    `"leyenda\_publica": "Acceso exclusivo para invitados especiales.",

`    `"anfitriones\_texto": "Tarde de música",

`    `"mensaje\_bienvenida": "Gracias por acompañarnos",

`    `"max\_personas\_total": 25,

`    `"max\_adultos": 1,

`    `"requiere\_nombres\_acompanantes": **false**,

`    `"cupo\_beneficio": 25,

`    `"beneficio\_titulo": "Acceso VIP",

`    `"beneficio\_descripcion": "Ingreso preferencial con consumición incluida.",

`    `"beneficio\_hasta": "2026-05-04T01:00:00+00:00",

`    `"mostrar\_disponibles": **false**,

`    `"mensaje\_post\_registro": "Tu acceso VIP quedó reservado.",

`    `"origen\_default": "VIP",

`    `"fecha\_expiracion": "2026-05-03T22:30:00+00:00",

`    `"expirado": **false**

}

Formulario público de registro

Objetivo

Registrar una persona al evento público y consolidarla en Audiencias.

- Nombre
  - backend: nombre 
  - tipo UI: input text 
  - obligatorio 

- Apellido
  - backend: apellido 
  - tipo UI: input text 
  - obligatorio 

- Email
  - backend: email 
  - tipo UI: input email 
  - opcional pero recomendado 
###
- Celular
  - backend: celular 
  - tipo UI: input text 
  - Obligatorio
###
- Fecha de nacimiento
  - backend: fecha\_nacimiento 
  - tipo UI: date picker 
  - opcional 
###
- Instagram
  - backend: instagram 
  - tipo UI: input text 
  - opcional 
###
- Zona
  - backend: zona 
  - tipo UI: input text 
  - opcional 
###
- Ciudad
  - backend: ciudad 
  - tipo UI: input text 
  - opcional 
###
- Cómo asistirás?
  - backend: id\_perfil\_asistencia 
  - tipo UI: combo 
  - opcional 
  - **Endpoint**: 

    **GET /parametrica/PerfilesAsistencia?idEvento=27**

(postman: Parametros\Tipo Perfiles asistencia por idioma evento)

Respuesta ejemplo

[

`    `{

`        `"id": 1,

`        `"codigo": "SOLO",

`        `"texto": "Solo/a",

`        `"orden": 1

`    `},

`    `{

`        `"id": 2,

`        `"codigo": "PAREJA",

`        `"texto": "En pareja",

`        `"orden": 2

`    `},

`    `{

`        `"id": 3,

`        `"codigo": "AMIGOS",

`        `"texto": "Con amigos",

`        `"orden": 3

`    `},

`    `{

`        `"id": 4,

`        `"codigo": "GRUPO",

`        `"texto": "En grupo",

`        `"orden": 4

`    `}

]
###
- Qué tipo de eventos te interesan?
  - backend: id\_intereses\_evento 
  - tipo UI: multi-select 
  - opcional 
  - **Endpoint**: 

    GET /parametrica/InteresesEventoPublico?idEvento=27

(postman: Parametros\Tipo eventos de interés por idioma evento)

Respuesta ejemplo

[

`    `{

`        `"id": 1,

`        `"codigo": "SUNSET",

`        `"texto": "Sunset",

`        `"orden": 1

`    `},

`    `{

`        `"id": 2,

`        `"codigo": "TARDEO",

`        `"texto": "Tardeo",

`        `"orden": 2

`    `},

`    `{

`        `"id": 3,

`        `"codigo": "AFTER",

`        `"texto": "After",

`        `"orden": 3

`    `},

`    `{

`        `"id": 4,

`        `"codigo": "BRUNCH",

`        `"texto": "Brunch",

`        `"orden": 4

`    `},

`    `{

`        `"id": 5,

`        `"codigo": "DJ\_SET",

`        `"texto": "DJ set",

`        `"orden": 5

`    `},

`    `{

`        `"id": 6,

`        `"codigo": "GASTRONOMICO",

`        `"texto": "Gastronómico",

`        `"orden": 6

`    `},

`    `{

`        `"id": 7,

`        `"codigo": "TEMATICO",

`        `"texto": "Temático",

`        `"orden": 7

`    `}

]


- Preferencias musicales
  - backend: id\_preferencias\_musicales 
  - tipo UI: multi-select 
  - opcional 
  - **Endpoint**: 

    **GET /parametrica/PreferenciasMusicales?idEvento=27**

(postman: Parametros\Preferencias musicales por idioma evento)
###
Respuesta ejemplo

[

`    `{

`        `"id": 1,

`        `"codigo": "HOUSE",

`        `"texto": "House",

`        `"orden": 1

`    `},

`    `{

`        `"id": 2,

`        `"codigo": "ELECTRONICA",

`        `"texto": "Electrónica",

`        `"orden": 2

`    `},

`    `{

`        `"id": 3,

`        `"codigo": "REGGAETON",

`        `"texto": "Reggaetón",

`        `"orden": 3

`    `},

`    `{

`        `"id": 4,

`        `"codigo": "HITS\_COMERCIALES",

`        `"texto": "Hits comerciales",

`        `"orden": 4

`    `},

`    `{

`        `"id": 5,

`        `"codigo": "LATIN",

`        `"texto": "Latino",

`        `"orden": 5

`    `},

`    `{

`        `"id": 6,

`        `"codigo": "POP",

`        `"texto": "Pop",

`        `"orden": 6

`    `},

`    `{

`        `"id": 7,

`        `"codigo": "INDIE",

`        `"texto": "Indie",

`        `"orden": 7

`    `},

`    `{

`        `"id": 8,

`        `"codigo": "FOLK",

`        `"texto": "Folk",

`        `"orden": 8

`    `},

`    `{

`        `"id": 9,

`        `"codigo": "FLAMENCO",

`        `"texto": "Flamenco",

`        `"orden": 9

`    `},

`    `{

`        `"id": 10,

`        `"codigo": "TANGO",

`        `"texto": "Tango",

`        `"orden": 10

`    `},

`    `{

`        `"id": 11,

`        `"codigo": "COVERS",

`        `"texto": "Covers",

`        `"orden": 11

`    `},

`    `{

`        `"id": 12,

`        `"codigo": "MUSICA\_80",

`        `"texto": "Música de los 80",

`        `"orden": 12

`    `},

`    `{

`        `"id": 13,

`        `"codigo": "MUSICA\_90",

`        `"texto": "Música de los 90",

`        `"orden": 13

`    `},

`    `{

`        `"id": 14,

`        `"codigo": "ROCK",

`        `"texto": "Rock",

`        `"orden": 14

`    `}

]




- Quiero recibir novedades y avisos de próximos eventos
  - backend: acepta\_comunicaciones 
  - tipo UI: checkbox 

- Quiero recibir promociones y beneficios especiales
  - backend: acepta\_promociones 
  - tipo UI: checkbox 
###
Campos ocultos / tracking

Estos pueden viajar ocultos o armarlos el front:

- origen\_registro 
- campania\_fuente 
- campania\_medio 
- campania\_nombre 
- campania\_contenido 
- campania\_termino 
- pagina\_origen 
- referer 

En realidad creo que celular o email tienen que ser obligatorios sino para invitarlos en una próxima campaña masiva no sirven estos registros


**Regla funcional recomendada para no duplicar registros**

1\. Evento público / captación

Ejemplo:

- tardeo 
- after 
- evento abierto 

**Prioridad 1**

- mismo id\_evento 
- mismo email 

**Prioridad 2**\
si no hay email:

- mismo id\_evento 
- mismo celular 
- mismo nombre 
- mismo apellido 
####
Qué pasa si coincide

No crear:

- nuevo ef\_invitados 
- nuevo ef\_invitados\_perfiles 
- nuevo ef\_audiencia\_persona\_eventos 

Si existe:

- devolver existente , no hace falta tirar error
- se puede
  - completar instagram si antes estaba vacío 
  - completar zona 
  - completar ciudad 
  - completar consentimientos 
  - completar perfil asistencia 
  - completar tracking de campaña si vino más completo 

Pero sin crear nuevas filas.

###
2\. Evento privado / RSVP familiar

Ejemplo:

- boda 
- cumpleaños 
- invitación con padre + hijos 

No por email/celular.\
Ahí la unidad es:

- token de invitación 
- grupo RSVP 
- acceso privado 

Qué pasa si vuelve a entrar

- reabre la misma invitación/grupo 
- actualiza integrantes 
- no duplica grupo 
- no duplica invitados 




**Endpoint guardar**

**POST /audiencias/Registrar?token={token}**

(postman: Eventos B2C-B2B-Completo\Guardar audiencia de una campaña)

Ejemplo

POST /audiencias/Registrar?token= VLCJWkHzgBxieMKwcFrAN9fMMcQwPJFo


JSON ejemplo 1

{

`  `"nombre": "Lucía",

`  `"apellido": "Pérez",

`  `"email": "lucia@gmail.com",

`  `"celular": "+5492234000000",

`  `"fecha\_nacimiento": "1995-08-10",

`  `"instagram": "@luciaperez",

`  `"zona": "Güemes",

`  `"ciudad": "Mar del Plata",

`  `"id\_perfil\_asistencia": 3,

`  `"acepta\_terminos": **true**,

`  `"acepta\_comunicaciones": **true**,

`  `"acepta\_promociones": **true**,

`  `"origen\_registro": "INSTAGRAM",

`  `"campania\_fuente": "instagram",

`  `"campania\_medio": "organic",

`  `"campania\_nombre": "tardeo\_abril",

`  `"campania\_contenido": "post\_feed",

`  `"campania\_termino": **null**,

`  `"pagina\_origen": "/landing/instagram-general",

`  `"referer": "https://instagram.com/",

`  `"id\_intereses\_evento": [1, 2],

`  `"id\_preferencias\_musicales": [5, 6, 7]

}

Respuesta

{

`    `"ok": **true**,

`    `"id\_invitado": 49,

`    `"id\_audiencia\_persona": 1,

`    `"beneficio\_otorgado": **true**,

`    `"id\_beneficio\_registro": 1,

`    `"codigo\_canje": "JvWWWxSC659r",

`    `"rsvp\_token": "CbdBqGTiGfYqrCJ8Qw8pFLoLVhHpmzZF",

`    `"qr\_token": "o4ngEchHdydCVX7xVTrVuRNHH6UsMKP5",

`    `"mensaje\_post\_registro": "Tu acceso VIP quedó reservado."

}

JSON ejemplo 2

{

`  `"nombre": "Tomás",

`  `"apellido": "Rivas",

`  `"email": "tomas@gmail.com",

`  `"celular": "+5492234111111",

`  `"fecha\_nacimiento": "1992-02-15",

`  `"instagram": "@tomasrivas",

`  `"zona": "Centro",

`  `"ciudad": "Mar del Plata",

`  `"id\_perfil\_asistencia": 2,

`  `"acepta\_terminos": **true**,

`  `"acepta\_comunicaciones": **true**,

`  `"acepta\_promociones": **false**,

`  `"origen\_registro": "QR\_BARRA",

`  `"campania\_fuente": "qr",

`  `"campania\_medio": "fisico",

`  `"campania\_nombre": "barra\_restaurante",

`  `"campania\_contenido": "mesa\_barra",

`  `"campania\_termino": **null**,

`  `"pagina\_origen": "/landing/qr-barra",

`  `"referer": **null**,

`  `"id\_intereses\_evento": [2],

`  `"id\_preferencias\_musicales": [5, 6]

}


Respuesta

{

`    `"ok": **true**,

`    `"id\_invitado": 50,

`    `"id\_audiencia\_persona": 2,

`    `"beneficio\_otorgado": **true**,

`    `"id\_beneficio\_registro": 2,

`    `"codigo\_canje": "4kX5PUaHCV8i",

`    `"rsvp\_token": "Ja9AJMWv4DVXAWrvdKUSVGLnVDXbV9kb",

`    `"qr\_token": "jQyHbFEvWnBEceqZuz96Er7SNVaLbVjc",

`    `"mensaje\_post\_registro": "Te anotamos. Guardá este registro para el ingreso."

}

JSON ejemplo 3

{

`  `"nombre": "Sofía",

`  `"apellido": "Luna",

`  `"email": "sofia@gmail.com",

`  `"celular": "+5492234222222",

`  `"fecha\_nacimiento": "1998-11-20",

`  `"instagram": "@sofialuna",

`  `"zona": "Playa Grande",

`  `"ciudad": "Mar del Plata",

`  `"id\_perfil\_asistencia": 1,

`  `"acepta\_terminos": **true**,

`  `"acepta\_comunicaciones": **true**,

`  `"acepta\_promociones": **true**,

`  `"origen\_registro": "INFLUENCERS",

`  `"campania\_fuente": "influencer",

`  `"campania\_medio": "story",

`  `"campania\_nombre": "influencers\_abril",

`  `"campania\_contenido": "perfil\_ana",

`  `"campania\_termino": **null**,

`  `"pagina\_origen": "/landing/influencers",

`  `"referer": "https://instagram.com/",

`  `"id\_intereses\_evento": [1, 3],

`  `"id\_preferencias\_musicales": [6, 7]

}


Respuesta

{

`    `"ok": **true**,

`    `"id\_invitado": 51,

`    `"id\_audiencia\_persona": 3,

`    `"beneficio\_otorgado": **true**,

`    `"id\_beneficio\_registro": 3,

`    `"codigo\_canje": "zFNeRY2pUU7a",

`    `"rsvp\_token": "jeaKuicfn7XYqRCp8uSaeJbvb4k8gpLj",

`    `"qr\_token": "VcfSRKqoR7c5x3X4Hu8UrNgp3sBoUU5e",

`    `"mensaje\_post\_registro": "Te anotamos. Guardá este registro para el ingreso."

}



**Tab: Personas registradas al Evento**

Objetivo

Mostrar todas las personas registradas al evento público, independientemente de la campaña por la que ingresaron, y permitir acceder a la operación de ingreso y canje mediante QR

**Endpoint**

**GET /audiencias/GetRegistrosEvento?idEvento=27**

(postman: Eventos B2C-B2B-Completo\Listar personas registradas en todas las campañas de un evento)

Datos de la grilla:

- fecha alta 
- nombre 
- apellido 
- email 
- celular 
- acceso 
- campaña / link 
- origen registro 
- perfil asistencia 
- intereses 
- preferencias musicales 
- acepta comunicaciones 
- acepta promociones 
- beneficio otorgado 
- beneficio canjeado 
- asistió 

Respuesta (según los ejemplos de los post anteriores):

[

`    `{

`        `"id\_invitado": 51,

`        `"id\_audiencia\_persona": 3,

`        `"nombre": "Sofía",

`        `"apellido": "Luna",

`        `"email": "sofia@gmail.com",

`        `"celular": "+5492234222222",

`        `"fecha\_alta": "2026-04-20T16:40:59.918971+00:00",

`        `"rsvp\_estado": "Y",

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"id\_acceso\_link": 12,

`        `"origen\_registro": "INFLUENCERS",

`        `"id\_perfil\_asistencia": 1,

`        `"intereses": [

`            `"SUNSET",

`            `"AFTER"

`        `],

`        `"preferencias\_musicales": [

`            `"POP",

`            `"INDIE"

`        `],

`        `"acepta\_comunicaciones": **true**,

`        `"acepta\_promociones": **true**,

`        `"beneficio\_otorgado": **true**,

`        `"beneficio\_canjeado": **false**,

`        `"asistio": **false**

`    `},

`    `{

`        `"id\_invitado": 50,

`        `"id\_audiencia\_persona": 2,

`        `"nombre": "Tomás",

`        `"apellido": "Rivas",

`        `"email": "tomas@gmail.com",

`        `"celular": "+5492234111111",

`        `"fecha\_alta": "2026-04-20T16:37:47.88927+00:00",

`        `"rsvp\_estado": "Y",

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"id\_acceso\_link": 12,

`        `"origen\_registro": "QR\_BARRA",

`        `"id\_perfil\_asistencia": 2,

`        `"intereses": [

`            `"TARDEO"

`        `],

`        `"preferencias\_musicales": [

`            `"LATIN",

`            `"POP"

`        `],

`        `"acepta\_comunicaciones": **true**,

`        `"acepta\_promociones": **false**,

`        `"beneficio\_otorgado": **true**,

`        `"beneficio\_canjeado": **false**,

`        `"asistio": **false**

`    `},

`    `{

`        `"id\_invitado": 49,

`        `"id\_audiencia\_persona": 1,

`        `"nombre": "Lucía",

`        `"apellido": "Pérez",

`        `"email": "lucia@gmail.com",

`        `"celular": "+5492234000000",

`        `"fecha\_alta": "2026-04-20T16:31:53.514408+00:00",

`        `"rsvp\_estado": "Y",

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"id\_acceso\_link": 13,

`        `"origen\_registro": "INSTAGRAM",

`        `"id\_perfil\_asistencia": 3,

`        `"intereses": [

`            `"SUNSET",

`            `"TARDEO"

`        `],

`        `"preferencias\_musicales": [

`            `"LATIN",

`            `"POP",

`            `"INDIE"

`        `],

`        `"acepta\_comunicaciones": **true**,

`        `"acepta\_promociones": **true**,

`        `"beneficio\_otorgado": **true**,

`        `"beneficio\_canjeado": **false**,

`        `"asistio": **false**

`    `}

]

Uso de la grilla

La grilla no es la herramienta principal de operación en eventos masivos.\
Se utiliza para:

- consulta general 
- soporte 
- búsqueda manual de personas que perdieron el QR 
- resolución de excepciones

Encima de la grilla habrá 2 botones bien visibles:

- LEER QR ENTRADA (este botón lo debería ver alguien con perfil staff\_puerta o a definir)
- LEER QR BENEFICIO  (este botón lo debería ver alguien con perfil staff\_barra o a definir)

**PANTALLA LEER QR ENTRADA**

Objetivo

Registrar el ingreso o reingreso de una persona al evento.

Esta pantalla es la herramienta principal para operar en puerta en eventos masivos.\
No se apoya en una grilla como flujo principal, sino en la lectura de QR.

Componentes de la pantalla

*1. Bloque Escanear QR*

Título: **Escaneá el QR del asistente** 

Se escanea el QR:

**Endpoint**:

**GET /audiencias/ResolverQrEntrada?idEvento={idEvento}&qrToken={qrToken}**

(postman: Eventos B2C-B2B-Completo\Leer QR Entrada)

Ejemplo:	

GET /audiencias/ResolverQrEntrada?idEvento=27&qrToken=o4ngEchHdydCVX7xVTrVuRNHH6UsMKP5

Respuesta:

{

`    `"id\_evento": 27,

`    `"id\_invitado": 49,

`    `"nombre": "Lucía",

`    `"apellido": "Pérez",

`    `"email": "lucia@gmail.com",

`    `"celular": "+5492234000000",

`    `"id\_acceso": 48,

`    `"acceso\_nombre": "Lista con beneficio",

`    `"id\_acceso\_link": 13,

`    `"campania": "Lista VIP",

`    `"origen\_registro": "VIP",

`    `"ya\_ingreso": **false**,

`    `"ultimo\_movimiento\_tipo": **null**,

`    `"ultimo\_movimiento\_fecha": **null**,

`    `"accion\_sugerida": "INGRESO",

`    `"beneficio\_otorgado": **true**,

`    `"beneficio\_canjeado": **false**,

`    `"beneficio\_pendiente": **true**,

`    `"id\_beneficio\_registro": 1,

`    `"beneficio\_titulo": "Acceso VIP",

`    `"beneficio\_descripcion": "Ingreso preferencial con consumición incluida.",

`    `"qr\_token": "o4ngEchHdydCVX7xVTrVuRNHH6UsMKP5",

`    `"mostrar\_qr\_para\_canje": **true**

}

Escenario 1: QR válido y la persona nunca ingresó.

Si el backend devuelve:

"ya\_ingreso": false,\
"accion\_sugerida": "INGRESO"

Mostrar:

Bloque principal

- **Nombre y apellido** 
- **Acceso**: por ejemplo “Lista con beneficio” 
- **Campaña**: por ejemplo “Lista VIP” 
- **Estado**: **No ingresó** 
- **Beneficio**
  - Si tiene beneficio pendiente mostrar: 
    - **Beneficio**: Sí 
    - título del beneficio 
    - estado: **Pendiente** 
  - Si no tiene beneficio mostrar:
    - **Beneficio**: No tiene 
- campo observaciones (opcional y manual)
- botón grande: **Registrar ingreso** 

  **Endpoint:**

  **POST /evento\_checkins**

  (postman: Eventos B2C-B2B-Completo\Registrar Ingreso Entrada)


  JSON:

  {

  `  `"id\_evento": 27,

  `  `"id\_invitado": 49,

  `  `"id\_acceso": 48,

  `  `"id\_acceso\_link": 13,

  `  `"tipo": "INGRESO",

  `  `"observaciones": **null**

  }

  Respuesta:

  {

  `    `"ok": **true**,

  `    `"id\_checkin": 1

  }


Escenario 2: QR válido y la persona ya ingresó antes

Si el backend devuelve:

"ya\_ingreso": true,\
"accion\_sugerida": "REINGRESO",\
"ultimo\_movimiento\_tipo": "INGRESO",\
"ultimo\_movimiento\_fecha": "..."

Mostrar:

Bloque principal

- **Nombre y apellido** 
- **Acceso**: por ejemplo “Lista con beneficio” 
- **Campaña**: por ejemplo “Lista VIP” 
- **Estado**: **Ya registró ingreso previo**
- **Beneficio**
  - Si tiene beneficio pendiente mostrar: 
    - **Beneficio**: Sí 
    - título del beneficio 
    - estado: **Pendiente** (o canjeado… depende el estado)
  - Si no tiene beneficio mostrar:
    - **Beneficio**: No tiene 
- campo observaciones (opcional y manual)
- botón grande: **Registrar Reingreso** 

  **Endpoint:**

  **POST /evento\_checkins**

  (postman: Eventos B2C-B2B-Completo\Registrar Reingreso Entrada)


  JSON:

  {

  `  `"id\_evento": 27,

  `  `"id\_invitado": 49,

  `  `"id\_acceso": 48,

  `  `"id\_acceso\_link": 13,

  `  `"tipo": "REINGRESO",

  `  `"observaciones": **null**

  }

  Respuesta:

  {

  `    `"ok": **true**,

  `    `"id\_checkin": 2

  }

Escenario 3: la persona perdió el QR válido y se la busca manualmente

Flujo

- buscar por nombre, celular o email (uno de los 3)

  **Endpoint**:

  **GET /audiencias/BuscarRegistrado?idEvento=27&query=lucia**

  (postman: Eventos B2C-B2B-Completo\Buscar invitado manualmente)

  Respuesta:

  [

  `    `{

  `        `"id\_invitado": 49,

  `        `"nombre": "Lucía",

  `        `"apellido": "Pérez",

  `        `"email": "lucia@gmail.com",

  `        `"celular": "+5492234000000",

  `        `"id\_acceso": 48,

  `        `"acceso\_nombre": "Lista con beneficio",

  `        `"id\_acceso\_link": 13,

  `        `"origen\_registro": "VIP",

  `        `"asistio": **true**,

  `        `"beneficio\_otorgado": **true**,

  `        `"beneficio\_canjeado": **false**

  `    `}

  ]

- El front arma una grilla con pocos datos con todas las coincidencias encontradas.
- Se selecciona una persona de la grilla
- llamar a:

  **Endpoint**:

  **GET /audiencias/ResolverEntradaManual?idEvento={idEvento}&idInvitado={idInvitado}**

(postman: Eventos B2C-B2B-Completo\Registrar ingreso manualmente)

`	`Ejemplo:

GET /audiencias/ResolverEntradaManual?idEvento=27&idInvitado=49

{

`    `"id\_evento": 27,

`    `"id\_invitado": 49,

`    `"nombre": "Lucía",

`    `"apellido": "Pérez",

`    `"email": "lucia@gmail.com",

`    `"celular": "+5492234000000",

`    `"id\_acceso": 48,

`    `"acceso\_nombre": "Lista con beneficio",

`    `"id\_acceso\_link": 13,

`    `"campania": "Lista VIP",

`    `"origen\_registro": "VIP",

`    `"ya\_ingreso": **true**,

`    `"ultimo\_movimiento\_tipo": "REINGRESO",

`    `"ultimo\_movimiento\_fecha": "2026-04-21T13:36:57.467705+00:00",

`    `"accion\_sugerida": "REINGRESO",

`    `"beneficio\_otorgado": **true**,

`    `"beneficio\_canjeado": **false**,

`    `"beneficio\_pendiente": **true**,

`    `"id\_beneficio\_registro": 1,

`    `"beneficio\_titulo": "Acceso VIP",

`    `"beneficio\_descripcion": "Ingreso preferencial con consumición incluida.",

`    `"qr\_token": "o4ngEchHdydCVX7xVTrVuRNHH6UsMKP5",

`    `"mostrar\_qr\_para\_canje": **true**

}

- Con la respuesta el circuito sigue igual que en los casos anteriores en cuanto a los datos a mostrar y si mostrar botón de ingreso o reingreso.
- Lo único que hay que agregar en este caso es mostrar el qr para que el invitado le saque una foto ("mostrar\_qr\_para\_canje": **true)**
- El operador confirma y hace el POST /evento\_checkins

Escenario 4: QR inválido o persona no encontrada

- No hacer nada

Qué mostrar después de guardar ingreso/reingreso

Si fue ingreso: **Ingreso registrado correctamente** 

Si fue reingreso: **Reingreso registrado correctamente** 

Y dejar los botones:

- volver a escanear 
- volver a buscar


**PANTALLA LEER QR BENEFICIO**

Objetivo

Validar y registrar el canje de un beneficio otorgado a una persona registrada en una campaña de captación.

El flujo principal es:

1. la persona se acerca a la barra 
1. muestra su QR 
1. el staff lo escanea 
1. el sistema dice: 
- quién es 
- si tiene beneficio 
- si está pendiente 
- si ya fue canjeado 
- si está vencido 
- si corresponde, el staff toca **Canjear beneficio** 


Paso 1

La persona se acerca a la barra y muestra su QR.

Ese QR es el mismo qr\_token del invitado.

Paso 2

El usuario de la barra abre la pantalla **LEER QR BENEFICIO**.

Componentes de la pantalla

*1. Bloque Escanear QR BENEFICIO*

Título: **Escaneá el QR del asistente para validar el canje**

Se escanea el QR:

**Endpoint**:

**GET /audiencias/ResolverQrBeneficio?idEvento={idEvento}&qrToken={qrToken}**

(postman: Eventos B2C-B2B-Completo\Leer QR Beneficio)

Ejemplo:	

GET /audiencias/ ResolverQrBeneficio?idEvento=27&qrToken=o4ngEchHdydCVX7xVTrVuRNHH6UsMKP5

Respuesta:

{

`    `"id\_evento": 27,

`    `"id\_invitado": 49,

`    `"nombre": "Lucía",

`    `"apellido": "Pérez",

`    `"id\_acceso\_link": 13,

`    `"campania": "Lista VIP",

`    `"tiene\_beneficio": **true**,

`    `"id\_beneficio\_registro": 1,

`    `"tipo\_beneficio\_codigo": "CONSUMICION",

`    `"beneficio\_titulo": "Acceso VIP",

`    `"beneficio\_descripcion": "Ingreso preferencial con consumición incluida.",

`    `"estado\_beneficio": "PENDIENTE",

`    `"fecha\_vencimiento": "2026-05-04T01:00:00+00:00",

`    `"puede\_canjear": **true**,

`    `"mensaje": "Beneficio disponible para canje."

}

Según la respuesta:

Si estado\_beneficio = "PENDIENTE"

mostrar:

- nombre 
- beneficio 
- estado: pendiente 
- vencimiento 
- observaciones (input no obligatorio)
- botón **Canjear beneficio** 

Si estado\_beneficio = "CANJEADO"

mostrar:

- nombre 
- beneficio 
- estado: ya canjeado 
- sin botón 

Si estado\_beneficio = "NO\_APLICA"

mostrar:

- nombre 
- mensaje: no tiene beneficio 
- sin botón 

Si estado\_beneficio = "VENCIDO"

mostrar:

- nombre 
- beneficio 
- estado: vencido 
- sin botón


Paso 3

Si corresponde canjear, el front ejecuta  al hacer clic en el botón “Canjear Beneficio”:

**Endpoint**:

**POST /evento\_beneficios\_registro/Canjear?idBeneficioRegistro={idBeneficioRegistro}**

Ejemplo:

POST /evento\_beneficios\_registro/Canjear?idBeneficioRegistro=1

Respuesta:

{

`    `"ok": **true**

}

o con observación:

POST /evento\_beneficios\_registro/Canjear?idBeneficioRegistro=21&observaciones=Consumicion%20entregada



**Tab: Asistencia**

**Endpoint listado de personas registradas que concurrieron al evento**

**GET /evento\_checkins/GetByEvento?idEvento=27**

(postman: Eventos B2C-B2B-Completo\Personas que concurrieron a un evento)


**Tab: Métricas**

Objetivo

Dar una vista clara del rendimiento del evento público según:

- captación 
- conversión a asistencia 
- beneficio 
- perfil de audiencia

**Endpoint principal**

**GET /audiencias/GetMetricasEvento?idEvento=27**

(postman: Eventos B2C-B2B-Completo\Leer Métricas de Campañas de un evento)

**Diseño de pantalla**

***Bloque 1: Tarjetas Resumen***

Tarjetas resumen: Arriba, 6 cards.

Esto sale de:

"resumen": {

`        `"registrados": 3,

`        `"asistieron": 1,

Card 1

**Registrados**

- valor: resumen.registrados 

Card 2

**Asistieron**

- valor: resumen.asistieron 

Card 3

**Se registraron y no asistieron**

- valor: resumen.no\_show 

Card 4

**Conversión a asistencia**

- valor: resumen.conversion\_asistencia\_pct % 

Card 5

**Beneficios otorgados**

- valor: resumen.beneficios\_otorgados 

Card 6

**Beneficios canjeados**

- valor: resumen.beneficios\_canjeados 

**Conversión de beneficio**

- beneficios\_canjeados \* 100 / beneficios\_otorgados


***Bloque 2: Métricas/Rendimiento por Campaña***

Esto sale de:

"por\_campania": [

`        `{

`            `"id\_acceso\_link": 12,

`            `"campania": "WhatsApp Difusión",

`            `"registrados": 2,

`            `"asistieron": 0,

`            `"beneficios\_otorgados": 2,

`            `"beneficios\_canjeados": 0

`        `},

`        `{

`            `"id\_acceso\_link": 13,

`            `"campania": "Lista VIP",

……	

Tabla: Columnas

- campaña 
- registrados 
- asistieron 
- no asistieron (registrados – asistieron)
- beneficios otorgados 
- beneficios canjeados 
- conversión asistencia % (fórmula: asistieron \* 100 / registrados)
- conversión beneficio % (fórmula: beneficios\_canjeados \* 100 / beneficios\_otorgados)

Ejemplo:

|**Campaña**|**Registrados**|**Asistieron**|**No Asistieron**|**Beneficios otorgados**|**Beneficios canjeados**|**Conv. asistencia**|**Conv. beneficio**|
| :-: | -: | -: | -: | -: | -: | -: | -: |
|**Instagram General**|40|26|14|10|4|65%|40%|
|**WhatsApp Difusión**|35|29|6|20|6|82,86%|30%|

Para qué sirve

Ver cuál campaña trae:

- más registros 
- mejor asistencia 
- mejor conversión de beneficio


***Bloque 3: Rendimiento por Origen***

Esto sale de:

` `"por\_origen": [

`        `{

`            `"origen\_registro": "INFLUENCERS",

`            `"registrados": 1,

`            `"asistieron": 0,

`            `"beneficios\_otorgados": 1,

`		`……

Qué mostrar

Tabla o Gráfico de barras (analizar)

Columnas

- Origen** 
- Registrados** 
- Asistieron** 
- Beneficios otorgados** 
- Beneficios canjeados** 

Campos de cada item:

- origen\_registro 
- registrados 
- asistieron 
- beneficios\_otorgados 
- beneficios\_canjeados

Sirve para entender qué canal funciona mejor en general.

***Bloque 4: Perfil de Asistencia***

Esto sale de:

` `"por\_perfil\_asistencia": [

`        `{

`            `"id\_perfil\_asistencia": 1,

`            `"perfil\_texto": "SOLO",

`            `"cantidad": 1

`        `},

`        `{

`            `"id\_perfil\_asistencia": 2,

`            `"perfil\_texto": "PAREJA",

`		`……

Cómo dijo la gente que iba a asistir:

- solo/a 
- en pareja 
- con amigos 
- en grupo 

Qué mostrar

Tabla o gráfico torta/barras.

Columnas

- Perfil de asistencia** 
- Cantidad** 

Campos de cada item:

- perfil\_texto 
- cantidad

***Bloque 5: Intereses más elegidos***

Esto sale de:

` `"top\_intereses": [

`        `{

`            `"codigo": "TARDEO",

`            `"texto": "TARDEO",

`            `"cantidad": 2

`        `},

`        `{

`            `"codigo": "SUNSET",

`            `"texto": "SUNSET",

`            `"cantidad": 2

`        `},

`	`………	

Representa los intereses que marcaron al registrarse:

- Tardeo 
- Sunset 
- After 
- Brunch 
- etc. 

Qué mostrar

Ranking o tabla.

Columnas

- Interés** 
- Cantidad** 

Campos de cada item:

- texto 
- cantidad 

***Bloque 6: Preferencias Musicales***

Esto sale de:

`   `"top\_preferencias\_musicales": [

`        `{

`            `"codigo": "POP",

`            `"texto": "POP",

`            `"cantidad": 3

`        `},

`        `{

`            `"codigo": "INDIE",

`		`…………

Representa qué estilos musicales eligió más la gente al registrarse:

- Pop 
- Latino 
- Indie 
- House 
- Rock 
- etc. 

Qué mostrar

Ranking o tabla chica

Columnas

- Preferencia musical** 
- Cantidad** 

Campos de cada item:

- texto 
- cantidad

**TAGS**

Este módulo sirve para segmentar y clasificar audiencias a nivel cuenta.

El módulo de Audiencias ya quedó pensado como un mini CRM: no sólo saber quién se registró, sino quién asistió, por qué campaña entró, si canjeó beneficio y qué comportamiento tuvo. 

Los **tags** sirven para agregar una capa de clasificación reutilizable sobre esa audiencia, por ejemplo:

- CLASIFICACION:VIP 
- CLASIFICACION:FRECUENTE 
- ACCION:CONTACTAR 
- ORIGEN:INSTAGRAM 
- ASISTENCIA:ASISTIO 
- BENEFICIO:CANJEO 

No reemplazan los datos operativos. Los complementan.

Menú:

Cuenta à Audiencia

Muestra un listado de Audiencia de la cuenta

**Endpoint**:

**GET /audiencias/GetAll?soloActivas=true**

(postman: Eventos B2C-B2B-Completo\Audiencia-Ver Audiencia Cuenta)

Respuesta:

[

`    `{

`        `"id\_audiencia\_persona": 3,

`        `"nombre": "Sofía",

`        `"apellido": "Luna",

`        `"email": "sofia@gmail.com",

`        `"celular": "+5492234222222",

`        `"fecha\_nacimiento": "1998-11-20T00:00:00",

`        `"instagram": "@sofialuna",

`        `"zona": "Playa Grande",

`        `"ciudad": "Mar del Plata",

`        `"acepta\_comunicaciones": **true**,

`        `"acepta\_promociones": **true**,

`        `"activo": **true**,

`        `"fecha\_alta": "2026-04-20T16:41:00.970454+00:00",

`        `"eventos\_registrados": 1,

`        `"eventos\_asistidos": 0,

`        `"ultima\_participacion": "2026-04-20T16:41:01.612307+00:00",

`        `"tags": []

`    `},

`    `{

`        `"id\_audiencia\_persona": 2,

`        `"nombre": "Tomás",

`        `"apellido": "Rivas",

`        `"email": "tomas@gmail.com",

`        `"celular": "+5492234111111",

`        `"fecha\_nacimiento": "1992-02-15T00:00:00",

`        `"instagram": "@tomasrivas",

`        `"zona": "Centro",

`        `"ciudad": "Mar del Plata",

`        `"acepta\_comunicaciones": **true**,

`        `"acepta\_promociones": **false**,

`        `"activo": **true**,

`        `"fecha\_alta": "2026-04-20T16:37:48.368219+00:00",

`        `"eventos\_registrados": 1,

`        `"eventos\_asistidos": 0,

`        `"ultima\_participacion": "2026-04-20T16:37:48.777272+00:00",

`        `"tags": []

`    `},

`    `{

`        `"id\_audiencia\_persona": 1,

`        `"nombre": "Lucía",

`        `"apellido": "Pérez",

`        `"email": "lucia@gmail.com",

`        `"celular": "+5492234000000",

`        `"fecha\_nacimiento": "1995-08-10T00:00:00",

`        `"instagram": "@luciaperez",

`        `"zona": "Güemes",

`        `"ciudad": "Mar del Plata",

`        `"acepta\_comunicaciones": **true**,

`        `"acepta\_promociones": **true**,

`        `"activo": **true**,

`        `"fecha\_alta": "2026-04-20T16:31:56.276249+00:00",

`        `"eventos\_registrados": 1,

`        `"eventos\_asistidos": 1,

`        `"ultima\_participacion": "2026-04-20T16:31:57.122081+00:00",

`        `"tags": []

`    `}

]


Grilla

- nombre 
- apellido 
- email 
- celular 
- ciudad 
- eventos registrados 
- eventos asistidos 
- última participación 
- tags:
  - mostrar chips: máximo 3 visibles
  - si hay más de 3 mostrar +N
  - ejemplo: [VIP] [Origen Instagram] [Contactar] +2 
- Acción
  - Ver detalle 

Ver Detalle

**Endpoint**:

**GET /audiencias/GetById?idAudienciaPersona={idAudienciaPersona}**

(postman: Eventos B2C-B2B-Completo\Audiencia-Ver Detalle Audiencia Cuenta)

Respuesta:

{

`    `"id\_audiencia\_persona": 3,

`    `"id\_cuenta": 2,

`    `"nombre": "Sofía",

`    `"apellido": "Luna",

`    `"email": "sofia@gmail.com",

`    `"celular": "+5492234222222",

`    `"fecha\_nacimiento": "1998-11-20T00:00:00",

`    `"instagram": "@sofialuna",

`    `"zona": "Playa Grande",

`    `"ciudad": "Mar del Plata",

`    `"acepta\_comunicaciones": **true**,

`    `"acepta\_promociones": **true**,

`    `"activo": **true**,

`    `"fecha\_alta": "2026-04-20T16:41:00.970454+00:00",

`    `"tags": [],

`    `"historial": [

`        `{

`            `"id\_evento": 27,

`            `"evento\_nombre": "Tarde de música",

`            `"unidad": "Restaurante",

`            `"fecha\_registro": "2026-04-20T16:41:01.612307+00:00",

`            `"asistio": **false**,

`            `"origen\_registro": "INFLUENCERS",

`            `"beneficio\_otorgado": **true**,

`            `"beneficio\_canjeado": **false**

`        `}

`    `]

}

Bloque 1. Datos personales

Mostrar:

- nombre 
- apellido 
- email 
- celular 
- fecha de nacimiento 
- instagram 
- zona 
- ciudad 
- acepta comunicaciones 
- acepta promociones 
- activo 
- fecha alta

Bloque 2. Historial de eventos

Grilla

- evento 
- unidad 
- fecha registro 
- asistió 
- origen registro 
- beneficio otorgado 
- beneficio canjeado 

De donde sale:

`    `"historial": [

`        `{

`            `"id\_evento": 27,

`            `"evento\_nombre": "Tarde de música",

`            `"unidad": "Restaurante",

`            `"fecha\_registro": "2026-04-20T16:41:01.612307+00:00",

`            `"asistio": **false**,

`            `"origen\_registro": "INFLUENCERS",

`            `"beneficio\_otorgado": **true**,

`            `"beneficio\_canjeado": **false**

`        `}

`    `]

Bloque 3. Tags

Este es el importante.

***Sección: Tags actuales***

Mostrar todos los tags de la audiencia.

Qué mostrar por cada tag:

- chip con nombre\_mostrar 
- debajo o al lado: 
  - tag\_tipo 
  - origen (MANUAL o AUTO) 
- botón quitar/desactivar si corresponde:

  **Endpoint**:

  **PUT /audiencias/SetTagActivo?idAudienciaPersonaTag={idAudienciaPersonaTag}&activo=false**

`	`(postman: Eventos B2C-B2B-Completo\Quitar/Desactivar Tag)


De donde sale:

"tags": [],

Campos:

- id\_audiencia\_persona\_tag 
- tag\_tipo 
- tag\_valor 
- nombre\_mostrar 
- origen 
- activo 

Ejemplo de cómo se vería:

**Tags actuales**

[VIP]\
Tipo: CLASIFICACION\
Origen: MANUAL\
Acción: Quitar

[Origen Instagram]\
Tipo: ORIGEN\
Origen: AUTO

[Asistió]\
Tipo: ASISTENCIA\
Origen: AUTO

[Contactar]\
Tipo: ACCION\
Origen: MANUAL\
Acción: Quitar

Regla visual recomendada:

Tags manuales

- Mostrar con:
  - color más fuerte 
  - botón quitar 

Tags automáticos

- Mostrar con:
  - color más neutro 
  - sin botón quitar 

Así el usuario entiende rápido cuáles cargó él y cuáles puso el sistema.

***Sección: Agregar tag manual***

**Endpoint**:

**GET /audiencias/TagsSugeridos**

(postman: Eventos B2C-B2B-Completo\Tags Sugeridos)

Respuesta

[

`    `{

`        `"id\_param\_audiencia\_tag": 1,

`        `"tag\_tipo": "CLASIFICACION",

`        `"tag\_valor": "VIP",

`        `"nombre\_mostrar": "VIP",

`        `"descripcion": "Audiencia prioritaria o especial.",

`        `"origen": "MANUAL",

`        `"permite\_asignacion\_manual": **true**,

`        `"orden": 1,

`        `"activo": **true**

`    `},

`    `{

`        `"id\_param\_audiencia\_tag": 2,

`        `"tag\_tipo": "CLASIFICACION",

`        `"tag\_valor": "FRECUENTE",

`        `"nombre\_mostrar": "Frecuente",

`        `"descripcion": "Asiste o se registra con frecuencia.",

`        `"origen": "MANUAL",

`        `"permite\_asignacion\_manual": **true**,

`        `"orden": 2,

`        `"activo": **true**

`    `},

`    `{

`        `"id\_param\_audiencia\_tag": 3,

`        `"tag\_tipo": "CLASIFICACION",

`        `"tag\_valor": "CLIENTE\_VALIOSO",

`        `"nombre\_mostrar": "Cliente valioso",

`        `"descripcion": "Audiencia de alto valor comercial.",

`        `"origen": "MANUAL",

`        `"permite\_asignacion\_manual": **true**,

`        `"orden": 3,

`        `"activo": **true**

`    `},

`    `{

`        `"id\_param\_audiencia\_tag": 4,

`        `"tag\_tipo": "CLASIFICACION",

`        `"tag\_valor": "NO\_CONTACTAR",

`        `"nombre\_mostrar": "No contactar",

`        `"descripcion": "No incluir en acciones comerciales.",

`        `"origen": "MANUAL",

`        `"permite\_asignacion\_manual": **true**,

`        `"orden": 4,

`        `"activo": **true**

`    `},

`    `{

`        `"id\_param\_audiencia\_tag": 5,

`        `"tag\_tipo": "ACCION",

`        `"tag\_valor": "CONTACTAR",

`        `"nombre\_mostrar": "Contactar",

`        `"descripcion": "Requiere contacto manual o seguimiento.",

`        `"origen": "MANUAL",

`        `"permite\_asignacion\_manual": **true**,

`        `"orden": 10,

`        `"activo": **true**

`    `},

`    `{

`        `"id\_param\_audiencia\_tag": 6,

`        `"tag\_tipo": "ACCION",

`        `"tag\_valor": "INVITAR\_PROXIMO",

`        `"nombre\_mostrar": "Invitar próximo evento",

`        `"descripcion": "Candidato para próximas campañas.",

`        `"origen": "MANUAL",

`        `"permite\_asignacion\_manual": **true**,

`        `"orden": 11,

`        `"activo": **true**

`    `},

`    `{

`        `"id\_param\_audiencia\_tag": 7,

`        `"tag\_tipo": "ACCION",

`        `"tag\_valor": "REVISAR",

`        `"nombre\_mostrar": "Revisar",

`        `"descripcion": "Requiere revisión comercial.",

`        `"origen": "MANUAL",

`        `"permite\_asignacion\_manual": **true**,

`        `"orden": 12,

`        `"activo": **true**

`    `}

]

Campos formulario:

- Tipo de tag
  - tipo UI: combo 
  - obligatorio 
  - campo: tag\_tipo
- Tag
  - tipo UI: combo 
  - obligatorio
  - campo: nombre\_mostrar. El front debe filtrar los tags del response según el tipo seleccionado 
- Botón: 
  - **Agregar tag**

    **Endpoint:**

    **POST /audiencias/AgregarTag?idAudienciaPersona={idAudienciaPersona}**

`		`Ejemplo:

POST/audiencias/AgregarTag?idAudienciaPersona=3

`		`JSON:

{

`  `"tag\_tipo": "CLASIFICACION",

`  `"tag\_valor": "VIP"

}


**Página de registro público vs. Página de invitación**

No hay “una página única”.

Por una lado tenemos la landing de Eventia y por otro tenemos **dos tipos de páginas**, y se distinguen por el **contexto de acceso**.

1\. Página de Invitación

Cuándo aplica

Cuando el evento está configurado como:

- es\_publico = false 
- normalmente modo\_acceso = "I" 
- sea: por invitación 

Qué lógica usa

La persona entra porque recibió:

- un link o token de invitación 
- un token RSVP 
- un QR/token asociado a su invitación 

Qué muestra

- saludo / bienvenida 
- datos del evento 
- tramos que le corresponden 
- confirmación RSVP 
- eventualmente acompañantes 
- eventualmente restricciones alimentarias 
- eventualmente información personalizada 

*Acá la persona es un **invitado***

2\. Página de Registro Público

Cuándo aplica

Cuando el evento está configurado como:

- es\_publico = true 
- y además el acceso viene por una campaña/link público.

Qué lógica usa

La persona entra desde:

- Instagram 
- QR en barra 
- WhatsApp 
- influencers 
- lista VIP pública 
- etc. 

Qué muestra

- título de campaña 
- leyenda pública 
- beneficio 
- formulario de registro 
- mensaje post registro 

Acá la persona no es un invitado tradicional, es una **persona captada / audiencia del evento**

Esta landing se resuelve por:

- token de ef\_evento\_acceso\_links 


3\. Cómo distinguir cuál abrir

La URL o el identificador de entrada ya dice qué tipo de página es.

A. Si entra por token de invitación / RSVP:

- abrir: página privada de invitado

B. Si entra por token de campaña de captación:

- abrir: página de registro o captación pública de audiencia

4\. No resolverlo sólo con es\_publico

Importante: porque es\_publico te dice el tipo de evento, pero **no necesariamente el tipo de link que llegó al usuario**.

La distinción más sólida es: según el token / endpoint que se consulta

5\. Qué pasa si un evento público también tiene invitados

Eso puede pasar, y no rompe nada.

Por ejemplo:

- el tardeo del Quincho es público 
- pero además tienen una lista cerrada VIP 

Entonces el mismo evento puede tener:

- página de invitación privada para invitados VIP o lista cerrada
- página de invitación pública para la captación general

O sea la página de invitación no depende solo del evento, depende del tipo de acceso con el que entra la persona
#
5\. No preguntar primero “¿el evento es público o privado?”

Primero preguntar:

¿Con qué token o ruta entró la persona?

- Si entró por link de invitación: abrir flujo invitado
- Si entró por link de campaña: abrir flujo audiencia

|**Aspecto**|**Página invitación privada**|**Página invitación pública**|
| :- | :- | :- |
|**Cuándo aplica**|Evento privado, normalmente por invitación|Evento público con captación|
|**Cómo llega la persona**|Link/token de invitación o RSVP|Link/token de campaña de captación|
|**Quién es la persona en el sistema**|Invitado|Audiencia / persona captada|
|**Concepto principal**|Confirmar asistencia|Registrarse al evento|
|**Tipo de token**|Token de invitado / RSVP|Token de campaña (ef\_evento\_acceso\_links.token)|
|**Qué abre el front**|Pantalla de invitado|Pantalla de registro público|
|**Qué endpoint consulta primero**|Endpoint de landing de invitado / RSVP|GET /evento\_captacion\_links/Landing?token=...|
|**Qué formulario muestra**|Formulario de confirmación / RSVP|Formulario de captación / registro|
|**Qué guarda**|Respuesta de asistencia, acompañantes, restricciones, etc.|Datos de persona, intereses, preferencias, consentimientos, audiencia, beneficio|
|**Qué tablas toca principalmente**|ef\_invitados, ef\_rsvp\_grupos, ef\_rsvp\_grupo\_integrantes, relacionadas de RSVP|ef\_evento\_acceso\_links, ef\_invitados, ef\_invitados\_perfiles, ef\_audiencias\_personas, ef\_audiencia\_persona\_eventos, ef\_evento\_beneficios\_registro|
|**Qué lógica de negocio resuelve**|Gestión de invitados|Captación + audiencia + asistencia|
|**Puede existir en el mismo evento**|Sí|Sí|




**Registros manuales**

Tab Control de Ingreso

Tener 2 secciones

- 1.Escanear Entrada: flujo normal
- 2.Búsqueda Manual: flujo de contingencia

Agregar:

- Botón Buscar persona

2\.Búsqueda Manual

Campos de  búsqueda:

- nombre 
- apellido 
- email 
- celular 
- Botón Buscar:

Endpoint

GET /audiencias/BuscarRegistrado?idEvento={idEvento}&query={texto}

Ejemplo

GET /audiencias/BuscarRegistrado?idEvento=27&query=juan cruz

`	`Respuesta:

{

`        `"id\_invitado": 139,

`        `"nombre": "Juan Cruz",

`        `"apellido": "Garcia",

`        `"email": "juancruz@framedigital.studio",

`        `"celular": "2235789917",

`        `"id\_acceso": 48,

`        `"acceso\_nombre": "Lista con beneficio",

`        `"id\_acceso\_link": 13,

`        `"origen\_registro": "VIP",

`        `"asistio": false,

`        `"beneficio\_otorgado": true,

`        `"beneficio\_canjeado": false,

`        `"campania": "Lista VIP"

`    `}

El resultado se muestra en una grilla con los campos:

- nombre 
- apellido 
- email
- celular
- acceso 
- origen/campaña 
- asistió 
- beneficio otorgado
- beneficio canjeado
- acción:
  - Registrar Ingreso Manual

    Endpoint:

    POST /evento\_checkins

    JSON:

{

`  `"id\_evento": 27,

`  `"id\_invitado": 139,

`  `"id\_acceso": 48,

`  `"id\_acceso\_link": 13,

`  `"tipo": "INGRESO",

`  `"observaciones": "Ingreso manual sin QR"

}

Respuesta

{

`    `"ok": true,

`    `"id\_checkin": 10

}

El backend guarda

- tipo = "INGRESO" o "REINGRESO" 
- observaciones = "Registro manual sin QR" 

Después del ingreso manual

Si la persona tiene:

- beneficio\_otorgado = true 
- beneficio\_canjeado = false 

entonces debería visualizarse en un tab específico:

Tab Beneficios Pendientes Manual

Endpoint

`	`GET /audiencias/GetPendientesManualBeneficio?idEvento={idEvento}
#
Muestra sólo personas que:

- ya asistieron 
- tienen beneficio pendiente 
- fueron marcadas manualmente

Grilla:

- nombre 
- apellido 
- celular 
- campaña 
- beneficio 
- fecha ingreso 
- observación ingreso 
- estado beneficio 
- acción
  - Marcar beneficio entregado manualmente 

    Endpoint:

`	`POST /evento\_beneficios\_registro/Canjear?idBeneficioRegistro={idBeneficioRegistro}&observaciones=Canje%20manual%20sin%20QR

Ejemplo

POST /evento\_beneficios\_registro/Canjear?idBeneficioRegistro=5&observaciones=Canje%20manual%20sin%20QR

Respuesta

{

`    `"ok": true

}

