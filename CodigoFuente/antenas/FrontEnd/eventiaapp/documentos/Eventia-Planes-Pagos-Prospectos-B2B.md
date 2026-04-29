# Eventia – Planes – Pagos – Prospectos – B2B

Concepto definitivo: 

- **El plan NO va “en el usuario”, va en un “evento o cuenta” (lo llamamos scope)**
- Hoy el scope principal es **EVENTO** (B2C).
- En próxima fase será **CUENTA/ORGANIZACIÓN** (B2B salón/empresa).
- Ya tenemos creada ef\_suscripciones con scope (EVENTO/CUENTA) y ef\_scope\_addons con scope. Ese va a ser el puente para no hacer cambios después.

Entonces:

- B2C → plan asociado a EVENTO
- B2B → plan asociado a CUENTA


**1. Identificar Tipo Usuario**

**1.1. Desde el register del header:**

Objetivo

Resolver la intención inicial de un **usuario nuevo** que se registra desde el acceso genérico del header, distinguiendo si quiere comenzar como usuario B2C o como cuenta B2B.

Alcance

Este comportamiento aplica únicamente cuando:

- el usuario accede a **Registrarme** desde el header 
- y todavía **no existe** en el sistema 

No aplica a:

- usuarios ya existentes 
- login 
- usuarios autenticados

Pantalla de registro

En el formulario de registro desde el header, además de los campos habituales:

- email 
- password 
- nombre 
- apellido 

se mostrará un campo adicional:

**¿Cómo querés empezar en Eventia?** 

- combo
- obligatorio
- opciones:
- **Quiero crear mi evento** (B2C)
- **Tengo un salón, planner o empresa** (B2B)

Se podría poner un texto de ayuda abajo del combo, algo corto, como por ejemplo: Podrás usar ambas opciones más adelante con el mismo usuario.

Eso evita que la gente piense que está eligiendo “un tipo de cuenta irreversible”.

La opción elegida no define todavía permisos ni crea cuenta o evento automáticamente.\
Solo define el **flow inicial** del usuario nuevo.

El front debe guardar este valor como:

- **flow = "b2c"** 
- **flow = "b2b"** 

Este flow se usará únicamente para orientar la navegación inicial luego del registro y login.
##
## Relación con /auth/me
Luego del registro/login, el front debe consultar /auth/me.

La navegación final debe resultar de combinar:

- el flow elegido en registro 
- el contexto real del usuario devuelto por backend 


**1.2. En la landing (ejemplo):**

Tu Evento organizado en un solo lugar

Lleva a login/register

Lleva a login/register


![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.001.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.002.png)Plantillas + RSVP+ invitados + experiencias (música, álbum, votaciones)

Crear mi Evento

Tenés una Empresa, Salón u organizás eventos?
![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.003.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.004.png)

Abre popup para capturar info Prospectos

![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.005.png)

Ver planes

Quiero Info Planes planes

Ver planes
![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.006.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.007.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.008.png)

Scroll a Planes B2B

Scroll a Planes B2C


![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.009.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.010.png)** 

Cómo funciona Eventia:

Elegí tipo de evento + plantilla

Cargá invitados y confirmaciones (RSVP)

“Viví el evento: música, álbum, momentos, etc.”

Demo visual (capturas o mockups)

- screenshot de una invitación
- screenshot del panel del organizador
- screenshot de RSVP

Módulos estrella (cards)

- Invitación + RSVP
- Segmentos / accesos
- Música (sugerencias/votos)
- Álbum colaborativo con QR
- Votaciones y momentos 

Combo “para mi evento” por default. Cambia la opción y se renderizan las cards

![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.011.png)Planes (B2C)

Para mi Evento

**Pro**

**Premium completo**\
**Precio:** desde $X (por evento)

- Todo lo de Plus
- Módulos live (votaciones en vivo / momentos) 
- Control avanzado (check-in, QR, etc.) 


Recomendado

**Plus**

**Interacción + recuerdos**\
**Precio:** desde $X (por evento)

- Todo lo de Basic
- Álbum colaborativo / recuerdos 
- Encuestas/votaciones pre-evento 

**Basic**

**Evento ordenado**\
**Precio:** desde $X (por evento)

- Plantillas + configuración completa del evento
- Invitaciones y confirmaciones (RSVP)
- Logística del evento (regalos / hospedaje / transporte)

**Free**

**Prueba 7 días**\
**$0** (trial)

- Probá la plataforma y configurá tu evento con plantillas
- Cargá invitados manualmente (límite del plan)
- Acceso a módulos básicos para testear


![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.012.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.013.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.014.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.015.png)







![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.016.png)


Elegir Pro

Elegir Plus

Elegir Basic

Elegir Free
![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.017.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.018.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.019.png)![](Aspose.Words.83acc2ba-f4a3-4709-b1a0-a8a40ac2c76a.020.png)


*Podés empezar gratis y actualizar cuando lo necesites. Si elegís un plan pago, el evento queda configurado pero la publicación/invitaciones se habilitan al registrar el pago.*

En cada card:

- lo que incluye
- precio por evento

**Endpoint para armar las cards**:

**GET /planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=B2C**

(postman: Landing\Mostrar Planes)

Cada card tiene debajo un botón “Elegir” que lleva a

**/registrarse?flow=b2c&plan=<codigo>**

B2B - Si es salón/empresa:

Card 1 — Starter

**Starter – Operación base**\
**Precio:** desde $X/mes

- Gestión de múltiples eventos
- Plantillas y flujos para equipos
- Soporte y operación básica

Card 2 — Team

**Team – Equipo + módulos premium**\
**Precio:** desde $X/mes

- Usuarios de staff
- Módulos premium incluidos
- Reportes operativos *(si aplica)*

Card 3 — Premium

**Premium – Marca blanca + full**\
**Precio:** desde $X/mes

- Branding / marca blanca
- Dominio personalizado
- Analítica y reportes avanzados

**Planes B2B (no va a llevar a ningún lado porque los planes los manejaremos manualmente)**


**B2C**

Hay 2 caminos para que el usuario seleccione un plan:

1. Desde la landing
1. Directamente se registra (o inicia sesión si está registrado) y crea un evento

1\.  Desde la landing

Resumen:

El usuario selecciona un plan, y el sistema lo redirecciona al form de login (se registra si es nuevo o inicia sesión si ya es usuario)

Al crear evento, ya por defecto viene seleccionado en el combo el plan que había seleccionado en la landing

Si seleccionó el plan free, el evento queda trial

Si seleccionó otro tipo de plan diferente al free, el evento queda en un estado pendiente de pago, y cuando se registre el pago el superadmin registrará el pago y se cambiará el estado del evento para que pueda continuar con la funcionalidad bloqueada.

**1. Landing / Ver planes**

Para B2C:

- GET /planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=B2C

Para B2B:

- GET /planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=B2B

Y el front renderiza.

**Landing** 

**Planes B2C**

- Cada card lleva a: **/registrarse?flow=b2c&plan=B2C\_PRO** (o B2C\_FREE/ B2C\_BASIC/ B2C\_PLUS/ B2C\_PRO).
  - Free → **/registrarse?flow=b2c&plan=B2C\_FREE**
  - Basic → **/registrarse?flow=b2c&plan=B2C\_BASIC**
  - Plus → **/registrarse?flow=b2c&plan=B2C\_PLUS**
  - Pro → **/registrarse?flow=b2c&plan=B2C\_PRO**
    - El **front** guarda plan para preseleccionarlo cuando cree el evento:
      - preferredPlan="B2C\_PRO"
      - postLoginFlow="b2c"

**2. Registro/Login**

- Después de login, el usuario va a /eventos/nuevo.

**3. Nuevo evento**

- En el formulario el Combo Plan viene preseleccionado con el plan de la landing (preferredPlan)
- Usuario completa el formulario y crea el evento (POST /eventos).

**Endpoint:**

**POST /eventos**

Ejemplo:

{\
"id\_tipo\_evento": 3,\
"id\_idioma": 1,\
"anfitriones\_texto": "Sol y Rodri",\
"id\_dress\_code": null,\
"dress\_code\_descripcion": null,\
"saludo": "¡Nos casamos!",\
"mensaje\_bienvenida": "Gracias por acompañarnos",\
"notas": null,\
"codigo\_plan": "B2C\_PRO"\
}

Respuesta:

{

`    `"idEvento": 18,

`    `"idTipoEvento": 3,

`    `"tipoEventoCodigo": "WEDDING",

`    `"tipoEventoDescripcion": "Boda",

`    `"idIdioma": 1,

`    `"anfitrionesTexto": "Sol y Rodri",

`    `"estado": "P",

`    `"fechaAlta": "2026-03-19T18:34:05.818246+00:00",

`    `"idDressCode": **null**,

`    `"dressCodeDescripcion": **null**,

`    `"dressCodeTexto": **null**,

`    `"saludo": "¡Nos casamos!",

`    `"mensajeBienvenida": "Gracias por ser parte",

`    `"idPlan": 4,

`    `"planCodigo": "B2C\_PRO",

`    `"planNombre": "B2C Pro"

}

**Nota:**

La tabla **ef\_suscripciones** registra el historial de planes efectivamente activados.

- En el plan Free se crea una suscripción ACTIVA con período de prueba (7 días).
- En planes pagos, la suscripción se crea cuando el superadmin registra el pago como APROBADO; antes de eso el evento queda en estado P (pendiente) y se gestiona con ef\_pagos en estado PENDIENTE.”

Luego de crear el evento, se podría ejecutar este endpoint para poner en el form del evento un banner con el estado comercial del evento para que el front, con **una sola llamada**, sepa si el evento está:

- en **trial** (y cuántos días quedan),
- en **pago pendiente**,
- **activo**,\
  y muestre el banner correcto 

**Endpoint**:

**GET /eventos\_comercial/Get?idEvento={id\_evento}**

(postman: Eventos\Mostrar Estado Comercial)

Respuesta:

{

`    `"id\_evento": 18,

`    `"estado": "P",

`    `"plan\_codigo": "B2C\_PRO",

`    `"plan\_nombre": "B2C Pro",

`    `"trial\_dias\_restantes": **null**,

`    `"trial\_vencido": **null**,

`    `"pago\_pendiente": **true**

}

**Como se podría usar:**

Banner en el evento:

- Si devuelve estado="P" o pago\_pendiente=true → mostrar banner “Pago pendiente”
- Si devuelve trial\_dias\_restantes >0 → mostrar banner “Te quedan X días de prueba”
- Si trial\_vencido == true →  “Tu período de prueba terminó” (mostrar botón Actualizar Plan)
- Si estado="A" → no mostrar banner o mostrar “Plan activo”

Dashboard “Mis eventos”:

- Pintar las cards según “Trial”, “Pago pendiente”, “Activo”

**4. Características del Plan y Selección /Activación de características**

Definir si lo hacemos como un paso del Evento o como algo asociado al evento pero por fuera.

Se mostrarán las características que incluye el plan y el usuario seleccionará cuáles activará y cuáles no.

**Endpoint**:

**GET /features\_efectivas/GetByEvento?idEvento=16**

(postman: Eventos\Mostrar Características del Plan de un evento)

Este endpoint devuelve features del plan del evento. Ejemplo:

{

`    `"id\_evento": 16,

`    `"id\_plan": 2,

`    `"plan\_codigo": "B2C\_BASIC",

`    `"plan\_nombre": "B2C Basic",

`    `"trial": {

`        `"dias\_restantes": 0,

`        `"vencido": **false**,

`        `"current\_period\_end": **null**

`    `},

`    `"addons\_evento": [],

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

`            `"config\_evento\_override": **null**

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

`            `"config\_evento\_override": **null**

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

`            `"config\_evento\_override": **null**

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

`            `"config\_evento\_override": **null**

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

`            `"config\_evento\_override": **null**

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

`            `"config\_evento\_override": **null**

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

`            `"config\_evento\_override": **null**

`        `}

`    `]

}

` `y el front podría armar toggles de estas características para activarlas o desactivarlas para el evento.

El usuario desmarca **REGALOS (18)** y **NOVEDADES\_EVENTO (6)** por ejemplo, y presiona **Guardar.**

**Endpoint**:

**PUT** **/evento\_features/SetActivosBulk?idEvento=16**

(postman: Eventos\Activar Características del evento)

Headers:

- Authorization: Bearer <TOKEN>
- Content-Type: application/json
- Sólo el creador del evento puede activar o desactivar características para su evento
- Esto guarda los toggles en ef\_evento\_features (upsert por id\_evento + id\_feature).

{\
"items": [\
{ "id\_feature": 5, "activo": true },\
{ "id\_feature": 6, "activo": false },\
{ "id\_feature": 19, "activo": true },\
{ "id\_feature": 18, "activo": false },\
{ "id\_feature": 20, "activo": true },\
{ "id\_feature": 1, "activo": true },\
{ "id\_feature": 21, "activo": true }\
]\
}

Para chequear las características que le quedaron habilitadas al evento:

**Endpoint**:

**GET /evento\_features/GetByEvento?idEvento=16**

**Para qué sirve este circuito:**

La “web de invitación” debería consultar features\_efectivas y mostrar/ocultar secciones.

Ejemplo:

- Si REGALOS está activo → mostrar sección regalos
- Si MUSICA\_SUGERENCIAS activo → mostrar sugerencias
- etc.

Por otra parte en la configuración del evento deberían habilitarse o no secciones también.

Ejemplo:

Si HOSPEDAJE está activo, tendría que habilitarse la sección donde cargar los hospedajes sugeridos.


**5. Paso Plantillas del Tipo de Evento**

De acuerdo al Plan seleccionado puede:

- Elegir una plantilla para el tipo de evento
- Crear una estructura si no encontró ninguna que se ajuste a su evento (si el plan no es free)

**El proceso es el explicado en los documentos Crear Evento con Plantillas y Crear Evento sin Plantillas.**

El resto de la creación del evento se mantiene igual.

2\. Desde el evento

El usuario no seleccionó ningún plan desde la landing:

Landing → “Crear mi evento”

- va a **/registrarse?flow=b2c** (sin plan)

Directamente va a la sección de registrarse / iniciar sesión y al crear evento, debe seleccionar de un combo el plan (debería haber un botón que muestre los planes):

Registro/Login → Nuevo evento

- combo Plan aparece FREE por default, pero si quiere, cambia a BASIC/PLUS/PRO y puede abrir modal “Ver planes” (consume PublicCatalog - GET/ planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=B2C)

El usuario crea el evento con el plan elegido (supongamos Free):

**Endpoint:**

**POST /eventos**

Ejemplo:

{\
"idTipoEvento": 3,\
"idIdioma": 1,\
"anfitrionesTexto ": "Vale y Juan",\
"idDressCode": null,\
"dressCodeDescripcion": null,\
"saludo": "¡Nos vamos a casar!",\
" mensajeBienvenida ": "Gracias por estar con nosotros",\
"notas": null,\
"codigoPlan": "B2C\_FREE"\
}

Respuesta:

{

`    `"idEvento": 19,

`    `"idTipoEvento": 3,

`    `"tipoEventoCodigo": "WEDDING",

`    `"tipoEventoDescripcion": "Boda",

`    `"idIdioma": 1,

`    `"anfitrionesTexto": "Vale y Juan",

`    `"estado": "B",

`    `"fechaAlta": "2026-03-20T14:34:33.245113+00:00",

`    `"idDressCode": **null**,

`    `"dressCodeDescripcion": **null**,

`    `"dressCodeTexto": **null**,

`    `"saludo": "Nos vamos a casar!",

`    `"mensajeBienvenida": "Gracias por estar con nosotros",

`    `"idPlan": 1,

`    `"planCodigo": "B2C\_FREE",

`    `"planNombre": "B2C Free"

}

Se chequea el estado comercial:

**Endpoint:**

**GET /eventos\_comercial/Get?idEvento=19**

Respuesta:

{

`    `"id\_evento": 19,

`    `"estado": "B",

`    `"plan\_codigo": "B2C\_FREE",

`    `"plan\_nombre": "B2C Free",

`    `"trial\_dias\_restantes": 7,

`    `"trial\_vencido": **false**,

`    `"pago\_pendiente": **false**

}

Con estos datos se puede armar el banner para que el usuario sepa cuántos días de prueba le quedan.





**B2B**

3\. Circuito “Quiero Info” (Prospectos B2B Salones/Cuentas/Empresas)

Vamos a aprovechar la inquietud de quienes a través de la página pidan información para poder registrarlos y hacerles seguimiento.

Podemos hacerlo más adelante pero ya lo dejo escrito porque el código ya está listo.

Objetivo

Este módulo permite que, cuando una persona entra a la landing y elige “Soy salón / empresa”, pueda dejar sus datos en un modal “**Quiero info”**.\
Eventia guarda ese contacto como **prospecto B2B** y el **Superadmin** puede gestionarlo desde un panel: listar pendientes, registrar contactos, agendar seguimiento, cambiar estado (nuevo/contactado/calificado/descartado/convertido) y mantener un historial tipo “timeline”.

En** la etapa actual no vendemos planes B2B directamente. El objetivo es capturar leads reales y organizar el seguimiento sin perder información.

Circuito

Al hacer clic en el botón “**Tenés una Empresa, Salón u organizás eventos? / Quiero Info**” se abre un modal:

***Modal “Quiero info”***

- **Título:** “Eventia para salones / empresas”
- **Descripción:** “Estamos abriendo cupos para empresas, salones y planners. Dejanos tus datos y te contactamos.”

**Campos del formulario:**

- Nombre y apellido *(obligatorio)*
- Nombre del salón / empresa / planner *(obligatorio)*
- Ciudad *(obligatorio)*
- País *(default: AR)*
- Email *(opcional pero recomendado)*
- WhatsApp *(opcional pero recomendado)*
- Eventos por mes *(opcional)*

Botón: **Enviar**\
Mensaje final: **“¡Listo! Te contactaremos a la brevedad.”**

Validación: Email o whatsapp uno de los 2 tiene que estar completo para poder contactarlo.

**Endpoint:**

**POST /prospectos\_b2b/QuieroInfo**

(postman: Landing\Prospectos – B2B - QuieroInfo)

Ejemplo:

{

`  `"nombre\_apellido": "Juana de Arco",

`  `"empresa\_nombre": "Salón La Arboleda",

`  `"ciudad": "Mar del Plata",

`  `"pais": "AR",

`  `"email": "contacto@laarboleda.com",

`  `"whatsapp": "+5492235551234",

`  `"eventos\_por\_mes": 8,

`  `"origen": "LANDING\_MODAL",

`  `"campania\_fuente": "instagram",

`  `"campania\_medio": "organic",

`  `"campania\_nombre": "b2b\_beta",

`  `"pagina\_origen": "/",

`  `"referer": "https://instagram.com/..."

}

Respuesta:

{

`    `"ok": **true**,

`    `"mensaje": "¡Listo! Te contactaremos a la brevedad.",

`    `"id\_prospecto": 1

}

Esto crea:

- Un registro en ef\_b2b\_prospectos (en estado NUEVO)
- Un registro inicial en ef\_b2b\_prospectos\_hist (tipo SISTEMA)

**Panel Superadmin** (Gestión de Prospectos B2B)

**Menú “Administración”** → **“Prospectos B2B”**

Pantallas:

\1) Lista de prospectos pendientes

**Endpoint:**

**GET /admin/prospectos\_b2b/Pendientes** *(requiere SUPERADMIN)*

(postman: Prospectos\Ver Prospectos Pendientes Superadmin)

Qué muestra la grilla

- Fecha alta
- Estado (NUEVO / CONTACTADO / CALIFICADO)
- Empresa
- Nombre
- Ciudad / País
- WhatsApp / Email
- Eventos por mes
- Próximo contacto 
- Asignado a 
- Acciones por fila:
  - “Ver Detalle”
  - “Registrar cambios”
  - “Agregar nota”
  - ` `“Historial”

**Acciones:**

Ver Detalle

Abre el formulario con los datos cargados por el prospecto y campos adicionales como:

- Nombre y apellido *(solo lectura)*
- Nombre del salón / empresa / planner *(solo lectura)*
- Ciudad *(solo lectura)*
- País *(solo lectura)*
- Email *(solo lectura)*
- WhatsApp *(solo lectura)*
- Eventos por mes *(solo lectura)*
- *Estado Actual: (solo lectura):*
- *Asignado a: (solo lectura)*
- *Próximo Contacto (solo lectura)*
- *Nota Interna (solo lectura)*

Botón **Cerrar**

**Endpoint:**

Registrar cambios

Abre el formulario con los datos cargados por el prospecto y los campos adicionales:

- Nombre y apellido *(solo lectura)*
- Nombre del salón / empresa / planner *(solo lectura)*
- Ciudad *(solo lectura)*
- País *(solo lectura)*
- Email *(solo lectura)*
- WhatsApp *(solo lectura)*
- Eventos por mes *(solo lectura)*
- *Estado Actual: (dropdown, editable):*
  - NUEVO → recién ingresó
  - CONTACTADO → ya se lo contactó
  - CALIFICADO → tiene interés real
  - DESCARTADO → no encaja/no responde/no le interesa
  - CONVERTIDO → convertido a cliente, a futuro cuando B2B esté operativo
- *Asignado a: (dropdown a usuarios internos (por ahora los que tengan rol SUPERADMIN, editable)*
- *Próximo Contacto (editable, date/time)*
- *Nota Interna (editable, texto)*

Botón **Guardar**

**Endpoint:**

**PUT /admin/prospectos\_b2b/Update?idProspecto=1**

Ejemplo:

{\
`  `"estado": "CONTACTADO",\
`  `"id\_usuario\_asignado": 1,\
`  `"proximo\_contacto": "2026-03-14T10:00:00-03:00",\
`  `"nota\_interna": "Interesado. Pide demo. Tiene 8 eventos/mes."\
}

Devuelve:

{

`    `"ok": **true**

}


Agregar Nota

Abre un modal con un campo de texto para agregar la Nota.

**Endpoint**:

**POST /admin/prospectos\_b2b/AgregarNota?idProspecto=1**

Ejemplo:

{\
"detalle": "Le escribí por WhatsApp. Pidió demo la semana próxima."\
}

Devuelve:

{

`    `"ok": **true**

}

Historial

**Endpoint**:

**GET** **/admin/prospectos\_b2b/Historial?idProspecto=1**


5\. Circuito B2B Salones/Cuentas/Empresas

1\. **Objetivo**

Permitir que una persona que representa a un **salón**, **planner** o **empresa** pueda:

- registrarse en Eventia con un usuario único 
- solicitar la creación de una cuenta B2B 
- quedar pendiente de aprobación 
- recibir un plan B2B a nivel cuenta 
- operar luego clientes, equipo y eventos desde esa cuenta 

Además, el mismo usuario puede usar Eventia también para B2C con ese mismo login, sin duplicar usuarios ni mezclar permisos. Ejemplo: un usuario que participa en un evento B2B como EVENT\_CLIENT\_ADMIN y además crea su propio evento B2C como EVENT\_OWNER.

2\. **Circuito**

- Todo actor de Eventia es primero un registro en la tabla ef\_usuarios (no existen “usuarios B2B” y “usuarios B2C”)
- El plan va en el **scope**:
  - B2C → plan en **evento** 
  - B2B → plan en **cuenta** 
- La B2B cuenta nace pendiente (ef\_cuentas.estado = 'P')
- el usuario creador queda en ef\_cuenta\_usuarios como ACCOUNT\_ADMIN, pero con activo = false hasta aprobación 

Mientras la cuenta esté en **P**, no opera hasta aprobación:

- no crea clientes 
- no crea eventos B2B 
- no invita staff 
#
El usuario **NO** selecciona un plan desde la landing:

- el equipo habla con esa cuenta 
- definen plan 
- definen condiciones 
- y recién después el superadmin la aprueba y le asigna el plan

El superadmin:

- aprueba la cuenta 
- le asigna el plan 
- activa el vínculo del owner 
- y registra la suscripción de cuenta


1\.  Desde la landing

Al hacer clic en** “**Soy Salón / Planner / Empresa**”:

- se deriva a registro/login con **flow=b2b**  (sin plan)


**1. Pantalla Registro/Login usuario**

Objetivo: Crear usuario que NO existe y va a solicitar la cuenta

**Endpoint**

**POST /auth/register**

(postman: B2B\Post Register)

Ejemplo

{\
`  `"email": "laura@faronorte.com",\
`  `"password": "123456",\
`  `"nombre": "Laura",\
`  `"apellido": "Gomez"\
}


Guarda en ef\_usuarios:

- email 
- password\_hash 
- nombre 
- apellido 
- activo = true 

\*sin rol global 

\*sin accesos todavía 

Respuesta

{

`    `"access\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2IiwiaWRfdXN1YXJpbyI6IjYiLCJlbWFpbCI6ImxhdXJhQGZhcm9ub3J0ZS5jb20iLCJuYmYiOjE3NzQ4ODQ3MTEsImV4cCI6MTc3NDkxMzUxMSwiaXNzIjoiRXZlbnRpYSIsImF1ZCI6IkV2ZW50aWEuQXBpIn0.ZbjbIomT98578gY94SzyVWwPFWl8fztuHTT9KS506O8",

`    `"expires\_at\_utc": "2026-03-30T23:31:51.7689455+00:00"

}

Objetivo: Loguearse usuario que YA existe y va a solicitar la cuenta
###
**Endpoint**

**POST /auth/login**

(postman: B2B\Post Login)

Ejemplo

{\
`  `"email": "laura@faronorte.com",\
`  `"password": "123456"\
}

Respuesta

{

`    `"access\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2IiwiaWRfdXN1YXJpbyI6IjYiLCJlbWFpbCI6ImxhdXJhQGZhcm9ub3J0ZS5jb20iLCJuYmYiOjE3NzQ4ODY5MDgsImV4cCI6MTc3NDkxNTcwOCwiaXNzIjoiRXZlbnRpYSIsImF1ZCI6IkV2ZW50aWEuQXBpIn0.Aox6VJIO5rkXvJ9t\_giVHbzaceIuJ1BCZkTL9m0Socc",

`    `"expires\_at\_utc": "2026-03-31T00:08:28.2878407+00:00"

}

Después del login, el front decide el flujo:

- ***flow=b2c*** → nuevo evento 
- ***flow=b2b*** → solicitud de cuenta (si es que no tiene una creada)

Para ver si permite la creación de cuenta:

**Endpoint**

**GET /auth/me**

(postman: B2B\Auth me)

**Respuesta**:

{

`    `"usuario": {

`        `"id\_usuario": 6,

`        `"email": "laura@faronorte.com"

`    `},

`    `"roles\_globales": [],

`    `"cuenta": {

`        `"estado\_ui": "SIN\_CUENTA",

`        `"id\_cuenta": **null**,

`        `"nombre\_cuenta": **null**,

`        `"tipo": **null**,

`        `"estado": **null**,

`        `"id\_plan": **null**,

`        `"plan\_codigo": **null**,

`        `"rol\_cuenta": **null**,

`        `"vinculo\_activo": **null**

`    `},

`    `"eventos": {

`        `"cantidad\_propios": 0,

`        `"cantidad\_compartidos": 0

`    `},

`    `"ui": {

`        `"mostrar\_solicitar\_cuenta": **true**,

`        `"mostrar\_estado\_cuenta\_pendiente": **false**,

`        `"mostrar\_menu\_cuenta": **false**,

`        `"mostrar\_admin": **false**,

`        `"puede\_crear\_evento\_b2c": **true**

`    `}

}

el front decide según:

- cuenta.estado\_ui = SIN\_CUENTA → mostrar opción **Solicitar cuenta** 
- cuenta.estado\_ui = CUENTA\_PENDIENTE → mostrar **Cuenta pendiente** (no permitir nueva Solicitud de Cuenta)
- cuenta.estado\_ui = CUENTA\_ACTIVA → mostrar **Menú / Dashboard Cuenta** 
- cuenta.estado\_ui = CUENTA\_SUSPENDIDA → mostrar **Cuenta suspendida**


**Caso 1.1: SIN CUENTA**

**Pantalla Solicitud de Cuenta**

**GET /auth/me:** Si estado\_ui = SIN\_CUENTA

- mostrar “Solicitar cuenta”

Objetivo: Crear la cuenta B2B y dejarla pendiente de aprobación.

Campos:

- nombre\_cuenta: obligatorio
- tipo (SALON, PLANNER, EMPRESA): obligatorio, combo de opciones
- instagram 
- web 
- telefono 
- ciudad 
- país: id\_pais, combo

  **Endpoint**:

  **GET /paises/GetAll?idIdioma=1**

  (postman: Parametros\Paises\Get All por Idioma)

- tipo identificación fiscal: id\_tipo\_identificacion\_fiscal, combo filtrado por país

  **Endpoint**:

  `	`**GET /tipos\_identificacion\_fiscal/GetByPais?idPais=2&idIdioma=1**

  (postman: Parametros\Tipos Identificacion Fiscal\Tipo Identificacion Fiscal por Pais e Idioma)

- nro identificación fiscal: identificación\_fiscal
- descripcion 
- botón “Solicitar Cuenta”

Mensaje faltan datos obligatorios 

- “Completá los datos obligatorios de tu cuenta para solicitar acceso B2B.”

Mensaje éxito:

- “Registramos tu solicitud de cuenta. Te avisaremos cuando la misma esté aprobada”

Redirecciona a 

- pantalla de cuenta pendiente:
  - datos de cuenta 
  - banner “Tu cuenta está pendiente de aprobación” 
  - no mostrar clientes/equipo/eventos de cuenta 

**Endpoint**

**POST /cuentas/SolicitarCuenta**

(postman: B2B\Solicitud de Cuenta)

Ejemplo 	

{

`  `"nombre\_cuenta": "Salon Faro Norte",

`  `"tipo": "SALON",

`  `"instagram": "@salonfaronorte",

`  `"web": "https://www.faronorte.com",

`  `"telefono": "+34911222333",

`  `"ciudad": "Barcelona",

`  `"id\_pais": 5,

`  `"id\_tipo\_identificacion\_fiscal": 3,

`  `"identificacion\_fiscal": "B12345678",

`  `"descripcion": "Salon para bodas y eventos"

}

Respuesta

{

`    `"ok": **true**,

`    `"mensaje": "Recibimos tu solicitud. Te avisaremos cuando tu cuenta esté habilitada.",

`    `"id\_cuenta": 1,

`    `"estado": "P"

}

Validaciones backend:

- usuario autenticado 
- nombre\_cuenta obligatorio 
- tipo obligatorio 
- tipo válido 
- nombre de cuenta único 

Qué guarda:

- ef\_cuentas
  - nombre\_cuenta = "Salon Faro Norte"
  - tipo = "SALON"
  - estado = "P" (PENDIENTE; aún no puede operar)
  - id\_plan = null
  - fecha\_alta = now()
  - fecha\_modif = null
  - resto de los campos cargados en el form
- ef\_cuenta\_usuarios
  - id\_cuenta = nueva cuenta
  - id\_usuario = usuario logueado
  - id\_rol = ACCOUNT\_ADMIN (este usuario será el administrador inicial de la cuenta)
  - activo = false
  - fecha\_alta = now()

Si volvemos a ejecutar **GET /auth/me:**

{

`    `"usuario": {

`        `"id\_usuario": 6,

`        `"email": "laura@faronorte.com"

`    `},

`    `"roles\_globales": [],

`    `"cuenta": {

`        `***"estado\_ui": "CUENTA\_PENDIENTE",***

`        `"id\_cuenta": 1,

`        `"nombre\_cuenta": "Salon Faro Norte",

`        `"tipo": "SALON",

`        `***"estado": "P",***

`        `"id\_plan": **null**,

`        `"plan\_codigo": **null**,

`        `***"rol\_cuenta": "ACCOUNT\_ADMIN",***

`        `"vinculo\_activo": **true**

`    `},

`    `"eventos": {

`        `"cantidad\_propios": 0,

`        `"cantidad\_compartidos": 0

`    `},

`    `"ui": {

`        `"mostrar\_solicitar\_cuenta": **false**,

`        `"mostrar\_estado\_cuenta\_pendiente": **true**,

`        `"mostrar\_menu\_cuenta": **false**,

`        `"mostrar\_admin": **false**,

`        `"puede\_crear\_evento\_b2c": **true**

`    `}

}

**Caso 1.2: CUENTA PENDIENTE**

**GET /auth/me:** Si estado\_ui = CUENTA\_PENDIENTE

- mostrar banner / pantalla de pendiente 
- no volver a mostrar Solicitar cuenta

**Endpoint**

`	`**GET /cuentas/MiCuenta**

`	`(postman: B2B\Detalle de mi Cuenta – Logueado el usuario que solicitó la cuenta)**\


Qué ve el usuario:

- nombre de la cuenta 
- tipo 
- estado = Pendiente 
- mensaje: “Tu cuenta está pendiente de aprobación” 

Restricciones:

- Mientras estado = P:
  - no ve menú Clientes 
  - no ve menú Equipo 
  - no crea eventos B2B 
  - no invita staff 

**Caso 1.3: CUENTA ACTIVA**

**GET /auth/me:** Si estado\_ui = CUENTA\_ACTIVA

- mostrar menú:
  - Mi cuenta 
  - Clientes 
  - Eventos 
  - Equipo

**Caso 1.4: CUENTA SUSPENDIA**

**GET /auth/me:** Si estado\_ui = CUENTA\_SUSPENDIDA

- mostrar aviso de suspensión
- bloquear operaciones B2B


**2. Circuito Administrativo**

SUPERADMIN: Bandeja de Cuentas Pendientes

**Endpoint**

**GET /admin/cuentas/GetPendientes**\
(postman: B2B\Cuenta Pendientes de Autorizacion – Logueado el superadmin)

Respuesta

[

`    `{

`        `"id\_cuenta": 1,

`        `"nombre\_cuenta": "Salon Faro Norte",

`        `"tipo": "SALON",

`        `"estado": "P",

`        `"id\_usuario\_owner": 6,

`        `"email\_owner": "laura@faronorte.com",

`        `"fecha\_alta": "2026-04-01T12:08:12.954867+00:00"

`    `}

]

Grilla de Cuentas Pendientes de Autorización:

- id\_cuenta 
- nombre\_cuenta 
- tipo 
- estado 
- email del owner 
- fecha\_alta 

Acciones:

- ver detalle 
- aprobar (sólo visible si estado\_ui = CUENTA\_PENDIENTE)
- suspender (sólo visible si estado\_ui = CUENTA\_ACTIVA)
- reactivar (sólo visible si estado\_ui = CUENTA\_SUSPENDIDA)
- cambiar plan 

Aprobar:

Esta acción aprueba y asigna un plan a la cuenta.

Planes previstos:

- B2B\_STARTER 
- B2B\_TEAM 
- B2B\_PREMIUM 

Al hacer clic en esta acción se deberá abrir un popup que muestre los planes disponibles en un combo y el usuario le asigne uno de forma obligatoria.

**Endpoint**:

**PUT /admin/cuentas/Aprobar**

(postman: B2B\Aprobar Cuenta – Logueado el superadmin)

JSON:

{

`  `"id\_cuenta": 1,

`  `"codigo\_plan": "B2B\_STARTER",

`  `"observacion": "Cuenta aprobada en testing"

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_cuenta": 1,

`    `"estado": "A",

`    `"codigo\_plan": "B2B\_STARTER"

}


Qué se actualiza:

- ef\_cuentas:
  - estado = "A"
  - id\_plan = id del plan B2B\_STARTER
  - fecha\_modif = now()
- ef\_cuenta\_usuarios:
  - Registro del owner: activo = true
- ef\_suscripciones:
  - Crea registro activo con:
    - scope = "CUENTA"
    - id\_scope = id\_cuenta
    - id\_plan = plan asignado
    - estado = "A"
    - fecha\_inicio = now()
    - fecha\_fin = null

Suspender:

Esta acción suspende una cuenta ya existente.

Se utilizará cuando la cuenta:

- deba quedar bloqueada administrativamente 
- tenga una incidencia comercial 
- se decida pausar su operación por cualquier motivo 

Al hacer clic en esta acción se deberá abrir un popup de confirmación con un campo opcional de observación.

**Endpoint**:

**PUT /admin/cuentas/Suspender**

(postman: B2B\Suspender Cuenta – Logueado el superadmin)

JSON:

{\
`  `"id\_cuenta": 1,\
`  `"observacion": "Suspensión cuenta en testing"\
}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_cuenta": 1,

`    `"estado": "S"

}

Qué se actualiza:

- ef\_cuentas: 
  - estado = "S" 
  - fecha\_modif = now() 

Qué NO se actualiza:

- ef\_cuenta\_usuarios: 
  - no se eliminan vínculos 
  - no se borran registros 
- ef\_suscripciones: 
  - no se crea una nueva suscripción 
  - no se cambia automáticamente el plan vigente de la cuenta 
- ef\_cuentas.id\_plan: 
  - se mantiene el último plan asignado 

Comportamiento:

- la cuenta queda bloqueada para operar módulos B2B 
- el usuario owner y el staff no deben poder operar: 
  - clientes 
  - eventos de cuenta 
  - equipo 
- la cuenta sigue existiendo en el sistema 
- el historial se conserva 
- el plan actual se conserva como referencia
##

Reactivar

Esta acción reactiva una cuenta previamente suspendida.

Se utilizará cuando una cuenta en estado suspendido vuelva a quedar habilitada para operar.

Al hacer clic en esta acción se deberá abrir un popup de confirmación con un campo opcional de observación.

**Endpoint**:

**PUT /admin/cuentas/Reactivar**

(postman: B2B\Reactivar Cuenta – Logueado el superadmin)

JSON:

{

`  `"id\_cuenta": 1,

`  `"observacion": "Reactivación administrativa en testing"

}

Respuesta:

{\
`  `"ok": true,\
`  `"id\_cuenta": 1,\
`  `"estado": "A"\
}

Qué se actualiza:

- ef\_cuentas: 
  - estado = "A" 
  - fecha\_modif = now() 
- ef\_cuenta\_usuarios: 
  - vínculos de la cuenta: activo = true 

Qué NO se actualiza:

- ef\_cuentas.id\_plan: 
  - no se modifica 
- ef\_suscripciones: 
  - no se crea una nueva suscripción 
  - no se cambia automáticamente la suscripción existente 

Comportamiento:

- solo puede reactivarse una cuenta que esté en estado "S" 
- al reactivar, la cuenta vuelve a quedar operativa 
- se restablece el acceso del owner/staff vinculado a esa cuenta 
- conserva el plan que ya tenía asignado antes de la suspensión 


Cambiar Plan:

Esta acción cambia el plan vigente de una cuenta ya activa o suspendida, según la regla de negocio que definas.

Se utilizará cuando:

- una cuenta haga upgrade 
- una cuenta haga downgrade 
- se decida un cambio comercial/manual por parte del superadmin 

Planes previstos:

- B2B\_STARTER 
- B2B\_TEAM 
- B2B\_PREMIUM 

Al hacer clic en esta acción se deberá abrir un popup que muestre:

- plan actual 
- combo obligatorio con planes disponibles 
- campo opcional de motivo / observación 

**Endpoint**:

**PUT /admin/cuentas/CambiarPlan**

(postman: B2B\Cambiar Plan Cuenta – Logueado el superadmin)

JSON:

{

`  `"id\_cuenta": 1,

`  `"codigo\_plan\_nuevo": "B2B\_TEAM",

`  `"motivo": "Upgrade comercial en testing"

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_cuenta": 1,

`    `"codigo\_plan\_anterior": "B2B\_STARTER",

`    `"codigo\_plan\_nuevo": "B2B\_TEAM"

}

Qué se actualiza:

- ef\_cuentas: 
  - id\_plan = id del nuevo plan 
  - fecha\_modif = now() 
- ef\_suscripciones: 
  - cierra la suscripción activa anterior de la cuenta: 
  - estado = "CANCELADA" 
  - current\_period\_end = now() 
  - cancelled\_at = now() 
  - fecha\_modif = now() 
  - crea una nueva suscripción activa con: 
    - scope = "CUENTA" 
    - id\_cuenta = id\_cuenta 
    - id\_evento = null 
    - id\_plan = id del nuevo plan 
    - estado = "ACTIVA" 
    - periodo = "MENSUAL" (o el que corresponda) 
    - current\_period\_start = now() 
    - current\_period\_end = null 
    - fecha\_alta = now() 

Qué NO se actualiza:

- ef\_cuentas.estado: 
  - no cambia por cambiar plan 
- ef\_cuenta\_usuarios: 
  - no cambia vínculos 

Comportamiento:

- el cambio de plan no borra histórico 
- el cambio de plan no elimina datos existentes de la cuenta 
- el nuevo plan pasa a ser el plan vigente operativo de la cuenta 
- el historial comercial queda registrado en ef\_suscripciones


3\. Circuito registro Pago 

Menú Superadmin:

Administración

- **Pagos Eventos (B2C)** 
  - Pendientes de pago (/admin/pagos/pendientes) 
  - Registrar pago manual (/admin/pagos/registrar) 
  - Oportunidades Free/Trial (/admin/oportunidades/free-trials?soloNoConvertidos=true)
- **Pagos Cuentas (B2B)** 
  - Pendientes / Por vencer 
  - Registrar pago 
  - Inconsistencias 
- **Cuentas B2B** 
  - Cuentas pendientes (aprobar / suspender / reactivar / cambiar plan) 
- **Prospectos B2B** 
  - Pendientes / Historial / Notas 
- **Planes y precios** 
  - Planes 
  - Precios (histórico por mercado/moneda/vigencia) 
- **Parámetros** 
  - (ver doc de paramétricas)
##

Eventos - B2C (pagos)

` `Desde el lado del Superamin

Objetivo:

Permitir que el Superadmin:

- vea qué eventos tienen **pago pendiente** (plan pago elegido, pero aún no aprobado)
- registre un **pago manual** (transferencia/efectivo)
- al registrar el pago, el sistema:
  - marque el evento como **ACTIVO**
  - deje historial de estado
  - cierre/cancele pagos pendientes previos si existían

El circuito será el siguiente y se explica a continuación:

1. Circuito usuario: elige plan pago → evento queda con estado:
   1. P (Pendiente de pago) si el plan es pago 
   1. B (Borrador) si es trial/free 
1. Circuito superadmin: ver pendientes → registrar pago → evento activo** 
1. Circuito usuario: refrescar estado comercial (banner) después del pago** 

Menú: **Administración → Pagos Eventos**

**Pantalla Pagos Pendientes:**

**Endpoint:**

**GET** **/admin/pagos/pendientes**

Respuesta:

{

`    `"pendientes": [

`        `{

`            `"id\_pago": 3,

`            `"id\_evento": 20,

`            `"evento\_estado": "P",

`            `"plan\_codigo": "B2C\_PRO",

`            `"plan\_nombre": "B2C Pro",

`            `"tipo\_evento\_codigo": "WEDDING",

`            `"anfitriones\_texto": "Alicia y novio",

`            `"moneda": "ARS",

`            `"importe": 0.00,

`            `"fecha\_alta\_pago": "2026-04-07T13:25:33.613231+00:00",

`            `"concepto": "Plan B2C\_PRO pendiente - evento 20",

`            `"inconsistente": **false**

`        `}

`    `],

`    `"inconsistencias": []

}

2 tabs:

- Grilla Tab Pendientes:
  - Fecha alta pago (o fecha creación)
  - Evento (id\_evento)
  - Tipo evento (codigo)
  - Anfitriones (o nombre evento)
  - Plan (plan\_codigo / plan\_nombre)
  - Importe / Moneda
  - Concepto (si existe)
  - Estado del evento (P/B/A)
  - Acciones: “**Registrar pago**” 
- Grilla Tab Inconsistencias (son los eventos creados en estado P sin pago pendiente (para corregir). Si llegan items en inconsistencias[]:

  Qué es una inconsistencia:

- Se creó el evento y por algún error no se insertó el pago PENDIENTE.
- Se borró/actualizó un pago pendiente a mano.
- Cambio de flujo (antes usabas borrador, ahora pendiente, etc.) y quedaron datos a medio camino.
- Etc
- En definitiva no hay ningún registro pendiente en ef\_pagos
- Mostrar los mismos datos que en el tab Pendientes
- Acciones: “**Corregir inconsistencia /** **Generar Pago Pendiente**”

A fines de prueba borro el registro de la tabla ef\_pagos de un evento pendiente de pago y vuelvo a correr el **endpoint**:

**GET** **/admin/pagos/pendientes**

Resultado:

{

`    `"pendientes": [],

`    `"inconsistencias": [

`        `{

`            `"id\_pago": 0,

`            `"id\_evento": 20,

`            `"evento\_estado": "P",

`            `"plan\_codigo": "B2C\_PRO",

`            `"plan\_nombre": "B2C Pro",

`            `"tipo\_evento\_codigo": "WEDDING",

`            `"anfitriones\_texto": "Alicia y novio",

`            `"moneda": "ARS",

`            `"importe": 0.0,

`            `"fecha\_alta\_pago": "2026-04-07T13:25:33.613231+00:00",

`            `"concepto": "INCONSISTENCIA: Evento en P sin pago pendiente",

`            `"inconsistente": **true**

`        `}

`    `]

}

Corregir inconsistencia / Generar Pago Pendiente:

- Para corregir una sola inconsistencia (de a un solo evento)

**Endpoint**

**POST** **/admin/pagos/corregir-inconsistencia?idEvento=20**

`	`(postman: Pagos-Eventos (B2C)\Corregir 1 inconsistencia)

Respuesta:

{

`    `"ok": **true**,

`    `"id\_evento": 20

}

- Para corregir todas las inconsistencias (debe haber un botón al pie de la grilla “**Corregir todas las Inconsistencias**”)

**Endpoint**

**POST** **/admin/pagos/corregir-inconsistencias**

`	`(postman: Pagos-Eventos (B2C)\Corregir todas las inconsistencia)

Respuesta:

{

`    `"ok": **true**,

`    `"corregidos": 0

}



Registrar Pago Manual (activa evento):

Se abre desde la grilla un modal para un evento puntual:

- id\_evento (readonly) 
- plan (dropdown o readonly si ya viene) 
- moneda (ARS/EUR/USD) 
- importe 
- concepto (ej: “Transferencia MP 000123”)\
  Botón: **Confirmar pago** 

**Endpoint**:

**POST** **/admin/pagos/registrar**

JSON:

{

`  `"id\_evento": 18,

`  `"codigo\_plan": "B2C\_PRO",

`  `"moneda": "ARS",

`  `"importe": 25000,

`  `"concepto": "Transferencia - comprobante 000123"

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_evento": 18,

`    `"plan": "B2C\_PRO",

`    `"estado": "A"

}

Cuando el superadmin confirma el pago:

- Cancela pagos pendientes previos del evento (pendiente) 
- Inserta un registro en ef\_pagos con estado="APROBADO" 
- Actualiza ef\_eventos: 
  - estado="A" 
  - id\_plan queda en el plan aprobado 
- Inserta historial en ef\_evento\_estados\_hist 
- Inserta/actualiza ef\_suscripciones (ACTIVA)


Verificar desde el lado del usuario (front)

El front del evento debería refrescar el banner.

**Endpoint**:

**GET** **/eventos\_comercial/Get?idEvento=1**8 (con token del usuario dueño del evento)

Resultado:

{

`    `"id\_evento": 18,

`    `"estado": "A",

`    `"plan\_codigo": "B2C\_PRO",

`    `"plan\_nombre": "B2C Pro",

`    `"trial\_dias\_restantes": **null**,

`    `"trial\_vencido": **null**,

`    `"pago\_pendiente": **false**

}

Qué muestra el front en base a este resultado:

- Si eventos\_comercial.estado == “P” o pago\_pendiente == true
  - Banner “Pago Pendiente”
- Si eventos\_comercial.estado == “A”
  - Sin banner o badge ”Plan activo”



**Pantalla Eventos con plan Free:**

Objetivo

Permitir que el Superadmin haga seguimiento comercial de los eventos en plan **B2C\_FREE (trial)**, tanto:

- los que **todavía tienen días disponibles** (para empujar conversión antes del vencimiento), 
- como los que **ya vencieron** y no convirtieron (para re-contactar con una oferta / upgrade). 

Esta pantalla no gestiona pagos. Es un “tablero comercial” de seguimiento.

**Endpoint:**

**GET** /admin/oportunidades/free-trials?soloNoConvertidos=true

(postman: Pagos\Eventos con plan Free – días restantes)

Respuesta:

{

`        `"id\_evento": 19,

`        `"evento\_estado": "B",

`        `"tipo\_evento\_codigo": "WEDDING",

`        `"anfitriones\_texto": "Vale y Juan",

`        `"fecha\_alta\_evento": "2026-03-20T14:34:33.245113+00:00",

`        `"plan\_codigo": "B2C\_FREE",

`        `"plan\_nombre": "B2C Free",

`        `"trial\_fin": "2026-03-27T14:34:33.245113+00:00",

`        `"dias\_restantes": 7,

`        `"vencido": **false**,

`        `"id\_usuario\_owner": 3,

`        `"owner\_email": "admingaby@eventia.com",

`        `"convertido\_a\_pago": **false**

`    `}

Si estuviera vencido:

`   `{

`        `"id\_evento": 19,

`        `"evento\_estado": "A",

`        `"tipo\_evento\_codigo": "WEDDING",

`        `"anfitriones\_texto": "Vale y Juan",

`        `"fecha\_alta\_evento": "2026-03-19T10:34:33.245113+00:00",

`        `"plan\_codigo": "B2C\_FREE",

`        `"plan\_nombre": "B2C Free",

`        `"trial\_fin": "2026-03-26T10:34:33.245113+00:00",

`        `"dias\_restantes": 0,

`        `"vencido": **true**,

`        `"id\_usuario\_owner": 3,

`        `"owner\_email": "admingaby@eventia.com",

`        `"convertido\_a\_pago": **false**

`    `}

Form con Tabs:

- **Eventos Free activos** (filtro: dias\_restantes > 0)
- **Eventos Por vencer** (filtro: dias\_restantes <= 2)
- **Eventos Vencidos** (filtro: vencido = true)

  *vencido = item.vencido === true* 

  *porVencer = !vencido && item.dias\_restantes != null && item.dias\_restantes <= 2* 

  *activo = !vencido && item.dias\_restantes != null && item.dias\_restantes > 2*

Columnas:

- **id\_evento**: identificador único del evento 
- **tipo\_evento\_codigo**: tipo de evento (Casamiento, Cumpleaños, etc.) 
- **anfitriones\_texto**: “Sol y Rodri”, “Cumple de Tomi”, etc. 
- **fecha\_alta\_evento**: fecha en que se creó el evento 
- **plan\_codigo / plan\_nombre**: B2C Free 
- **trial\_fin**: fecha/hora de finalización del trial (current\_period\_end) 
- **dias\_restantes (en tabs Free activos y Por Vencer)**: 
- **id\_usuario\_owner**: id del usuario owner (para referencia interna) 


Cuentas- B2B (cobranzas)

Objetivo

Gestionar cobranza manual **por cuenta** (B2B), en modalidad mensual/anual.\
Acá NO se cobra por evento: se cobra por **suscripción de cuenta** (ef\_suscripciones.scope="CUENTA").

La pantalla permite:

- ver cuentas **vencidas** / **por vencer** 
- registrar cobro manual, lo cual: 
- inserta pago APROBADO asociado a cuenta + suscripción 
- avanza el vencimiento (current\_period\_end) 1 mes / 1 año 
- detectar inconsistencias (cuenta activa sin suscripción activa) 

Administración à Cobranzas Cuentas (B2B)

Pantalla con 4 tabs:

- Vencidas 
- Vencidas a X cantidad días (se podría poner un filtro de cant de días)
- Todas
- Inconsistencias

Columnas:

- id\_cuenta 
- nombre\_cuenta 
- tipo (SALON / PLANNER / etc.) 
- cuenta\_estado (A/P/S) 
- plan\_codigo / plan\_nombre 
- suscripcion\_estado (ACTIVA/PAST\_DUE) 
- current\_period\_end 
- dias\_para\_vencer 
- acciones: Registrar pago (para tabs Vencidas y Por vencer)/ Corregir (para tab Inconsistencias)

**Endpoints**:

Caso 1: Vencidas

**GET /admin/cobranzas\_cuentas/pendientes?diasProximo=7 (o 30 da igual)** (con token de superadmin)

(postman: B2B\Cobranzas vencidas)

Qué mostrar:

- Mostrar **solo** response.vencidas 
- Ignorar por\_vencer y inconsistencias (ya que se muestran en otro tab) 
- Importante: vencidas **no depende** de diasProximo. Siempre son las que tienen current\_period\_end <= now.

Caso 2: Por vencer dentro de X dias

Si el usuario elige 7 días:

**GET /admin/cobranzas\_cuentas/pendientes?diasProximo=7** 

Si elige 30 días:

**GET /admin/cobranzas\_cuentas/pendientes?diasProximo=30** 

Si elige 40 días:

**GET /admin/cobranzas\_cuentas/pendientes?diasProximo=40** 

(con token de superadmin)

(postman: B2B\Cobranzas por vencer a X cantidad de días)

Qué mostrar:

- Mostrar **solo** response.por\_vencer 
- En UI, arriba un selector “7 / 30 / 60 / 90”


Caso 3: Todo

**GET /admin/cobranzas\_cuentas/pendientes?diasProximo=0** (con token de superadmin)

(postman: B2B\Cobranzas todas)

Qué mostrar:

- response.vencidas + response.por\_vencer en una sola grilla (o dos secciones).

Respuesta

{

`    `"vencidas": [],

`    `"por\_vencer": [

`        `{

`            `"id\_cuenta": 2,

`            `"nombre\_cuenta": "Salon Eventos Full",

`            `"tipo": "SALON",

`            `"cuenta\_estado": "A",

`            `"id\_plan": 5,

`            `"plan\_codigo": "B2B\_STARTER",

`            `"plan\_nombre": "B2B Starter",

`            `"id\_suscripcion": 5,

`            `"suscripcion\_estado": "ACTIVA",

`            `"periodo": "MENSUAL",

`            `"current\_period\_end": "2026-05-08T12:05:09.017788+00:00",

`            `"dias\_para\_vencer": 30,

`            `"concepto": **null**,

`            `"inconsistente": **false**

`        `}

`    `],

`    `"inconsistencias": []

}



Registrar Pago Manual de la Cuenta

Al hacer clic en el botón “Registrar Pago” se abre un modal:

Campos:

- id\_cuenta (readonly) 
- id\_suscripcion (readonly) 
- plan (readonly) 
- moneda 
- importe 
- concepto\
  Botón: **Confirmar** 

**Endpoint**:

**POST /admin/cobranzas\_cuentas/registrar** (token superadmin)

\
JSON:

{

`  `"id\_cuenta": 2,

`  `"id\_suscripcion": 5,

`  `"moneda": "ARS",

`  `"importe": 45000,

`  `"concepto": "Transferencia abril - comp 000456"

}

Respuesta:

{

`    `"ok": **true**,

`    `"id\_cuenta": 2,

`    `"id\_suscripcion": 5,

`    `"next\_due": "2026-06-08T12:05:09.017788+00:00"

}

Se podría mostrar la fecha de próximo vencimiento luego del submit.

Qué hace este post:

- Inserta ef\_pagos con: 
  - id\_cuenta, id\_suscripcion 
  - estado=APROBADO, tipo=RECURRENTE 
- Avanza suscripción: 
  - current\_period\_start = previous\_end 
  - current\_period\_end = previous\_end + 1 mes (o +1 año si ANUAL) 
  - Si suscripción estaba PAST\_DUE, vuelve a ACTIVA 


Corregir inconsistencia / Generar Pago Pendiente:

Qué consideramos “inconsistencia” para B2B:

Para **cuentas activas** (ef\_cuentas.estado='A'):

- **No tiene suscripción activa de cuenta**: no existe ef\_suscripciones con: 
  - scope='CUENTA' AND id\_cuenta = ... AND activo=true AND estado in ('ACTIVA','PAST\_DUE') 
- **Tiene más de 1 suscripción activa** (duplicada): existen 2+ filas activas. 
- **Tiene suscripción activa mensual/anual pero current\_period\_end es NULL** (no cobrable). 

El corregir inconsistencia debe:

- Crear la suscripción si falta (usando cuenta.id\_plan + plan.periodo). 
- Si hay duplicadas, dejar **solo 1 activa** (la más nueva), y cerrar las otras. 
- Si el plan es MENSUAL/ANUAL y current\_period\_end es null, setearlo a now + 1 mes/año.

Para hacer la prueba, borré el registro de suscripción de una cuenta que aún no había registrado el pago:

**Endpoint**:

**GET /admin/cobranzas\_cuentas/pendientes** (con token de superadmin)

(postman: B2B\Cobranzas Pendientes)

{

`    `"vencidas": [],

`    `"por\_vencer": [],

`    `"inconsistencias": [

`        `{

`            `"id\_cuenta": 1,

`            `"nombre\_cuenta": "Salon Faro Norte",

`            `"tipo": "SALON",

`            `"cuenta\_estado": "A",

`            `"id\_plan": 6,

`            `"plan\_codigo": "B2B\_TEAM",

`            `"plan\_nombre": "B2B Team",

`            `"id\_suscripcion": **null**,

`            `"suscripcion\_estado": **null**,

`            `"periodo": **null**,

`            `"current\_period\_end": **null**,

`            `"dias\_para\_vencer": **null**,

`            `"concepto": "INCONSISTENCIA: Cuenta activa sin suscripción CUENTA activa",

`            `"inconsistente": **true**

`        `}

`    `]

}

- Para corregir una sola inconsistencia (de a un solo evento)

**Endpoint**

**POST /admin/cobranzas\_cuentas/corregir-inconsistencia?idCuenta=1**

`	`(postman: B2B\Corregir 1 inconsistencia)

Respuesta:

{

`    `"ok": **true**,

`    `"id\_cuenta": 1,

`    `"current\_period\_end": "2026-05-08T15:30:24.9171782+00:00"

}

- Para corregir todas las inconsistencias (debe haber un botón al pie de la grilla “**Corregir todas las Inconsistencias**”)

**Endpoint**

**POST /admin/cobranzas\_cuentas/corregir-inconsistencias**

`	`(postman: B2C\Corregir todas las inconsistencia)

Respuesta:

{

`    `"ok": **true**,

`    `"corregidos": 1

}


Desde el lado del usuario (cuenta)

Menú de cuenta (para ACCOUNT\_ADMIN / ACCOUNT\_STAFF):

- **Mi plan y facturación** 

Secciones:

- **Estado del plan** 
- **Vencimiento** 
- **Historial de pagos** 

Qué debería mostrar

- Plan actual: nombre + código 
- Estado comercial: 
  - “Al día” 
  - “Vence en X días” 
  - “Vencida (desde dd/mm)” 
- Próximo vencimiento (current\_period\_end) 

Botón “Contactar soporte / Enviar comprobante” (a futuro, por ahora manual) 

- Tabla “Historial de Pagos” (últimos 10): fecha, importe, moneda, concepto, estado (APROBADO/CANCELADO) 

**Endpoint**:

**GET** **/cuentas\_comercial/Get?idCuenta=1** (usuario logueado de cuenta)

(postman: B2C\Estado comercial de la cuenta)

Respuesta:

{

`    `"id\_cuenta": 1,

`    `"cuenta\_estado": "A",

`    `"plan\_codigo": "B2B\_TEAM",

`    `"plan\_nombre": "B2B Team",

`    `"periodo": "MENSUAL",

`    `"suscripcion\_estado": "ACTIVA",

`    `"current\_period\_end": "2026-05-08T15:30:24.917178+00:00",

`    `"dias\_para\_vencer": 30,

`    `"vencida": **false**,

`    `"pago\_pendiente": **false**,

`    `"mensaje": "Tu suscripción está al día."

}

Mostrar banner: 

- pago\_pendiente=true → “Cuenta vencida / contactá soporte” 
- dias\_para\_vencer <= 3 → aviso de vencimiento 

Mostrar plan y vencimiento. 

Para el historial de pagos (muestra los últimos 10):

**Endpoint**:

**GET** **/cuentas\_comercial/Pagos?idCuenta=7&take=10**

(postman: B2C\Historial de pagos de la cuenta)

Respuesta:

[

`    `{

`        `"id\_pago": 5,

`        `"fecha\_alta": "2026-04-08T14:36:30.791746+00:00",

`        `"estado": "APROBADO",

`        `"moneda": "ARS",

`        `"importe": 45000.00,

`        `"concepto": "Transferencia abril - comp 000456"

`    `}

]




