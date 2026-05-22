# Eventia -- Programas / Eventos: STAFF

**[Conceptos]{.underline}**

[A. Equipo interno]{.underline}

Son personas con usuario real de Eventia.

Usa

-   login normal

-   token normal del usuario

-   endpoints de equipo

No usa

-   código de staff

[B. Staff operativo]{.underline}

Son personas sin usuario o que no van a usar login normal.

Usa

-   código de acceso

-   POST /staff/join

-   endpoints de staff-operativo

No usa

-   login normal para entrar a trabajar

**Programas Configuración Tab Equipo**

Esta pantalla deberá quedar partida en 2 bloques:

-   Equipo Interno

-   Staff Operativo

**Bloque Equipo Interno**:

Objetivo: Mostrar y administrar usuarios reales del sistema que operan
el programa.

Ejemplos

-   Amaia

-   coordinador

-   monitor

-   salud

Qué muestra

-   Grilla o cards con:

    -   nombre

    -   apellido

    -   email

    -   rol

    -   activo

    -   fecha alta

**Endpoint**

**GET /eventos/{idEvento}/equipo?idIdioma=1**

(idioma del programa)

Ejemplo

GET /eventos/89/equipo?idIdioma=1

Nota: Si Amaia fue la creadora del programa, backend la vincula
automáticamente, el front solo la muestra.

**Botón** **Añadir miembro interno:**

[Objetivo]{.underline}

Es el botón principal del bloque y sirve para agregar un usuario real al
programa con un rol interno.

Abre un formulario con los siguientes campos:

-   Email del usuario

    -   tipo: texto

    -   obligatorio

    -   Texto de ayuda: "Debe existir previamente como usuario de
        Eventia"

-   Rol

    -   tipo: combo

    -   obligatorio

> Endpoint:
>
> **GET /roles/combo-equipo?idIdioma=1&tipoOperacion=PROGRAMA**
>
> Qué debería devolver:
>
> Ejemplos:

-   Coorganizador del evento

-   Coordinador del evento

-   Monitor / Profesor

-   Responsable de salud

```{=html}
<!-- -->
```
-   Botón **Guardar**

> **Endpoint**
>
> **POST /eventos/{idEvento}/equipo?idIdioma=1**

JSON

> {
>
>   \"email\": \"amaia@eventosfull.com\",
>
>   \"id_rol\": 15
>
> }

Si se intentara agregar el mail con un rol ya existente el sistema emite
un error: Ese usuario ya tiene asignado ese rol en el evento

Ejemplo 2: agrego a otro usuario que ya es usuario de la cuenta:

{

  \"email\": \"martin@eventosfull.com\",

  \"id_rol\": 14

}

Respuesta:

{

    \"id_evento_usuario\": 70,

    \"id_evento\": 89,

    \"id_usuario\": 23,

    \"nombre\": \"Martin\",

    \"apellido\": \"Santos\",

    \"email\": \"martin@eventosfull.com\",

    \"id_rol\": 14,

    \"codigo_rol\": \"EVENT_COORDINATOR\",

    \"rol_texto\": \"Coordinador del evento\",

    \"activo\": **true**,

    \"fecha_alta\": \"2026-05-21T20:58:53.1049685+00:00\"

}

Ejemplo 3:

{

  \"email\": \"laura@faronorte.com\",

  \"id_rol\": 14

}

Error: El usuario no pertenece a la cuenta del evento

Ejemplo 4:

{

  \"email\": \"laura_garcia@faronorte.com\",

  \"id_rol\": 14

}

Error: No existe un usuario con ese email

Recordar que estas relaciones se guardan en:

ef_evento_usuarios

Cada fila representa:

-   id_evento

-   id_usuario

-   id_rol

La misma persona puede tener más de un rol en el mismo programa.

Ejemplo:

-   Amaia coordinadora

-   Amaia salud

## 

[Acciones por registro]{.underline} (fila si muestro en grilla o
acciones en card)

-   activar/desactivar

**Endpoint**

> **PUT /eventos/{idEvento}/equipo/{idEventoUsuario}**
>
> JSON
>
> {
>
>   \"activo\": **false**
>
> }
>
> Ejemplo:
>
> PUT /eventos/89/equipo/70

-   eliminar: Borra FISICAMENTE

> **Endpoint**
>
> **DELETE /eventos/{idEvento}/equipo/{idEventoUsuario}**
>
> Respuesta si está ok
>
> {
>
>     \"ok\": **true**
>
> }
>
> Respuesta si es owner

No se puede quitar al owner del evento/programa

> [Importante]{.underline}: controla que no sea el event_owner del
> evento/programa por backend, o el único owner activo. Muestra error:
> No se puede quitar al owner del evento/programa, y en el caso de
> inactivar: No se puede inactivar al owner del evento/programa

![](./image1.png){width="3.427561242344707in"
height="1.3231014873140858in"}

-   Quitar botón Editar

-   Poner botón Eliminar

-   Activo: toggle

-   Mostrar nombre y apellido

-   Mostrar mail

-   Mostrar el nombre del rol (en vez del código)

-   Mostrar fecha de alta

**Bloque Staff Operativo**:

[Objetivo]{.underline}

Mostrar y administrar el staff operativo asignado a ese programa.

Ejemplos

-   cocina

-   puerta

-   barra

-   seguridad

Mostrar arriba botones:

-   **Agregar desde staff de cuenta**

-   **Nuevo staff**

[Grilla]{.underline}:

**Endpoint**:

**GET /eventos/{idEvento}/staff?idIdioma=1** (idioma del programa)

Ejemplo:

GET /eventos89/staff?idIdioma=1

-   nombre

-   apellido

-   email

-   teléfono

-   rol del programa

-   código acceso

-   pantalla inicio

-   activo

-   expira

-   fecha uso

-   usos

-   acciones:

    -   activar/desactivar asignación

    -   eliminar asignación

[Botón Agregar desde staff de cuenta]{.underline}

Objetivo: Tomar una persona reusable ya existente y asignarla a este
programa con un rol.

Campos

-   Staff

    -   tipo: combo o buscador

    -   obligatorio

    -   Este combo debería mostrar staff de la cuenta ya existente.

-   Rol

    -   tipo: combo

    -   obligatorio

    -   **Endpoint**:

> **GET /roles/combo-staff?idIdioma=1&tipoOperacion=PROGRAMA**

-   Botón **Guardar**

    -   **Endpoint**

> **POST /eventos/{idEvento}/staff/desde-cuenta?idIdioma=1**

JSON

> {
>
>   \"id_staff\": 5,
>
>   \"id_rol\": 9
>
> }
>
> Respuesta:
>
> {
>
>     \"id_evento_staff\": 1,
>
>     \"id_evento\": 89,
>
>     \"id_staff\": 5,
>
>     \"nombre\": \"Andres Ariel\",
>
>     \"apellido\": \"Pérez\",
>
>     \"email\": \"andres.staff@example.com\",
>
>     \"telefono\": \"+541122334455\",
>
>     \"id_rol\": 9,
>
>     \"codigo_rol\": \"STAFF_RECEPTOR\",
>
>     \"rol_texto\": \"Puerta / Check-in\",
>
>     \"pantalla_inicio\": \"CHECKIN\",
>
>     \"codigo_acceso\": \"SARE5182\",
>
>     \"activo\": **true**,
>
>     \"fecha_expiracion\": **null**,
>
>     \"fecha_uso\": **null**,
>
>     \"usos\": 0,
>
>     \"fecha_alta\": \"2026-05-22T01:19:25.207155+00:00\"
>
> }

Qué hace

-   No crea otra persona.

-   Solo crea la asignación en ef_evento_staff.

[Botón Nuevo staff]{.underline}

Objetivo: Crear una persona reusable nueva y asignarla al programa en un
solo paso.

Campos

-   Nombre

    -   Texto

    -   obligatorio visualmente

-   Apellido

    -   Texto

    -   obligatorio visualmente

-   Email

    -   Texto

    -   opcional

-   Teléfono

    -   Texto

    -   opcional

-   Rol

    -   Combo

    -   obligatorio

    -   **Endpoint** combo rol

> **GET /roles/combo-staff?idIdioma=1&tipoOperacion=PROGRAMA**

-   Expira el

    -   Fecha

    -   opcional o recomendado

-   Botón **Guardar**

    -   **Endpoint**

> **POST /eventos/{idEvento}/staff/nuevo?idIdioma=1**
>
> JSON ejemplo
>
> {
>
>   \"nombre\": \"Dani\",
>
>   \"apellido\": \"Cocina\",
>
>   \"email\": \"dani.cocina@example.com\",
>
>   \"telefono\": \"2234567890\",
>
>   \"id_rol\": 12,
>
>   \"fecha_expiracion\": \"2027-05-19T00:00:00Z\"
>
> }

Qué hace

-   crea persona reusable en ef_staff

-   crea asignación en ef_evento_staff

Acciones por fila de la grilla de staff asignado:

-   activar/desactivar asignación

> **Endpoint**
>
> **PUT /eventos/{idEvento}/staff/{idEventoStaff}**
>
> JSON
>
> {\
> \"activo\": false\
> }

-   eliminar asignación

> **Endpoint**
>
> **DELETE /eventos/{idEvento}/staff/{idEventoStaff}**
>
> Importante: esto elimina la asignación al programa, no necesariamente
> la persona reusable de cuenta.

**Eventos Configuración Tab Equipo**

Actualmente no existe en la configuración del evento, la posibilidad de
asignar equipo

**[Regla]{.underline}**

-   Es exactamente igual que en programa.

-   La diferencia es que ahora el combo usa tipoOperacion=EVENTO.

## 

## 

**Bloque Equipo Interno**:

## 

**Combo**

**GET /roles/combo-equipo?idIdioma=1&tipoOperacion=EVENTO**

**Bloque Staff Operativo**:

**Combo**

**GET /roles/combo-staff?idIdioma=1&tipoOperacion=EVENTO**

**Endpoints**

Los mismos:

> GET /eventos/{idEvento}/equipo
>
> POST /eventos/{idEvento}/equipo
>
> GET /eventos/{idEvento}/staff
>
> POST /eventos/{idEvento}/staff/desde-cuenta
>
> POST /eventos/{idEvento}/staff/nuevo

**Pantalla: Ingresar Código**

[Objetivo]{.underline}

Permitir que el staff operativo entre sin login normal.

Esta pantalla es aparte

No es el login normal del sistema.

Es a través de la pantalla donde ingresa el staff con código

Campos

-   Código

    -   Texto

    -   obligatorio

-   Botón **Ingresar**

**Endpoint**

> **POST /staff/join**
>
> JSON
>
> {
>
>   \"codigo\": \"EVCO5613\"
>
> }
>
> Respuesta esperada (staff con más de una función)
>
> {
>
>     \"id_staff\": 6,
>
>     \"id_cuenta\": **null**,
>
>     \"nombre\": \"Dani\",
>
>     \"apellido\": \"Cocina\",
>
>     \"display_name\": \"Dani Cocina\",
>
>     \"eventos_disponibles\": \[
>
>         {
>
>             \"id_evento\": 89,
>
>             \"tipo_operacion\": \"PROGRAMA\",
>
>             \"nombre_evento\": \"Eventos Fulll y ONG Dibu\",
>
>             \"roles_evento\": \[
>
>                 {
>
>                     \"id_evento_staff\": 4,
>
>                     \"id_rol\": 10,
>
>                     \"codigo_rol\": \"STAFF_BARTENDER\",
>
>                     \"rol_texto\": \"STAFF_BARTENDER\",
>
>                     \"pantalla_inicio\": \"BENEFICIOS\"
>
>                 },
>
>                 {
>
>                     \"id_evento_staff\": 3,
>
>                     \"id_rol\": 12,
>
>                     \"codigo_rol\": \"STAFF_COCINA\",
>
>                     \"rol_texto\": \"STAFF_COCINA\",
>
>                     \"pantalla_inicio\": \"COCINA\"
>
>                 }
>
>             \],
>
>             \"pantalla_inicio_default\": \"OPERACION_GENERAL\"
>
>         }
>
>     \],
>
>     \"access_token\":
> \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdGFmZl82IiwiaWRfc3RhZmYiOiI2IiwiaWRfY3VlbnRhIjoiIiwiaWRfZXZlbnRvIjoiODkiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTVEFGRiIsImlzX3N0YWZmIjoidHJ1ZSIsIm5iZiI6MTc3OTQ0OTY0OCwiZXhwIjoxNzc5NDkyODQ4LCJpc3MiOiJFdmVudGlhIiwiYXVkIjoiRXZlbnRpYS5BcGkifQ.oOITKdTRSOrPBS_Feso0lXSM2sjImCo5TvLzy1LOwB4\",
>
>     \"expires_at_utc\": \"2026-05-22T23:34:08.7259718+00:00\"
>
> }

Qué debe hacer el front

Guardar:

-   access_token

-   id_staff

-   id_evento

-   display_name

-   tipo_operacion

-   roles_evento

-   pantalla_inicio_default

**[Pantalla Seleccionar función]{.underline}**

Esta pantalla se visualiza cuando:

-   roles_evento trae más de un rol.

Ejemplo

Juan tiene:

-   Puerta / Check-in

-   Barra / Beneficios

Qué mostrar

Cards o botones grandes con:

-   nombre de la función

-   opcionalmente icono

-   acción directa

Al seleccionar una card o botón redirige a la pantalla de ese rol.

**[Pantalla Home operativa]{.underline}**

Esta pantalla se usa cuando:

-   cuando el rol apunta a OPERACION_GENERAL

-   como fallback si todavía no está lista la pantalla específica

Qué mostrar

-   Botones grandes según el contexto.

Ejemplo puerta

-   Leer QR entrada

-   Buscar persona

-   Ingreso manual

Ejemplo barra

-   Leer QR beneficio

-   Pendientes manuales

-   Canje manual

Ejemplo cocina

-   Cocina del día

-   Restricciones

-   Listado operativo

[REDIRECCIÓN SEGÚN PANTALLA]{.underline}

CHECKIN

-   manda a lector QR entrada

BENEFICIOS

-   manda a lector QR beneficio

COCINA

-   manda a cocina del día

SALUD

-   manda a panel salud

MUSICA

-   manda a módulo DJ

MESAS

-   manda a módulo mesas

OPERACION_GENERAL

-   manda a home operativa

[Juanchi, esto me tiró el chatgpt, fíjate si te sirve]{.mark}

# [Regla de redirección]{.mark}

[Función simple sugerida]{.mark}

[function resolverRutaStaff(data: {\
pantalla_inicio?: string \| null;\
tipo_operacion?: string \| null;\
id_evento?: number \| null;\
}) {\
const pantalla = (data.pantalla_inicio \|\| \"\").toUpperCase();\
const tipo = (data.tipo_operacion \|\| \"\").toUpperCase();\
const idEvento = data.id_evento;\
\
if (!idEvento) {\
return \"/staff/home\";\
}\
\
switch (pantalla) {\
case \"CHECKIN\":\
return \`/eventos/\${idEvento}/audiencias/checkin\`;\
\
case \"BENEFICIOS\":\
return \`/eventos/\${idEvento}/audiencias/beneficios\`;\
\
case \"COCINA\":\
return tipo === \"PROGRAMA\"\
? \`/programas/\${idEvento}/cocina\`\
: \`/eventos/\${idEvento}/staff/home\`;\
\
case \"SALUD\":\
return tipo === \"PROGRAMA\"\
? \`/programas/\${idEvento}/salud/panel\`\
: \`/eventos/\${idEvento}/staff/home\`;\
\
case \"MESAS\":\
return \`/eventos/\${idEvento}/mesas\`;\
\
case \"MUSICA\":\
return \`/eventos/\${idEvento}/musica\`;\
\
case \"OPERACION_GENERAL\":\
default:\
return \`/eventos/\${idEvento}/staff/home\`;\
}\
}]{.mark}

# [Uso en el submit del código]{.mark}

[Ejemplo front:]{.mark}

[const resp = await fetch(\"/staff/join\", {\
method: \"POST\",\
headers: { \"Content-Type\": \"application/json\" },\
body: JSON.stringify({ codigo })\
});\
\
const data = await resp.json();\
\
if (!resp.ok) {\
throw new Error(data?.error \|\| \"No se pudo validar el código.\");\
}\
\
localStorage.setItem(\"staff_access_token\", data.access_token);\
localStorage.setItem(\"staff_context\", JSON.stringify(data));\
\
const ruta = resolverRutaStaff(data);\
router.push(ruta);]{.mark}

# [Home mínima de staff]{.mark}

[Para no depender de que todas las rutas estén listas hoy, te conviene
tener una pantalla fallback:]{.mark}

[/eventos/{idEvento}/staff/home]{.mark}

[Qué muestra]{.mark}

-   [botones grandes según rol_codigo o pantalla_inicio.]{.mark}

[Ejemplo]{.mark}

-   [si pantalla_inicio = OPERACION_GENERAL\
    mostrar:]{.mark}

    -   [Entrada]{.mark}

    -   [Beneficios]{.mark}

-   [si STAFF_COCINA\
    mostrar:]{.mark}

    -   [Cocina del día]{.mark}

-   [si EVENT_HEALTH más adelante para usuario real, otra home
    distinta]{.mark}

# [Mapeo recomendado de pantallas]{.mark}

[CHECKIN]{.mark}

-   [lector QR entrada]{.mark}

-   [búsqueda manual]{.mark}

-   [ingreso manual]{.mark}

[BENEFICIOS]{.mark}

-   [lector QR beneficio]{.mark}

-   [pendientes manuales]{.mark}

-   [canje manual]{.mark}

[COCINA]{.mark}

-   [listado cocina del día]{.mark}

-   [restricciones]{.mark}

-   [observaciones]{.mark}

[SALUD]{.mark}

-   [panel salud]{.mark}

-   [fichas]{.mark}

-   [acciones]{.mark}

[MUSICA]{.mark}

-   [módulo DJ / playlist / sugerencias]{.mark}

[MESAS]{.mark}

-   [módulo mesas / servicio]{.mark}

[OPERACION_GENERAL]{.mark}

-   [home simple con botones según contexto]{.mark}

**[Importante]{.underline}**

Ya no mezclamos más:

-   usuarios reales

-   staff operativo reusable

-   staff asignado al programa/evento

Cada uno tiene su pantalla, su endpoint y su función.
