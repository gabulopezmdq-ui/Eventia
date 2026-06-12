# Eventia – Eventos: Módulo Regalos

Objetivo del módulo

Permitir que el invitado vea y/o use “Regalos” dentro del portal público del evento.

El módulo tiene 3 submódulos:

- **Transferencias** (Base, en todos los planes)

  Organizador carga **uno o varios destinos** de transferencia con un **textarea** (por moneda y/o por “Novia/Novio/Exterior”).

- **Lista de regalos** (en plan Pro / o por Add-on)

  Lista de items genéricos (sin precio/link obligatorios) que se pueden **reservar** (“lo llevo yo”) para evitar duplicados.

- **Fondo / Metas con barra** (en plan Pro / o por Add-on)

  Metas monetizables (“Hotel”, “Bicicleta”, “Excursión”) con objetivo y barra.\
  El invitado transfiere por fuera y registra el aporte; el organizador confirma luego.


Reglas de habilitación (por plan / add-on)

Feature base (todos los planes):

- REGALOS\_TRANSFERENCIAS

Pro o Add-on:

- REGALOS\_LISTA
- REGALOS\_FONDO\_METAS

**Regla estricta:** si la feature está apagada, **NO se devuelve ese bloque** aunque haya data cargada.

**Add-on:** ADDON\_REGALOS (scope EVENTO) habilita:

- REGALOS\_LISTA 
- REGALOS\_FONDO\_METAS 

Mientras no haya UI de features, se puede activar por SQL para poder hacer pruebas (en este caso asociado al evento 84):

-- a) Activar TRANSFERENCIAS para el evento 84 (temporal)

insert into public.ef\_evento\_features (id\_evento, id\_feature, activo, fecha\_alta)

select 84 as id\_evento, f.id\_feature, true, now()

from public.ef\_param\_features f

where f.codigo = 'REGALOS\_TRANSFERENCIAS'

on conflict (id\_evento, id\_feature) do update

set activo = excluded.activo,

`    `fecha\_modif = now();

-- b) Asignar ADDON\_REGALOS al evento 84 (si ya hay uno activo, lo desactivamos y creamos uno nuevo)

update public.ef\_scope\_addons

set activo = false,

`    `fecha\_modif = now()

where scope = 'EVENTO'

`  `and id\_evento = 84

`  `and id\_addon = 13

`  `and activo = true;

insert into public.ef\_scope\_addons

(scope, id\_evento, id\_addon, estado, fecha\_desde, fecha\_hasta, activo, config\_json\_override, fecha\_alta)

values

('EVENTO', 84, 13, 'ACTIVO', now(), null, true, null, now());


Podríamos pensar el módulo completo como una pantalla de **Regalos** con **3 tabs**, uno por submódulo:

- Transferencias
- Lista de Regalos
- Fondos / Metas

# Submódulo Datos para Transferencias 

Objetivo

Permitir que el organizador cargue **uno o varios destinos de transferencia** por evento, de forma **simple** (un textarea), para que los invitados sepan **a dónde transferir** cuando:

- aportan a un **Fondo/Metas** (barra de progreso), o 
- el organizador solo quiere dejar “datos para transferir” sin lista ni fondo. 

Soporta:

- **Múltiples monedas** (ARS/EUR/USD, etc.) usando ef\_monedas. 
- **Múltiples destinos en la misma moneda** (ej: “Novia” y “Novio” ambos en ARS). 
- Orden y activación/desactivación. 

No se valida formato bancario por país. Se guarda texto “tal como lo pegarían por WhatsApp”.

Nota interna: guarda en tabla ef\_evento\_regalos\_transferencias

Pantalla:

Encabezado:

Usar este **endpoint** por si ya hubiera un encabezado guardado (se permite uno solo por evento, por lo que el guardar haría las veces de insertar o de modificar):

**GET /eventos/{id\_evento}/regalos/transferencias/config**

Ejemplo:

GET** /eventos/84/regalos/transferencias/config

Esto devuelve:

{

`    `"id\_evento": 84,

`    `"titulo": "Regalos",

`    `"texto\_intro": "Si querés hacernos un regalo, podés transferir a cualquiera de estas cuentas.",

`    `"activo": **true**

}

o si no existe todavía, devuelve el default:

{

`    `"id\_evento": 84,

`    `"titulo": "Regalos",

`    `"texto\_intro": **null**,

`    `"activo": **true**

}

- **Título** 
  - Campo titulo
  - Ejemplo: “Regalos” / “Donaciones” 
- **Texto visible como encabezado Sección Regalos:**
  - Campo texto\_intro
  - Textarea
  - Ejemplo: “Si querés hacernos un regalo…” / “No nos hagas regalo, doná a…” 
- **Activo** 
  - Campo activo
  - Toggle
  - (opcional en UI)

- Botón “**Guardar cambios**”:
  - **Endpoint**

    **POST /eventos/{id\_evento}/regalos/transferencias/config**

    Ejemplo

    POST /eventos/84/regalos/transferencias/config

    JSON

    {

    `  `"titulo": "Regalos",

    `  `"texto\_intro": "Si querés hacernos un regalo, podés transferir a cualquiera de estas cuentas.",

    `  `"activo": **true**

    }

    Respuesta

    {

    `    `"id\_evento": 84,

    `    `"titulo": "Regalos",

    `    `"texto\_intro": "Si querés hacernos un regalo, podés transferir a cualquiera de estas cuentas.",

    `    `"activo": **true**

    }

Arriba de la grilla botón **Agregar Destino**

Grilla de Destinos:

**Endpoint:**

**GET /eventos/{id\_evento}/regalos/transferencias**

Ejemplo:

GET** /eventos/84/regalos/transferencias

(podría listar solo los activos o inactivos: GET** /eventos/84/regalos/transferencias?activo = true)

- Moneda (codigo\_moneda) 
- Título (opcional) 
- Texto corto (primeras 50 letras de datos\_transferencia\_texto) 
- Orden 
- Activo (toggle) 
- Acciones: 
  - Editar
  - Activar / Desactivar 

Formulario Agregar Destino / Editar

Campos:

- Moneda** 
  - combo desde ef\_monedas

    **Endpoint**:

    **GET /monedas/GetCombo?activo=true**

- Título:
  - Opcional, pero recomendado
  - Por ejemplo (“Novia (ARS)”, “Exterior (EUR)”)
- Datos para transferir:
  - textarea grande
  - obligatorio
  - Ejemplos:
    - ARS: 
      - Alias: boda.juanymaria 
      - CBU: 2850590940090418135201 
    - EUR: 
      - IBAN: ES12 3456 7890 1234 5678 9012 
      - SWIFT: CAIXESBBXXX 
    - USD: 
      - Account: 123456789 
      - Routing: 021000021 
- Instrucciones
  - textarea corto
  - opcional
  - Ejemplo: “Boda + Nombre”
- Orden:
  - numérico
- Activo:
  - Toggle	
- Botón **Guardar**:

**Endpoint**:

**POST** **/eventos/{id\_evento}/regalos/transferencias**

`	`Para Guardar un registro nuevo: "id\_evento\_regalo\_transferencia": **null**

Ejemplo:

POST** /eventos/84/regalos/transferencias

JSON Ejemplo 1:

{

`  `"id\_evento\_regalo\_transferencia": **null**,

`  `"codigo\_moneda": "ARS",

`  `"titulo": "Novia (ARS)",

`  `"datos\_transferencia\_texto": "Alias: novia.boda.2026\nCBU: 2850590940090418135201",

`  `"instrucciones": "Incluir Concepto: BODA + Nombre",

`  `"orden": 1,

`  `"activo": **true**

}

Respuesta:

{

`    `"id\_evento\_regalo\_transferencia": 1,

`    `"id\_evento": 84,

`    `"codigo\_moneda": "ARS",

`    `"titulo": "Novia (ARS)",

`    `"datos\_transferencia\_texto": "Alias: novia.boda.2026\nCBU: 2850590940090418135201",

`    `"instrucciones": "Incluir Concepto: BODA + Nombre",

`    `"orden": 1,

`    `"activo": **true**

}

JSON Ejemplo 2:

{

`  `"id\_evento\_regalo\_transferencia": **null**,

`  `"codigo\_moneda": "ARS",

`  `"titulo": "Novio",

`  `"datos\_transferencia\_texto": "Alias: novio.alias\nCBU: 2222222222222222222222",

`  `"instrucciones": "Incluir Concepto: BODA + Nombre",

`  `"orden": 2,

`  `"activo": **true**

}

JSON Ejemplo 3:

{

`  `"id\_evento\_regalo\_transferencia": **null**,

`  `"codigo\_moneda": "EUR",

`  `"titulo": "Exterior (EUR)",

`  `"datos\_transferencia\_texto": "IBAN: ES12 3456 7890 1234 5678 9012\nSWIFT/BIC: CAIXESBBXXX",

`  `"instrucciones": "Concepto: BODA + Nombre",

`  `"orden": 2,

`  `"activo": **true**

}

Botón “**Editar**” (grilla)

**Endpoint**:

**POST** **/eventos/{id\_evento}/regalos/transferencias**

Es el mismo endpoint que para Guardar un registro nuevo, sólo que hay que completar el id\_evento\_regalo\_transferencia en el json

Ejemplo:

POST** /eventos/84/regalos/transferencias

JSON

{

`  `"id\_evento\_regalo\_transferencia": 2,

`  `"codigo\_moneda": "ARS",

`  `"titulo": "Novio",

`  `"datos\_transferencia\_texto": "Alias: novio.alias\nCBU: 2222222222222222222222",

`  `"instrucciones": "Incluir Concepto: BODA + Nombre o Club",

`  `"orden": 2,

`  `"activo": **true**

}


Reglas UI:

- Permitir crear varios destinos. 
- Ordenar por orden. 
- Mostrar primero los destinos “activos”. 

**Activar/Desactivar** (grilla)

**Endpoint**:

**PUT** **/eventos/{id\_evento}/regalos/transferencias/{id\_evento\_regalo\_transferencia}/activo?activo=false**

Ejemplo:

PUT /eventos/84/regalos/transferencias/2/activo?activo=false (o true para activar)

Respuesta:

{

`    `"ok": **true**

}

#
# Submódulo Lista de Regalos 

Objetivo

Que el organizador cargue items “genéricos” (sin precio/link obligatorio) y que el invitado pueda **reservar** para evitar duplicados.

**Nota**: Seguir las Reglas de habilitación (por plan / add-on) detalladas más arriba para ver si corresponde ver este submódulo o no.

**Card “Lista de regalos”**

(por ejemplo al lado de Equipo y Staff)

![](Aspose.Words.1cac8b6f-8472-463d-b85f-38608b7586c0.001.png)

Al hacer clic se abre una pantalla Lista de Regalos:

Arriba:

Botón **“Agregar ítem de Regalo”**

Grilla 

**Endpoint:**

**GET /eventos/{id\_evento}/regalos/lista**

Ejemplo:

GET /eventos/91/regalos/lista

Respuesta:

[

`    `{

`        `"id\_regalo\_item": 1,

`        `"id\_evento": 91,

`        `"titulo": "Libro infantil",

`        `"descripcion": "Cuentos / lectura inicial",

`        `"cantidad\_total": 2,

`        `"cantidad\_reservada": 0,

`        `"cantidad\_disponible": 2,

`        `"orden": 1,

`        `"visible": **true**,

`        `"activo": **true**

`    `},

- Orden** 
- Título** 
- Descripción (opcional) 
- Cantidad total** 
- Reservadas 
- Disponibles 
- Visible (toggle) 

**Endpoint**

**PUT /eventos/{id\_evento}/regalos/lista/{id\_regalo\_item}/visible?visible=true|false**

`	`Ejemplo

`	`PUT / eventos/91/regalos/lista/1/visible?visible=false

- Acciones: 
  - Editar 
  - Duplicar? El endpoint está, no es necesario implementarlo


Botón **Agregar Item de Regalo**:

- Título
  - obligatorio
  - tipo: input text 
  - valida: no vacío 
- Descripción 
  - Opcional
  - tipo: textarea corta 
  - ej: “80 a 150 piezas” 
- Cantidad total 
  - obligatorio
  - tipo: número entero 
  - valida: >= 1 
- Permitir excedente 
  - opcional
  - tipo: toggle 
  - default: false 
  - Significa: si ya se reservó todo, ¿dejás reservar igual? 
- Orden 
  - obligatorio
  - tipo: número entero 
  - default sugerido: último+1 
  - valida: >= 1 
- Visible 
  - obligatorio
  - tipo: toggle 
  - default: true 
  - Esto controla si se muestra al invitado. 
- Botones**:**
  - Guardar 

**Endpoint** 

**POST /eventos/{id\_evento}/regalos/lista**

Ejemplo:

POST /eventos/91/regalos/lista



JSON:

{

`  `"id\_regalo\_item": **null**,

`  `"titulo": "Juego de mesa",

`  `"descripcion": "Tipo UNO / memoria / cartas",

`  `"cantidad\_total": 1,

`  `"permitir\_excedente": **false**,

`  `"orden": 3,

`  `"visible": **true**

}

- Cancelar 

Acciones: Editar

**Endpoint** para precargar modal:

**GET /eventos/{id\_evento}/regalos/lista/{id\_regalo\_item}**

Ejemplo

GET /eventos/91/regalos/lista/2

Muestra los mismos campos que el formulario de alta

**Endpoint** para guardar cambios:

**PUT /eventos/{id\_evento}/regalos/lista/{id\_regalo\_item}**

`	`Ejemplo

PUT /eventos/91/regalos/lista/8

`	`JSON

{

`  `"titulo": "Bicicleta / casco",

`  `"descripcion": "Consultar en bicicleteria Bike que está reservado",

`  `"cantidad\_total": 1,

`  `"permitir\_excedente": **false**,

`  `"orden": 8,

`  `"visible": **true**

}


Acciones: Duplicar (opcional)

En una fila de lista de regalos (ej “Libro infantil”), botón **Duplicar**.

Qué debería pasar en backend:

- Se crea un nuevo item copiando: 

titulo, descripcion, cantidad\_total, permitir\_excedente, url\_referencia, imagen\_url, visible 

- El orden del nuevo item se pone: 

orden = (max orden del evento) + 1 (así cae al final) 

- No copia reservas: las reservas están asociadas al item original. 

El front refresca la grilla y aparece el duplicado. 

Esto te sirve muchísimo cuando el organizador arma listas parecidas o quiere “mismo item con otra variación”.

**Endpoint**:

**POST /eventos/{id}/regalos/lista/{id\_regalo\_item}/duplicar**

Ejemplo

POST /eventos/91/regalos/lista/8/duplicar

Respuesta

{

`    `"id\_regalo\_item": 9,

`    `"id\_evento": 91,

`    `"titulo": "Bicicleta / casco",

`    `"descripcion": "Consultar en bicicleteria Bike que está reservado",

`    `"cantidad\_total": 1,

`    `"cantidad\_reservada": 0,

`    `"cantidad\_disponible": 1,

`    `"orden": 9,

`    `"visible": **true**,

`    `"activo": **true**

}


# Submódulo Fondo / Metas con barra 
Objetivo

El organizador crea un “Fondo” (encabezado) y varias “Metas” (items con objetivo).

El invitado transfiere por fuera y registra “yo aporté X”.

El organizador confirma y eso alimenta la barra.

**Nota**: Seguir las Reglas de habilitación (por plan / add-on) detalladas más arriba para ver si corresponde ver este submódulo o no.

**Card “Fondo / Metas”**

(por ejemplo al lado de Lista de Regalos, o en esa sección para que se entienda)

Al hacer clic se abre una pantalla Fondo / Metas, con varias secciones:

Sección Configuración del fondo 

(se permite 1 solo fondo por evento)

Primero se carga el fondo

**Endpoint**

**GET /eventos/{id\_evento}/regalos/fondo** 

Si no hay fondo activo, devuelve null. \
UI: mostrar “Aún no creaste un fondo” + botón “**Crear**”.

Botón **Crear**:

Se muestran los campos tipo cabecera:

- Título
  - Obligatorio
  - input text 
  - valida no vacío 
- Descripción pública
  - Opcional
  - Textarea corta
  - Se muestra en el portal del invitado debajo del título
- Moneda base 
  - Obligatorio
  - Combo de monedas

    **Endpoint**:

    **GET /monedas/GetCombo?activo=true**

- Modo confirmación 
  - Obligatorio
  - Combo hardcodeado en UI:
    - INVITADO\_Y\_ORGANIZADOR (default) 
    - SOLO\_ORGANIZADOR (para usar a futuro) 
- Permitir excedente
  - Toggle
  - Corresponde al campo permitir\_exedente en fondo
- Mostrar pendientes
  - Toggle
  - si está ON, en metas se calcula total\_pendiente sumando aportes DECLARADO o PENDIENTE\_CONFIRMACION
- Mostrar muro de mensajes:
  - Toggle
  - Campo mostrar\_muro\_mensajes
- Permitir anónimo
  - Toggle
  - Campo permitir\_anonimo
- Activo 
  - Toggle
  - si está apagado, el fondo no sale en el público
- Botón:
  - Guardar fondo 

    **Endpoint**

    **POST /eventos/{id\_evento}/regalos/fondo**

Ejemplo

POST /eventos/93/regalos/fondo

JSON

{

`  `"id\_fondo": **null**,

`  `"titulo": "Ayudanos con la luna de miel ✨",

`  `"descripcion\_publica": "Elegí una experiencia y aportá lo que quieras.",

`  `"moneda\_base": "EUR",

`  `"modo\_confirmacion": "INVITADO\_Y\_ORGANIZADOR",

`  `"mostrar\_pendientes": **true**,

`  `"permitir\_anonimo": **true**,

`  `"activo": **true**

}

Respuesta

{

`    `"id\_fondo": 1,

`    `"id\_evento": 93,

`    `"titulo": "Ayudanos con la luna de miel ✨",

`    `"descripcion\_publica": "Elegí una experiencia y aportá lo que quieras.",

`    `"moneda\_base": "EUR",

`    `"modo\_confirmacion": "INVITADO\_Y\_ORGANIZADOR",

`    `"permitir\_excedente": **true**,

`    `"mostrar\_pendientes": **true**,

`    `"mostrar\_muro\_mensajes": **true**,

`    `"permitir\_anonimo": **true**,

`    `"activo": **true**

}

Importante: el Upsert **edita el fondo activo** del evento o crea uno nuevo si no existe

Sección Metas

Traer fondo (para obtener id\_fondo para poder crear las metas):

**Endpoint**

**GET /eventos/{id\_evento}/regalos/fondo**

Ejemplo:

GET /eventos/93/regalos/fondo

Respuesta

{

`    `"id\_fondo": 1,

`    `"id\_evento": 93,

`    `"titulo": "Ayudanos con la luna de miel ✨",

`    `"descripcion\_publica": "Elegí una experiencia y aportá lo que quieras.",

`    `"moneda\_base": "EUR",

`    `"modo\_confirmacion": "INVITADO\_Y\_ORGANIZADOR",

`    `"permitir\_excedente": **true**,

`    `"mostrar\_pendientes": **true**,

`    `"mostrar\_muro\_mensajes": **true**,

`    `"permitir\_anonimo": **true**,

`    `"activo": **true**

}

*Guardar id\_fondo*.

Botón arriba “**Agregar meta”**

**Endpoint**

**GET /eventos/{id\_evento}/regalos/fondo/metas**

Grilla:

- Orden 
- Título 
- Objetivo monto 
- Confirmado (campo total\_confirmado)
- Pendiente (campo total\_pendiente, solo si fondo.mostrar\_pendientes = true)
- % (porcentaje \* 100)
- Visible (toggle) 
  - **Endpoint**

**PUT /eventos/{id\_evento}/regalos/fondo/metas/{id\_meta}/visible?visible=false**

Ejemplo:

PUT /eventos/93/regalos/fondo/metas/1/visible?visible=false

- Activo (badge, hoy sólo se crean activas) 
- Acciones: 
  - Editar 
###
**Botón Agregar Meta**

Abre un formulario con los siguientes Campos:

- **Título** 
  - obligatorio
- **Descripción** 
  - opcional
- **Objetivo monto** 
  - Obligatorio
  - decimal > 0
- **Orden** 
  - numérico
- **Visible** 
  - Toggle
  - default true
- **Tipo meta** 
  - opcional / default
  - backend la define como default "GENERICA" si viene null
  - por ahora no mostrarla en el formulario o no editable  por UI (porque aún no tenemos desarrollado un circuito para el tipo por eso usamos genérica)
- **id\_fondo** 
  - hidden, sale de GET fondo
- Botón **Guardar**

**Endpoint**

**POST /eventos/{id\_evento}/regalos/fondo/metas**

Ejemplo:

POST /eventos/93/regalos/fondo/metas 

JSON 

{

`  `"id\_meta": **null**,

`  `"id\_fondo": 1,

`  `"tipo\_meta": "GENERICA",

`  `"titulo": "Hotel",

`  `"descripcion": "3 noches",

`  `"objetivo\_monto": 500,

`  `"orden": 1,

`  `"visible": **true**

}

Respuesta

{

`    `"id\_meta": 1,

`    `"id\_evento": 93,

`    `"id\_fondo": 1,

`    `"tipo\_meta": "GENERICA",

`    `"titulo": "Hotel",

`    `"descripcion": "3 noches",

`    `"objetivo\_monto": 500.0,

`    `"total\_confirmado": 0.0,

`    `"total\_pendiente": 0.0,

`    `"porcentaje": 0.0,

`    `"orden": 1,

`    `"visible": **true**,

`    `"activo": **true**

}

**Acción grilla: Editar**

Permite que el organizador modifique una meta existente del fondo (por ejemplo cambiar el objetivo, el título, el orden o si está visible).

Se abre un modal “Editar meta”:

- se precarga con los valores de esa fila (no hace falta endpoint “GetById” porque el GET de metas ya devuelve todo lo necesario). 
- El front toma el item seleccionado (id\_meta) y llena el modal con:
  - titulo 
  - descripcion 
  - objetivo\_monto 
  - orden 
  - visible 
  - Botón Guardar:

**Endpoint**

**PUT /eventos/{id\_evento}/regalos/fondo/metas/{id\_meta}**

id\_evento viene del contexto del evento 

id\_meta viene de la fila seleccionada 

Ejemplo:

PUT /eventos/93/regalos/fondo/metas/1

{

`  `"titulo": "Hotel",

`  `"descripcion": "4 noches",

`  `"objetivo\_monto": 700,

`  `"orden": 1,

`  `"visible": **true**,

`  `"url\_referencia": **null**,

`  `"imagen\_url": **null**

}

Volver a cargar grilla y datos del fondo.


Sección Aportes 

Objetivo

Permitir al organizador:

- Ver aportes **declarados** por invitados (pendientes de confirmación) 
- Confirmarlos con el **monto base calculado** (y tipo de cambio si aplica) 
- Consultar aportes ya **confirmados**

El formulario podría tener 2 tabs:

- Aportes Pendientes Confirmación
- Aportes Confirmados

*Tab Aportes Pendientes Confirmación*

Muestra una grilla con los siguientes campos:

**Endpoint**

**GET /eventos/{id\_evento}/regalos/fondo/aportes?estado=DECLARADO**

Ejemplo:

GET /eventos/93/regalos/fondo/aportes?estado=DECLARADO

Respuesta:

[

`    `{

`        `"id\_aporte": 1,

`        `"id\_evento": 93,

`        `"id\_fondo": 1,

`        `"id\_meta": 2,

`        `"meta\_titulo": "Cena especial",

`        `"estado": "DECLARADO",

`        `"monto\_aporte": 50.00,

`        `"moneda\_aporte": "EUR",

`        `"monto\_base\_calculado": **null**,

`        `"tipo\_cambio\_usado": **null**,

`        `"nombre\_mostrado": "Nico",

`        `"es\_anonimo": **false**,

`        `"mensaje": "Que la pasen increíble",

`        `"mostrar\_en\_muro": **true**,

`        `"fecha\_declara": "2026-06-06T00:14:42.204588+00:00",

`        `"fecha\_confirma": **null**,

`        `"id\_usuario\_confirma": **null**,

`        `"activo": **true**

`    `}

]

- **Fecha** 
  - Campo fecha\_declara 
- **Meta** 
  - Campo meta\_titulo 
- **Invitado** 
  - si es\_anonimo=true mostrar “Anónimo” 
  - si no, nombre\_mostrado o “(sin nombre)” 
- **Monto declarado** 
  - monto\_aporte + moneda\_aporte 
- **Mensaje** 
  - Campo mensaje (truncarlo para que entre en la grilla)
- **Mostrar en muro** 
  - Campo mostrar\_en\_muro
  - bool 
  - es un flag que queda para futuro para mostrar mensajes tales como:

“Nico aportó a Hotel - ‘Que la pasen increíble’” 

“Anónimo aportó a Excursión…”

- por ahora podemos dejarlo fijo en false hasta que implementemos el muro y la moderación
- **Estado** 
  - Campo estado (“DECLARADO”) 
- **Acción**: 
  - botón **Confirmar** **Aporte**

Al hacer clic en el botón **Confirmar Aporte**:

Se abre un form o modal en donde el organizador confirma el **monto real** que se va a sumar al progreso de la meta (barra). Lo que declara el invitado es solo una referencia; el progreso se calcula con lo confirmado.

Datos de solo lectura (del aporte)

- Meta 
  - Campo meta\_titulo
- Invitado
  - si es\_anonimo=true → mostrar “Anónimo” 
  - si no → nombre\_mostrado (o “Sin nombre”)
- Monto declarado: 
  - monto\_aporte + moneda\_aporte
- Mensaje 
  - Campo mensaje si existe
- Fecha declaración:
  - Campo fecha\_declara

Agregar texto fijo:

Nota: “Monto declarado” es lo que el invitado dijo que iba a transferir. Puede no coincidir con lo recibido.

Campos editables (los que se envían al backend)

- Monto confirmado en moneda base
  - Campo monto\_base\_calculado
  - tipo: decimal 
  - obligatorio 
  - validación: > 0 
  - etiqueta sugerida: Monto confirmado en + moneda\_base (sale de fondo.moneda\_base)
  - explicación visible en UI: “Este monto es el que se suma al progreso de la meta.** Si el comprobante/transferencia difiere de lo declarado, confirmá el monto real recibido.”
- Tipo de cambio usado** (opcional)
- Campo** tipo\_cambio\_usado
- tipo: decimal (opcional) 
- solo mostrarlo si moneda\_aporte != moneda\_base 
- explicación visible en UI: “Solo para dejar registro de cómo convertiste a moneda base.”
- ejemplo: invitado declaró 10 USD, base es EUR
  - monto\_base\_calculado = 9.20
  - tipo\_cambio\_usado= 0.92 
- Botones
  1. Confirmar 
  1. Cancelar 

Botón **Confirmar aporte** (guardar)

**Endpoint**

**POST /eventos/{id\_evento}/regalos/fondo/aportes/{id\_aporte}/confirmar**

Ejemplo (misma moneda):

POST /eventos/93/regalos/fondo/aportes/1/confirmar

JSON

{

`  `"monto\_base\_calculado": 30,

`  `"tipo\_cambio\_usado": **null**

}

Ejemplo con otra moneda:

POST /eventos/93/regalos/fondo/aportes/3/confirmar

{

`  `"monto\_base\_calculado": 9.20,

`  `"tipo\_cambio\_usado": 0.92

}

Respuesta	

{

`    `"ok": **true**

}
##
##
El front:

- Cierra modal 
- Muestra mensaje breve ”Aporte confirmado”
- Refresca grilla pendientes: 
  - GET /eventos/{id\_evento}/regalos/fondo/aportes?estado=DECLARADO (para que desaparezca de pendientes)
- Refresca grilla confirmados:
  - GET /eventos/{id\_evento}/regalos/fondo/aportes?estado=CONFIRMADO 
- Refresca metas (para actualizar barras): 
  - GET /eventos/{id\_evento}/regalos/fondo/metas 

*Tab Aportes Confirmados*

**Endpoint:**

**GET /eventos/{id\_evento}/regalos/fondo/aportes?estado=CONFIRMADO** 

Grilla:

- Fecha declara** (fecha\_declara)** 
- Fecha confirma** (fecha\_confirma) 
- Meta** (meta\_titulo) 
- Invitado** (anónimo o nombre\_mostrado) 
- Monto declarado** (monto\_aporte + moneda\_aporte)** 
- Monto confirmado base** (monto\_base\_calculado) (en moneda base)** 
- Tipo cambio** (tipo\_cambio\_usado) (opcional) 
- Mensaje** (mensaje) (opcional)** 
- Confirmado por** (id\_usuario\_confirma)** 


# Parte pública
Introducción

- El invitado entra a la invitación para confirmar asistencia con URL tipo [https://eventiaapp.vercel.app/rsvp/{rsvp_token}?idAcceso=111](https://eventiaapp.vercel.app/rsvp/%7brsvp_token%7d?idAcceso=111) 

- El backend público se consume con GET /public/invitados/{rsvp\_token}/regalos 
- Acciones públicas con respecto a regalos: 
  - POST /public/regalos/lista/reservar 
  - POST /public/regalos/fondo/aportar 

Para pruebas:

El evento 93 tiene transferencias, lista de regalos, y fondos/metas

Token de un invitado al evento 93: vqtfqZwkrSaa1NWcUsY24PuGQruHrJQRZNNhuDB8A4lyYn4LV5nR3CWDNnfynCYU


Carga inicial (1 sola llamada)

**Endpoint**

**GET /public/invitados/{rsvp\_token}/regalos** 

Cuándo se llama:

- Al entrar a la pestaña/sección “Regalos” dentro del portal. 
- Al entrar a la invitación RSVP
- Cada vez que el invitado vuelve a esta sección y se quiere refrescar estado


**SUBMÓDULO 1: TRANSFERENCIAS (Invitado)**

Objetivo

Mostrar al invitado **a dónde transferir** (uno o varios destinos), con un texto introductorio del organizador y tarjetas por moneda/destino. Esto se usa tanto para:

- “si querés hacernos un regalo, transferinos…” 
- “no nos hagas regalo, doná a esta ONG/hospital…”

Ejemplo de response:

{

`    `"id\_evento": 93,

`    `"id\_invitado": 279,

`    `"rsvp\_token": "vqtfqZwkrSaa1NWcUsY24PuGQruHrJQRZNNhuDB8A4lyYn4LV5nR3CWDNnfynCYU",

`    `"mostrar\_transferencias": **true**,

`    `"mostrar\_lista": **true**,

`    `"mostrar\_fondo": **true**,

`    `"transferencias": [

`        `{

`            `"codigo\_moneda": "ARS",

`            `"titulo": "Novia (ARS)",

`            `"datos\_transferencia\_texto": "Alias: novia.boda.2026\nCBU: 2850590940090418135201",

`            `"instrucciones": "Incluir Concepto: BODA + Nombre",

`            `"orden": 1

`        `},

`        `{

`            `"codigo\_moneda": "EUR",

`            `"titulo": "Exterior (EUR)",

`            `"datos\_transferencia\_texto": "IBAN: ES12 3456 7890 1234 5678 9012\nSWIFT/BIC: CAIXESBBXXX",

`            `"instrucciones": "Concepto: BODA + Nombre",

`            `"orden": 2

`        `}

`    `],

`    `"transferencias\_config": {

`        `"titulo": "Regalos",

`        `"texto\_intro": **null**

`    `},



Qué hace el front con la respuesta del GET público de regalos:

- Si mostrar\_transferencias = false → **NO mostrar** el bloque “Cómo transferir / Transferencias”. 
- Si mostrar\_transferencias = true → **mostrar** el bloque usando: 
  - transferencias\_config (encabezado) 
  - transferencias[] (destinos)

Este bloque se renderiza cuando mostrar\_transferencias=true.

Encabezado: 

Viene en transferencias\_config:

- transferencias\_config.titulo
  - Ej: “Regalos”, “Donaciones” 
- transferencias\_config.texto\_intro (opcional)
  - Ej: “Si querés hacernos un regalo…”, “No nos hagas regalo, doná a…” 

Cómo mostrarlo:

- Título grande: campo titulo 
- Texto abajo más chico: campo texto\_intro si viene con contenido 

Importante: aunque no haya destinos cargados, el config puede venir igual. Si transferencias[] está vacío, se muestra el encabezado y un texto: “*Aún no se cargaron datos de transferencia*.”

Listado de destinos (cards)

Viene en transferencias[] ordenado por orden.

Cada item trae:

- codigo\_moneda (ARS/EUR/USD…) 
- titulo (opcional: “Novia”, “Novio”, “Exterior”, “Hospital de niños”, “ONG perros”) 
- datos\_transferencia\_texto (textarea pegado por el organizador; puede tener saltos de línea) 
- instrucciones (opcional) 
- orden 

Qué muestra cada card:

- Badge/Chip moneda: 
  - codigo\_moneda 
- Título de destino (si existe): 
  - titulo 
- Caja de texto con: 
  - datos\_transferencia\_texto (respetar saltos de línea) 
- Texto chico: 
  - instrucciones 



**SUBMÓDULO 2: LISTA DE REGALOS (Invitado)**

Objetivo

Que el invitado vea una lista de regalos y pueda **reservar** uno (o varios si cantidad\_total > 1), dejando un **mensaje** y pudiendo hacerlo **anónimo**.

Carga inicial (1 sola llamada, tal como se explicó en la sección submódulo 1, al inicio y al refrescar estado)

**Endpoint**

GET /public/invitados/{rsvp\_token}/regalos 

Qué hace el front con la respuesta del GET público de regalos:

- Si mostrar\_lista = false → NO mostrar el bloque “Lista de regalos”
- Si mostrar\_lista = true → mostrar el bloque con lista.items

  {

  `    `"id\_evento": 93,

  `    `"id\_invitado": 279,

  `    `"rsvp\_token": "vqtfqZwkrSaa1NWcUsY24PuGQruHrJQRZNNhuDB8A4lyYn4LV5nR3CWDNnfynCYU",

  `    `"mostrar\_transferencias": **true**,

  `    `"**mostrar\_lista**": **true**,

  `    `"mostrar\_fondo": **true**,

Nota: esta pantalla también muestra transferencias y fondo si vienen prendidos, pero acá nos enfocamos en lista.

Título del bloque: **“Lista de regalos”** 

Debajo: 

- cards 

  o 

- filas por cada item en lista.items[]. 

  "lista": {

  `        `"items": [

  `            `{

  `                `"id\_regalo\_item": 7,

  `                `"titulo": "Vestido de novia",

  `                `"descripcion": "A coordinar modista",

  `                `"cantidad\_total": 1,

  `                `"cantidad\_reservada": 0,

  `                `"cantidad\_disponible": 1,

  `                `"orden": 7

  `            `},

  `            `{

  `                `"id\_regalo\_item": 8,

  `                `"titulo": "Lampara de pie",

  `                `"descripcion": "Consultar en Deco Home, stilo boho",

  `                `"cantidad\_total": 1,

  `                `"cantidad\_reservada": 0,

  `                `"cantidad\_disponible": 1,

  `                `"orden": 8

  `            `},

  `            `{

  `                `"id\_regalo\_item": 9,

  `                `"titulo": "Juego de platos",

  `                `"descripcion": "Solo playos, de color blanco (6)",

  `                `"cantidad\_total": 1,

  `                `"cantidad\_reservada": 0,

  `                `"cantidad\_disponible": 1,

  `                `"orden": 9

  `            `}

  `        `]

  `    `},

Qué campos mostrar por item 

- Título
  - campo titulo, si es una card mostrarlo grande 
  - ejemplo: Lámpara de pie
- Descripción 
  - Campo descripcion
  - si viene, texto secundario si es una card
- Estado (badge): 
  - Si cantidad\_disponible > 0 → “Disponible” 
  - Si cantidad\_disponible == 0 → “Reservado / Completo” 
- Disponibles: 
  - Campo cantidad\_disponible 
- Total: 
  - Campo cantidad\_total (opcional si queda mucha info)
- Botones por ítem:
  - Si cantidad\_disponible > 0 → botón **“Reservar”** 
  - Si cantidad\_disponible == 0 → botón deshabilitado o no mostrar. 

Flujo “Reservar” 

- Por ejemplo la tía Ana reserva la lámpara de pie.
- Hace click en el botón “Reservar” del item
- El front abre un modal:

Modal: “Reservar regalo”:

- Nombre a mostrar 
  - Campo nombre\_mostrado
  - tipo: input text 
  - obligatorio recomendado: sí (si no, usar placeholder “Invitado”) 
  - default sugerido: si en porta tenemos el nombre del invitado, precargarlo, en la invitación rsvp no lo tenemos todavía.
- Anónimo 
  - Campo es\_anonimo
  - tipo: checkbox/toggle 
  - default: false 
  - si el usuario marca “Anónimo”, igual puede completar nombre, pero el sistema debería mostrar “Anónimo” en los listados. 
- Cantidad 
  - Campo cantidad
  - numérico 
  - mostrar solo si cantidad\_total > 1 
  - min: 1 
  - max recomendado: cantidad\_disponible 
- Mensaje 
  - Campo mensaje
  - tipo: textarea
  - opcional 
  - placeholder: “Dejá un mensaje para los anfitriones…” 
- **Botones:**
  - Cancelar 
  - Confirmar reserva 

Confirmar reserva:

**Endpoint**

**POST /public/regalos/lista/reservar** 

Body JSON

- El front no inventa id\_evento: lo toma de la **respuesta del GET principal de Regalos** (GET /public/invitados/{rsvp\_token}/regalos).
- id\_regalo\_item lo toma del item clickeado dentro de lista.items.
- rsvp\_token lo toma de la URL (o del mismo GET que es más seguro).
- id\_invitado no hace falta enviarlo; si lo enviás, también sale de esa misma respuesta.

{

`  `"id\_evento": 93,

`  `"id\_regalo\_item": 8,

`  `"rsvp\_token": "vqtfqZwkrSaa1NWcUsY24PuGQruHrJQRZNNhuDB8A4lyYn4LV5nR3CWDNnfynCYU",

`  `"nombre\_mostrado": "Tía Ana",

`  `"es\_anonimo": **false**,

`  `"cantidad": 1,

`  `"mensaje": "Felicidadesssss!"

}

Respuesta:

{

`    `"id\_reserva": 1,

`    `"id\_evento": 93,

`    `"id\_regalo\_item": 8,

`    `"cantidad": 1,

`    `"estado": "RESERVA\_ACTIVA",

`    `"mensaje": "Felicidadesssss!",

`    `"fecha\_reserva": "2026-06-05T23:02:28.5715366+00:00"

}
###
**Importantísimo! Refrescar!**

Después de reservar, el front debe:

- Cerrar el modal de reserva. 
- Mostrar un toast: “Reserva realizada”. 
- Refrescar la sección Regalos volviendo a llamar al endpoint principal: 

GET /public/invitados/{rsvp\_token}/regalos 

Para que se actualicen cantidad\_disponible y el estado del ítem (Disponible/Completo) en pantalla.

Y con eso:

- se actualiza cantidad\_disponible del item (baja) 
- si el item quedó en 0, el botón se deshabilita. 

Este refresh es clave para evitar estados “fantasma” si otro invitado reservó casi al mismo tiempo.



**SUBMÓDULO 3: FONDO / METAS (Invitado)**

Objetivo

Que el invitado elija una **meta** (Hotel, Excursión, etc.), transfiera por fuera, y registre su aporte con un mensaje. El organizador lo confirma y eso impacta en la barra.

Carga inicial (1 sola llamada, tal como se explicó en la sección submódulo 1, al inicio y al refrescar estado)

**Endpoint**

GET /public/invitados/{rsvp\_token}/regalos 

Qué hace el front con la respuesta del GET público de regalos:

- Si mostrar\_fondo = false → no mostrar bloque “Fondo” 
- Si mostrar\_fondo = true → mostrar fondo.config y fondo.metas 

  {

  `    `"id\_evento": 93,

  `    `"id\_invitado": 279,

  `    `"rsvp\_token": "vqtfqZwkrSaa1NWcUsY24PuGQruHrJQRZNNhuDB8A4lyYn4LV5nR3CWDNnfynCYU",

  `    `"mostrar\_transferencias": **true**,

  `    `"mostrar\_lista": **true**,

  `    `"**mostrar\_fondo**": **true**,


Título del bloque: **“Fondo / Aportes / Metas”** 

Debajo y de aquí salen los datos:

"fondo": {

`        `"config": {

`            `"id\_fondo": 1,

`            `"titulo": "Ayudanos con la luna de miel ✨",

`            `"descripcion\_publica": "Elegí una experiencia y aportá lo que quieras.",

`            `"moneda\_base": "EUR",

`            `"modo\_confirmacion": "INVITADO\_Y\_ORGANIZADOR",

`            `"mostrar\_pendientes": **true**,

`            `"permitir\_anonimo": **true**

`        `},

- Título:
  - campo fondo.config.titulo 	
- Descripción: 
  - Campo fondo.config.descripcion\_publica (si viene) 
- Moneda base (opcional mostrar): 
  - Campo fondo.config.moneda\_base 
###
###
Listado de metas (cards?)

"metas": [

`            `{

`                `"id\_meta": 1,

`                `"titulo": "Hotel",

`                `"descripcion": "3 noches",

`                `"objetivo\_monto": 500.00,

`                `"total\_confirmado": 0.0,

`                `"total\_pendiente": 0.0,

`                `"porcentaje": 0.0,

`                `"orden": 1

`            `},

`            `{

`                `"id\_meta": 2,

`                `"titulo": "Cena especial",

`                `"descripcion": "Una noche",

`                `"objetivo\_monto": 80.00,

`                `"total\_confirmado": 0.0,

`                `"total\_pendiente": 0.0,

`                `"porcentaje": 0.0,

`                `"orden": 2

`            `},

`            `{

`                `"id\_meta": 3,

`                `"titulo": "Excursión",

`                `"descripcion": "Isla bonita",

`                `"objetivo\_monto": 100.00,

`                `"total\_confirmado": 0.0,

`                `"total\_pendiente": 0.0,

`                `"porcentaje": 0.0,

`                `"orden": 3

`            `},

`            `{

`                `"id\_meta": 4,

`                `"titulo": "Traslados",

`                `"descripcion": "Aeropuerto / transfers",

`                `"objetivo\_monto": 60.00,

`                `"total\_confirmado": 0.0,

`                `"total\_pendiente": 0.0,

`                `"porcentaje": 0.0,

`                `"orden": 4

`            `}

`        `]

Por cada meta mostrar:

- titulo 
- descripcion (si viene) 
- Objetivo: objetivo\_monto + moneda base 
- Progreso confirmado 
  - barra: porcentaje (0..1) \* 100 
  - texto: total\_confirmado / objetivo\_monto 
- Pendiente (solo si fondo.config.mostrar\_pendientes = true) 
  - texto: “Pendiente: total\_pendiente” 
- Botón **“Aportar”** 
  - siempre habilitado? salvo que decidamos deshabilitar metas completadas
  - Si porcentaje == 1: podemos mostrar “Completado” y deshabilitar 

Al hacer click en el botón “**Aportar**”, se abre modal para esa meta:

“Aportar a {titulo + descripcion}”

Campos:

- Monto 
  - Campo monto\_aporte
  - input decimal 
  - obligatorio 
  - validación: > 0 
- Moneda del aporte 
  - Campo moneda\_aporte
  - combo get monedas 
  - obligatorio si modo\_confirmacion = INVITADO\_Y\_ORGANIZADOR 
  - recomendación front: default: fondo.config.moneda\_base 
- Nombre a mostrar 
  - Campo nombre\_mostrado
  - input text 
  - opcional, pero recomendado 
  - si el invitado tiene nombre, precargar pero en esta instancia todavía no lo tenemos
- Anónimo 
  - Campo es\_anonimo
  - toggle 
  - default false 
- Mensaje 
  - Campo mensaje
  - textarea 
  - opcional 
- Texto fijo debajo del form:
  - “Transferí por fuera usando los datos de transferencia del evento. Luego confirmaremos tu aporte.” 
- Botones:
  - Cancelar 
  - Enviar aporte 

Botón Enviar Aporte

**Endpoint**

**POST /public/regalos/fondo/aportar** 

Body JSON ejemplo

{

`  `"id\_evento": 93,

`  `"id\_fondo": 1,

`  `"id\_meta": 2,

`  `"rsvp\_token": "vqtfqZwkrSaa1NWcUsY24PuGQruHrJQRZNNhuDB8A4lyYn4LV5nR3CWDNnfynCYU",

`  `"nombre\_mostrado": "Nico",

`  `"es\_anonimo": **false**,

`  `"monto\_aporte": 50,

`  `"moneda\_aporte": "EUR",

`  `"mensaje": "Que la pasen increíble",

`  `"mostrar\_en\_muro": **true**

}

Respuesta

{

`    `"id\_aporte": 1,

`    `"id\_evento": 93,

`    `"id\_fondo": 1,

`    `"id\_meta": 2,

`    `"estado": "DECLARADO",

`    `"monto\_aporte": 50.0,

`    `"moneda\_aporte": "EUR",

`    `"monto\_base\_calculado": **null**,

`    `"tipo\_cambio\_usado": **null**,

`    `"mensaje": "Que la pasen increíble",

`    `"es\_anonimo": **false**,

`    `"mostrar\_en\_muro": **true**,

`    `"fecha\_declara": "2026-06-06T00:14:42.2045884+00:00",

`    `"fecha\_confirma": **null**,

`    `"id\_usuario\_confirma": **null**

}

Después de enviar el aporte:

- cerrar modal 
- toast “Aporte enviado” 
- refrescar: 
  - GET /public/invitados/{rsvp\_token}/regalos

Detalle práctico: de dónde saca el front cada ID

Del **get principal**:

- id\_evento → bundle.id\_evento 
- id\_fondo → bundle.fondo.config.id\_fondo 
- id\_meta → bundle.fondo.metas[i].id\_meta 
- id\_regalo\_item → bundle.lista.items[i].id\_regalo\_item 
- rsvp\_token → del path actual (o bundle.rsvp\_token si lo incluís)




