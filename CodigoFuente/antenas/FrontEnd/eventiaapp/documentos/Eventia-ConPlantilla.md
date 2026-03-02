# Eventia \- Crear Evento con Plantillas

Conceptos 

- __Tramos__ = agenda/partes del evento en el tiempo \(cada tramo puede tener su propia direcci├│n/horario\)\.
- __Accesos__ = tipos de invitaci├│n \(qu├® combinaci├│n de tramos ve/puede confirmar un invitado\)\.
- __Relaciones accesoÔÇôtramo__ = matriz que define ÔÇ£este acceso incluye estos tramosÔÇØ\. 

__1\) Qu├® son los ÔÇ£TRAMOSÔÇØ__

__Tramos = partes del evento en el tiempo\.__  
Ejemplo boda:

- Tramo 1: Iglesia \(19:00\)
- Tramo 2: Cena \(21:00\)
- Tramo 3: Fiesta \(23:00\)

Cada tramo puede tener:

- hora inicio/fin
- lugar/direcci├│n \(puede ser distinta\)
- leyenda/nota visible \(ÔÇ£llegar 15 min antesÔÇØ\)

Esto es lo que el invitado ve como ÔÇ£agendaÔÇØ del evento\.

__2\) Qu├® son los ÔÇ£ACCESOSÔÇØ__

__Accesos = tipos de invitaci├│n\.__  
Es __ÔÇ£a qu├® partes est├í invitada esta personaÔÇØ__\.

Ejemplo de boda:

- Acceso A: ÔÇ£Solo IglesiaÔÇØ
- Acceso B: ÔÇ£Iglesia \+ Cena \+ FiestaÔÇØ \(el cl├ísico\)
- Acceso C: ÔÇ£Cena \+ FiestaÔÇØ
- Acceso D: ÔÇ£Solo FiestaÔÇØ

Cuando invitamos a alguien, le asignamos un acceso\.  
Ese acceso define autom├íticamente qu├® tramos puede ver/confirmar\.

Resumiendo:

- Tramos = agenda del evento  
Accesos = qui├®n est├í invitado a qu├® parte de esa agenda

__3\) Qu├® es la tabla ÔÇ£acceso\_tramosÔÇØ__

Es el ÔÇ£mapaÔÇØ que dice este acceso incluye este tramo

Ejemplo \(boda\):

- Acceso ÔÇ£Solo IglesiaÔÇØ incluye tramo ÔÇ£IglesiaÔÇØ
- Acceso ÔÇ£Cena \+ FiestaÔÇØ incluye tramo ÔÇ£CenaÔÇØ y ÔÇ£FiestaÔÇØ
- Acceso ÔÇ£Iglesia \+ Cena \+ FiestaÔÇØ incluye los 3

Esto permite que el front pueda mostrar un ÔÇ£checklistÔÇØ:  
Ô£à Iglesia / Ô£à Cena / Ô£à Fiesta

A continuaci├│n se listan los pasos a seguir cuando se crea un evento para cuyo tipo evento existen plantillas o al menos existe una plantilla que le cuadra al usuario:

__POST/auth/login__

__Paso 1\-Crea Evento Base:__

__Pantalla 1: Crea tu Evento__

__UI \(campos que debe pedir\)__

- Idioma \(obligatorio\-dropdown\)
- Tipo de evento \(obligatorio\-dropdown\): ejemplo: __Boda GET /tipos\_evento/GetAll?idIdioma=2__
- Anfitriones \(obligatorio\)
- Saludo  \(opcional\)
- Mensaje bienvenida \(opcional\)
- Dress code \(opcional\-dropdown\)  __GET /dress\_code/GetAll?idIdioma=2__
- Notas \(opcional\)

Bot├│n: __Continuar__

__Endpoint__:

__POST /eventos__

Body \(ejemplo m├¡nimo para Boda\):

\{  
"idTipoEvento": 3,  
"idIdioma": 1,  
"anfitrionesTexto": "Luisa y Pablo",  
"saludo": "Bienvenidos a nuestra boda",  
"mensajeBienvenida": "Gracias por acompa├▒arnos en este d├¡a tan especial",  
"notas": "Boda prueba"  
\}

__Backend responde__

\{

┬á ┬á "idEvento": 8,

┬á ┬á "idTipoEvento": 3,

┬á ┬á "idIdioma": 1,

┬á ┬á "anfitrionesTexto": "Luisa y Pablo",

┬á ┬á "estado": "B",

┬á ┬á "fechaAlta": "2026\-02\-19T22:00:04\.1957668\+00:00"

\}

El front guarda idEvento=8\.

__Paso 2\-Mostrar plantillas disponibles para ese tipo de evento:__

__Objetivo:__ que el usuario elija ÔÇ£la estructuraÔÇØ que va a tener el evento \(agenda \+ tipos de invitaci├│n\)\.

__Endpoint:__

__GET /plantillas\_evento/GetByTipo?idTipoEvento=3&activo=true__

__Backend responde \(ejemplo\)__

\[

┬á ┬á \{

┬á ┬á ┬á ┬á "id\_plantilla": 2,

┬á ┬á ┬á ┬á "codigo": "BODA\_IGLESIA\_CENA\_FIESTA",

┬á ┬á ┬á ┬á "activo": __true__,

┬á ┬á ┬á ┬á "id\_tipo\_evento": 3,

┬á ┬á ┬á ┬á "tramos": \[\],

┬á ┬á ┬á ┬á "accesos": \[\],

┬á ┬á ┬á ┬á "tipo\_evento": __null__

┬á ┬á \},

┬á ┬á \{

┬á ┬á ┬á ┬á "id\_plantilla": 3,

┬á ┬á ┬á ┬á "codigo": "BODA\_CIVIL\_ALMUERZO",

┬á ┬á ┬á ┬á "activo": __true__,

┬á ┬á ┬á ┬á "id\_tipo\_evento": 3,

┬á ┬á ┬á ┬á "tramos": \[\],

┬á ┬á ┬á ┬á "accesos": \[\],

┬á ┬á ┬á ┬á "tipo\_evento": __null__

┬á ┬á \}

\]

__Pantalla 2: Eleg├¡ una estructura para tu evento__  
__UI:__

Subt├¡tulo: Despu├®s vas a poder editar horarios, lugares y accesos

Mostrar Cards de las plantillas para el tipo de evento seleccionado\.

Cada Card muestra:

- Nombre \(o t├¡tulo\): detalle\.nombre
- Descripci├│n: ÔÇ£Incluye: Iglesia \- Cena \- FiestaÔÇØ
- Footer: ÔÇ£Accesos: 4 opcionesÔÇØ
- Bot├│n de la card __Usar esta estructura __o un radio button en cada card \(pero si se pone un radio button al final de las cards tiene que haber un bot├│n Usar la estructura seleccionada\)

__Endpoint__ para detalle de cada card:

__GET /plantillas\_evento/\{idPlantilla\}/Detalle__

Devuelve:

\{

┬á ┬á "id\_plantilla": 2,

┬á ┬á "id\_tipo\_evento": 3,

┬á ┬á "codigo": "BODA\_IGLESIA\_CENA\_FIESTA",

┬á ┬á "nombre": "Boda Iglesia Cena Fiesta",

┬á ┬á "activo": __true__,

┬á ┬á "tramos": \[

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 2,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo\_tipo": 1,

┬á ┬á ┬á ┬á ┬á ┬á "nombre\_default": "Iglesia",

┬á ┬á ┬á ┬á ┬á ┬á "leyenda\_default": "Ceremonia religiosa ┬À llegar 15 minutos antes",

┬á ┬á ┬á ┬á ┬á ┬á "orden": 1,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 3,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo\_tipo": 3,

┬á ┬á ┬á ┬á ┬á ┬á "nombre\_default": "Cena",

┬á ┬á ┬á ┬á ┬á ┬á "leyenda\_default": "Recepci├│n y cena formal",

┬á ┬á ┬á ┬á ┬á ┬á "orden": 2,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 4,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo\_tipo": 5,

┬á ┬á ┬á ┬á ┬á ┬á "nombre\_default": "Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "leyenda\_default": "Barra libre y pista de baile",

┬á ┬á ┬á ┬á ┬á ┬á "orden": 3,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \}

┬á ┬á \],

┬á ┬á "accesos": \[

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 2,

┬á ┬á ┬á ┬á ┬á ┬á "nombre\_default": "Iglesia",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp\_default": "Gracias por acompa├▒arnos en la ceremonia ­ƒÆø",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico\_default": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 1,

┬á ┬á ┬á ┬á ┬á ┬á "es\_default": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 3,

┬á ┬á ┬á ┬á ┬á ┬á "nombre\_default": "Iglesia \+ Cena \+ Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp\_default": "Te esperamos para compartir este d├¡a completo con nosotros Ô£¿",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico\_default": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 2,

┬á ┬á ┬á ┬á ┬á ┬á "es\_default": __true__,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 4,

┬á ┬á ┬á ┬á ┬á ┬á "nombre\_default": "Cena \+ Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp\_default": "Te esperamos desde la recepci├│n para celebrar juntos ­ƒÄë",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico\_default": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 3,

┬á ┬á ┬á ┬á ┬á ┬á "es\_default": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 5,

┬á ┬á ┬á ┬á ┬á ┬á "nombre\_default": "Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp\_default": "Te esperamos en la fiesta ­ƒÄë",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico\_default": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 4,

┬á ┬á ┬á ┬á ┬á ┬á "es\_default": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \}

┬á ┬á \],

┬á ┬á "relaciones": \[

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 2,

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 2

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 3,

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 2

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 3,

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 3

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 3,

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 4

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 4,

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 3

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 4,

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 4

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_acceso": 5,

┬á ┬á ┬á ┬á ┬á ┬á "id\_plantilla\_tramo": 4

┬á ┬á ┬á ┬á \}

┬á ┬á \],

┬á ┬á "tramos\_count": 3,

┬á ┬á "accesos\_count": 4

\}

Debajo de las cards debe haber un bot├│n __Voy a crear la estructura de mi evento / No encontr├® la estructura que se adapte a mi evento\. Es el mismo bot├│n que cambia de etiqueta de acuerdo a:__

- Si GetByTipo devuelve __vac├¡o__: bot├│n secundario __ÔÇ£Voy a crear la estructura de mi eventoÔÇØ__
- Si devuelve __con opciones__: bot├│n secundario __ÔÇ£No encontr├® la estructura que se adapte a mi eventoÔÇØ__

\(Al hacer click, redirige al wizard manual que est├í documentado en el otro documento; en esta pantalla s├│lo mostrar el bot├│n\)

Usuario elige por ejemplo la card 1, haciendo clic en __Usar esta estructura __de la card 1 \(si se implement├│ bot├│n\)

__Paso 3\- Antes de aplicar plantilla, pedir ÔÇ£Fecha baseÔÇØ y \(opcional\) Ubicaci├│n base__

Luego de elegir una plantilla \(desde una card\):

Se abre un mini formulario o pantalla: 

__Pantalla 3: Datos base para inicializar el evento__

Subt├¡tulo: Usaremos estos datos como base para todos los tramos\. Luego vas a poder editarlos tramo por tramo\.

- Fecha y Hora de inicio: fecha\_base \(obligatoria\)
- Lugar \(opcional\): lugar\_base
- Direcci├│n \(opcional\): direccion\_base
- Latitud / Longitud \(opcionales\): latitud\_base / longitud\_base  


Bot├│n __Aplicar plantilla__

__Paso 4\- Aplicar la plantilla elegida al evento__

Al hacer clic en el bot├│n __Aplicar plantilla__

Llama al __endpoint__:

__POST /eventos\_plantillas/Aplicar?idEvento=8__

\(dej├® el endpoint en la carpeta ÔÇ£Evento \- Tramos \- Accesos \- Relaciones \(con Plantilla\)ÔÇØ\)

Esto es solo un __default__ para que los tramos no nazcan vac├¡os\.

Body \(ejemplo para plantilla 2: Iglesia \+ Cena \+ Fiesta\):

\{

  "id\_plantilla": 2,

  "borrar\_existente": true,

  "fecha\_base": "2026\-11\-22T19:00:00\-03:00",

  "lugar\_base": "Estancia Santa Clara",

  "direccion\_base": "Ruta 2 Km 395",

  "latitud\_base": \-37\.995100,

  "longitud\_base": \-57\.573400

\}

Backend autom├íticamente:

- crea los tramos del evento \(Iglesia, Cena, Fiesta\)
- crea los accesos del evento \(Solo Iglesia, Completo, etc\.\)
- crea la matriz acceso\-tramo
- setea id\_acceso\_default en el evento

Backend responde

\{ "ok": true \}

__Paso 5\- Cargar estructura completa para la pantalla editor__

__Endpoint__:

__GET /eventos\_plantillas/Estructura?idEvento=8__

\(dej├® el endpoint en la carpeta ÔÇ£Evento \- Tramos \- Accesos \- Relaciones \(con Plantilla\)ÔÇØ\)

Backend devuelve

\{

┬á ┬á "id\_evento": 8,

┬á ┬á "id\_acceso\_default": 10,

┬á ┬á "tramos": \[

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 7,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo\_tipo": 1,

┬á ┬á ┬á ┬á ┬á ┬á "nombre": "Iglesia",

┬á ┬á ┬á ┬á ┬á ┬á "leyenda\_visible": "Ceremonia religiosa ┬À llegar 15 minutos antes",

┬á ┬á ┬á ┬á ┬á ┬á "notas\_internas": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "fecha\_hora\_inicio": "2026\-11\-22T22:00:00\+00:00",

┬á ┬á ┬á ┬á ┬á ┬á "fecha\_hora\_fin": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "lugar": "Estancia Santa Clara",

┬á ┬á ┬á ┬á ┬á ┬á "direccion": "Ruta 2 Km 395",

┬á ┬á ┬á ┬á ┬á ┬á "latitud": \-37\.995100,

┬á ┬á ┬á ┬á ┬á ┬á "longitud": \-57\.573400,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 1,

┬á ┬á ┬á ┬á ┬á ┬á "cupo": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 8,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo\_tipo": 3,

┬á ┬á ┬á ┬á ┬á ┬á "nombre": "Cena",

┬á ┬á ┬á ┬á ┬á ┬á "leyenda\_visible": "Recepci├│n y cena formal",

┬á ┬á ┬á ┬á ┬á ┬á "notas\_internas": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "fecha\_hora\_inicio": "2026\-11\-22T22:00:00\+00:00",

┬á ┬á ┬á ┬á ┬á ┬á "fecha\_hora\_fin": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "lugar": "Estancia Santa Clara",

┬á ┬á ┬á ┬á ┬á ┬á "direccion": "Ruta 2 Km 395",

┬á ┬á ┬á ┬á ┬á ┬á "latitud": \-37\.995100,

┬á ┬á ┬á ┬á ┬á ┬á "longitud": \-57\.573400,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 2,

┬á ┬á ┬á ┬á ┬á ┬á "cupo": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 9,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo\_tipo": 5,

┬á ┬á ┬á ┬á ┬á ┬á "nombre": "Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "leyenda\_visible": "Barra libre y pista de baile",

┬á ┬á ┬á ┬á ┬á ┬á "notas\_internas": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "fecha\_hora\_inicio": "2026\-11\-22T22:00:00\+00:00",

┬á ┬á ┬á ┬á ┬á ┬á "fecha\_hora\_fin": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "lugar": "Estancia Santa Clara",

┬á ┬á ┬á ┬á ┬á ┬á "direccion": "Ruta 2 Km 395",

┬á ┬á ┬á ┬á ┬á ┬á "latitud": \-37\.995100,

┬á ┬á ┬á ┬á ┬á ┬á "longitud": \-57\.573400,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 3,

┬á ┬á ┬á ┬á ┬á ┬á "cupo": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \}

┬á ┬á \],

┬á ┬á "accesos": \[

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 9,

┬á ┬á ┬á ┬á ┬á ┬á "nombre": "Iglesia",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp": "Gracias por acompa├▒arnos en la ceremonia ­ƒÆø",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "cupo": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "precio": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 1,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 10,

┬á ┬á ┬á ┬á ┬á ┬á "nombre": "Iglesia \+ Cena \+ Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp": "Te esperamos para compartir este d├¡a completo con nosotros Ô£¿",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "cupo": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "precio": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 2,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 11,

┬á ┬á ┬á ┬á ┬á ┬á "nombre": "Cena \+ Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp": "Te esperamos desde la recepci├│n para celebrar juntos ­ƒÄë",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "cupo": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "precio": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 3,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 12,

┬á ┬á ┬á ┬á ┬á ┬á "nombre": "Fiesta",

┬á ┬á ┬á ┬á ┬á ┬á "mensaje\_rsvp": "Te esperamos en la fiesta ­ƒÄë",

┬á ┬á ┬á ┬á ┬á ┬á "es\_publico": __false__,

┬á ┬á ┬á ┬á ┬á ┬á "cupo": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "precio": __null__,

┬á ┬á ┬á ┬á ┬á ┬á "orden": 4,

┬á ┬á ┬á ┬á ┬á ┬á "activo": __true__

┬á ┬á ┬á ┬á \}

┬á ┬á \],

┬á ┬á "relaciones": \[

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 9,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 7

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 10,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 7

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 10,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 8

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 10,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 9

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 11,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 8

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 11,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 9

┬á ┬á ┬á ┬á \},

┬á ┬á ┬á ┬á \{

┬á ┬á ┬á ┬á ┬á ┬á "id\_acceso": 12,

┬á ┬á ┬á ┬á ┬á ┬á "id\_tramo": 9

┬á ┬á ┬á ┬á \}

┬á ┬á \]

\}

Esto va a alimentar todo el editor\.

__Paso 6\- Pantalla Editor \(3 tabs o pasos\) __

Tab 1: Agenda / Tramos

- Mostrar lista de tramos tipo cards, una card por tramo
- No se permiten agregar tramos ya que vino de una plantilla \(s├│lo editar\)
- Cada card tiene su bot├│n Guardar, es decir se guarda de a un tramo

1\- Iglesia

- Nombre \(editable\)
- Fecha/Hora inicio \(editable\)
- Fecha/Hora fin \(opcional\)
- Lugar, Direcci├│n, Lat/Long \(editable\)
- Leyenda visible \(editable\)
- Orden \(editable\)
- Activo \(true/false\)
- __Guardar __\(llama al endpoint siguiente\)

__Endpoint__:

__PUT /evento\_tramos/\{idTramo\}__

\(dej├® el endpoint en la carpeta ÔÇ£Evento \- Tramos \- Accesos \- Relaciones \(con Plantilla\)ÔÇØ\)

Ejemplo json:

\{

┬á "id\_tramo": 7,

┬á "id\_evento": 8,

┬á "id\_tramo\_tipo": 1,

┬á "nombre": "Iglesia \(Parroquia San Jos├®\)",

┬á "leyenda\_visible": "Llegar 20 minutos antes ┬À estacionamiento en el lateral",

┬á "notas\_internas": __null__,

┬á "fecha\_hora\_inicio": "2026\-11\-22T19:00:00\-03:00",

┬á "fecha\_hora\_fin": __null__,

┬á "lugar": "Parroquia San Jos├®",

┬á "direccion": "Calle 123, Mar del Plata",

┬á "latitud": \-38\.005500,

┬á "longitud": \-57\.542600,

┬á "orden": 1,

┬á "cupo": __null__,

┬á "activo": __true__

\}

2\- Cena

Idem tramo 1

Con su bot├│n Guardar

3\-Fiesta

Idem tramo 1

Con su bot├│n Guardar

Tab 2: Accesos / Tipos de invitaci├│n

- Mostrar lista de accesos tipo cards\.
- Cada card o acceso tiene su bot├│n Guardar
- No se permite agregar \(si vino de plantilla\), s├│lo editar los siguientes datos:

Acceso 1 \- Iglesia

- Nombre
- Mensaje RSVP
- Cupo \(por ahora oculto\)
- Precio \(por ahora oculto\)
- Es p├║blico \(por ahora oculto\)
- Orden
- Activo
- Marcar ÔÇ£DefaultÔÇØ \(uno solo ÔÇô radio button\)
- Bot├│n __Guardar __\(llama al endpoint siguiente\)

__Endpoint__:

__PUT /evento\_accesos/\{idAcceso\}__ \(uno por cada acceso\)

\(dej├® el endpoint en la carpeta ÔÇ£Evento \- Tramos \- Accesos \- Relaciones \(con Plantilla\)ÔÇØ\)

Acceso 2 ÔÇô Iglesia \+ Cena \+ Fiesta

Idem Acceso 1

Con su bot├│n Guardar

Acceso 3: Cena \+ Fiesta

Idem Acceso 1

Con su bot├│n Guardar

Acceso 4 ÔÇô Fiesta

Idem Acceso 1

Con su bot├│n Guardar

Para el Acceso Default:

Adem├ís hay que setear el default\. No lo hacemos ÔÇ£impl├¡citoÔÇØ editando el acceso, ya que con el siguiente endpoint actualizamos ef\_eventos\.id\_acceso\_default\. Le mandamos el id que el usuario marc├│ como default en el radio button\.

Estar├¡a bueno pintar o resaltar la card que se marc├│ como ÔÇ£defaultÔÇØ\.

Con esta condici├│n:

Checked si acceso\.id\_acceso === estructura\.id\_acceso\_default

Ejemplo: si id\_acceso\_default = 10, la card cuyo id\_acceso = 10 aparece seleccionada\.

__Endpoint__:

__PUT__ __/eventos/\{idEvento\}/acceso\-default?idAcceso=11__

\(dej├® el endpoint en la carpeta ÔÇ£Evento \- Tramos \- Accesos \- Relaciones \(con Plantilla\)ÔÇØ\)

__Backend responde:__

\{

┬á ┬á "ok": __true__,

┬á ┬á "id\_evento": 8,

┬á ┬á "id\_acceso\_default": 11

\}

Tab 3: Matriz ÔÇ£Qu├® incluye cada tipo de Invitaci├│n?ÔÇØ

Una grilla tipo:

Acceso \\ Tramo

Iglesia

Cena

Fiesta

Iglesia

Ô£à

Iglesia \+ Cena \+ Fiesta \(default\)

Ô£à

Ô£à

Ô£à

Cena \+ Fiesta

Ô£à

Ô£à

Fiesta

Ô£à

- Columnas = tramos \(ordenados por orden\)
- Filas = accesos \(ordenados por orden\)
- Checkbox tildado si existe relaci├│n \{idAcceso, idTramo\} en ef\_evento\_acceso\_tramos

Con qu├® datos se arma:

__Endpoint__:

__GET__ __/eventos\_plantillas/Estructura?idEvento=8__

El front recibe:

- tramos\[\] con \{ idTramo, nombre, orden \}
- accesos\[\] con \{ idAcceso, nombre, orden \}
- relaciones\[\] con pares \{ idAcceso, idTramo \}

C├│mo el front decide si tilda un checkbox:

Para cada celda \(acceso, tramo\):

- est├í tildado si relaciones contiene \{idAcceso, idTramo\}

__┬┐Qu├® ve el invitado cuando entra?__

Si tiene acceso "Cena \+ Fiesta":

Pantalla invitado:

__Mar├¡a y Lucas__

­ƒôà 22 Noviembre 2026

Tu invitaci├│n incluye:

Cena \(21:00\)

Fiesta \(23:00\)

Dress code: Elegante

Bot├│n: Confirmar asistencia

No ve Iglesia\.  
No sabe si exist├¡a\.

