# Eventia – Eventos: Gestión de Invitados

1\. Concepto general

- Separar la vista de un evento tipo tardeo de un evento de tipo cumpleaños de 15, por ejemplo.
- EVENTO privado/social → Gestión de Invitados
- EVENTO público/captación → Gestión de Invitados + Audiencias
- PROGRAMA → circuito propio

La regla es:

- Si evento.tipo\_operacion = PROGAMA
  - NO tocar nada, el circuito está perfecto como está

- Si evento.tipo\_operacion = EVENTO
  - Si evento.es\_publico = TRUE:
    - NO tocar nada
    - Gestión de Invitados: rediseñar tal como se detalla más abajo en Rediseño Gestión de Invitados
    - Captación y Audiencias queda como está

- Si evento.es\_publico = FALSE
  - El módulo Captación y Audiencias NO visible
  - Rediseñar los tabs para Gestión de Invitados, como se describe a continuación


Rediseño Gestión de Invitados

Queda tal cual está invitados hoy. Es decir, si invité Familia Gomez + 3 y se registraron 4 personas, va a listar las 4 personas.

Pero hay que agregarle las columnas que se marcan en amarillo.

**Endpoint**

**GET /invitados/GetPersonasEvento?idEvento={idEvento}**

Ejemplo

GET /invitados/GetPersonasEvento?idEvento=84

Respuesta

{

`    `"idEvento": 84,

`    `"resumen": {

`        `"totalGrupos": 3,

`        `"cuposInvitados": 7,

`        `"personasCargadas": 5,

`        `"confirmados": 5,

`        `"pendientes": 0,

`        `"noAsisten": 0,

`        `"cuposNoUsados": 2,

`        `"ingresaron": 0,

`        `"conRestricciones": 3

`    `},

`    `"items": [

`        `{

`            `"idInvitado": 161,

`            `"idEvento": 84,

`            `"idAcceso": 111,

`            `"accesoNombre": "General",

`            `"nombre": "Luis",

`            `"apellido": "Anton",

`            `"nombreCompleto": "Luis Anton",

`            `"email": "luis@mail.com",

`            `"celular": "12468879",

`            `"rsvpEstado": "Y",

`            `"fechaRsvp": "2026-05-18T11:37:57.350884+00:00",

`            `"rsvpMensaje": **null**,

`            `"rsvpMensajeGrupo": "Vamos pero sin los chicos!",

`            `"idRsvpGrupo": 56,

`            `"esTitularGrupo": **true**,

`            `"grupoTitular": "Luis Anton",

`            `"cantidadIntegrantesGrupo": 2,

`            `"qrToken": "AfkSLAJdDx0uVYxgC7kuOo3RsnVKL0zhHbvmPRbFMsFvgdFmilPDcdm6v7pJGmVE",

`            `"tieneQr": **true**,

`            `"checkinRealizado": **false**,

`            `"fechaCheckin": **null**,

`            `"idMesa": **null**,

`            `"mesaNombre": **null**,

`            `"tieneRestricciones": **true**,

`            `"restricciones": [

`                `"GLUTEN\_CELIACO"

`            `],

`            `"cantidadSugerenciasMusica": 0,

`            `"nombreGrupo": "Luis + flia",

`            `"grupoResumenTexto": "Luis + flia (+2 adultos +2 menores)",

`            `"cantidadAdultosInvitadosGrupo": 3,

`            `"cantidadMenoresInvitadosGrupo": 2,

`            `"cantidadAdultosConfirmadosGrupo": 2,

`            `"cantidadMenoresConfirmadosGrupo": 0,

`            `"cantidadAdultosPendientesGrupo": 0,

`            `"cantidadMenoresPendientesGrupo": 0,

`            `"cantidadAdultosNoAsistenGrupo": 0,

`            `"cantidadMenoresNoAsistenGrupo": 0

`        `},

`        `{

`            `"idInvitado": 162,

`            `"idEvento": 84,

`            `"idAcceso": 111,

`            `"accesoNombre": "General",

`            `"nombre": "Jesica",

`            `"apellido": "Lamas",

`            `"nombreCompleto": "Jesica Lamas",

`            `"email": **null**,

`            `"celular": **null**,

`            `"rsvpEstado": "Y",

`            `"fechaRsvp": "2026-05-18T11:37:57.350884+00:00",

`            `"rsvpMensaje": **null**,

`            `"rsvpMensajeGrupo": "Vamos pero sin los chicos!",

`            `"idRsvpGrupo": 56,

`            `"esTitularGrupo": **false**,

`            `"grupoTitular": "Luis Anton",

`            `"cantidadIntegrantesGrupo": 2,

`            `"qrToken": "6Nf5e84Bi0lrEwjM8epHfti0aWbcrM4RIozq3WVDv1PdXrK2wQodSHPFsgvBDBcQ",

`            `"tieneQr": **true**,

`            `"checkinRealizado": **false**,

`            `"fechaCheckin": **null**,

`            `"idMesa": **null**,

`            `"mesaNombre": **null**,

`            `"tieneRestricciones": **false**,

`            `"restricciones": [],

`            `"cantidadSugerenciasMusica": 0,

`            `"nombreGrupo": "Luis + flia",

`            `"grupoResumenTexto": "Luis + flia (+3 adultos +2 menores)",

`            `"cantidadAdultosInvitadosGrupo": 3,

`            `"cantidadMenoresInvitadosGrupo": 2,

`            `"cantidadAdultosConfirmadosGrupo": 2,

`            `"cantidadMenoresConfirmadosGrupo": 0,

`            `"cantidadAdultosPendientesGrupo": 0,

`            `"cantidadMenoresPendientesGrupo": 0,

`            `"cantidadAdultosNoAsistenGrupo": 0,

`            `"cantidadMenoresNoAsistenGrupo": 0

`        `},

`        `…………

Cards arriba:

- Grupos: 3
- Cupos invitados: 7
- Personas cargadas: 5
- Confirmados: 5
- Pendientes: 0
- No asisten: 0
- Cupos no usados: 2
- Ingresaron: 0
- Con restricciones

Los datos salen de:

`    `"resumen": {

`        `"totalGrupos": 3,

`        `"cuposInvitados": 7,

`        `"personasCargadas": 5,

`        `"confirmados": 5,

`        `"pendientes": 0,

`        `"noAsisten": 0,

`        `"cuposNoUsados": 2,

`        `"ingresaron": 0,

`        `"conRestricciones": 3

`    `},

|**Invitado**|**Rol**|**Grupo**|**Contacto**|**Acceso**|**Estado RSVP**||**Mensaje** |**Ingreso**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
|Gabriela López |Titular|Familia López (+3)|<p><gaby@gmail.com></p><p>2235144788</p>|General|Confirmado ||![ref1]![ref2]|Ingresó|Link|
|Juan López|Acompañante|Familia López (+3)|2235784417|General|Confirmado||![ref2]|Pendiente|Link|
|Sofía López|Acompañante|Familia López (+3)|—|General|Confirmado|||Pendiente|Link|
|Marta Pérez |Titular|Marta Pérez|<p><marta@gmail.com></p><p>11578894566</p>|General|Pendiente|||—|Link|
|Diego Ruiz |Titular|Diego Ruiz (+1)|<diego@gmail.com>|General|No asiste|||—|Link|

De donde salen los datos:

|**Invitado**|**Rol**|**Grupo**|**Contacto**|**Acceso**|**Estado RSVP**||**Mensaje** |**Ingreso**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
|**nombreCompleto**|<p>Si esTitularGrupo= true à Titular</p><p>Si esTitularGrupo= false à Acompañante</p>|grupoResumenTexto|Ídem como está ahora|accesoNombre|Ídem como está ahora ||![ref3]![ref4]|<p>Si checkinRealizado = true àIngresó</p><p>Si checkinRealizado = false àPendiente</p>|<p>Link</p><p>(Ídem como está ahora)</p>|

Cómo se muestran los íconos de mensaje

||**Iconos** |**Ingreso**|
| :- | :- | :- |
||![ref3]|<p>Mostrar si </p><p>- el invitado esTitularGrupo= true</p><p>- rsvpMensajeGrupo distinto de null</p><p> </p>|
||![ref4]|<p>Mostrar si:</p><p>- rsvpMensaje distinto de null</p>|



**Rediseño pantalla Gestión de Invitados para eventos Privados**

Va a tener 3 tabs:

**Tab Invitados**

Mostrar en un tab el rediseño anterior

**Tab Grupos RSVP**

**Endpoint**:

**GET /invitados/GetGruposEvento?idEvento=84**

Respuesta

"idEvento": 84,

`    `"items": [

`        `{

`            `"idRsvpGrupo": 56,

`            `"nombreGrupo": "Luis + flia",

`            `"grupoResumenTexto": "Luis + flia (+2 adultos +2 menores)",

`            `"rsvpMensajeGrupo": "Vamos pero sin los chicos!",

`            `"titular": "Luis Anton",

`            `"emailTitular": "luis@mail.com",

`            `"celularTitular": "12468879",

`            `"rsvpMensaje": **null**,

`            `"cantidadIntegrantes": 2,

`            `"confirmados": 2,

`            `"pendientes": 0,

`            `"rechazados": 0,

`            `"cantidadAdultosInvitadosGrupo": 3,

`            `"cantidadMenoresInvitadosGrupo": 2,

`            `"cantidadAdultosConfirmadosGrupo": 2,

`            `"cantidadMenoresConfirmadosGrupo": 0,

`            `"rsvpEstadoGrupo": "CONFIRMADO",

`            `"integrantes": [

`                `{

`                    `"idInvitado": 161,

`                    `"nombreCompleto": "Luis Anton",

`                    `"esTitularGrupo": **true**,

`                    `"rsvpEstado": "Y",

`                    `"rsvpMensaje": **null**,

`                    `"rolEvento": "A",

`                    `"checkinRealizado": **false**

`                `},

`                `{

`                    `"idInvitado": 162,

`                    `"nombreCompleto": "Jesica Lamas",

`                    `"esTitularGrupo": **false**,

`                    `"rsvpEstado": "Y",

`                    `"rsvpMensaje": **null**,

`                    `"rolEvento": "A",

`                    `"checkinRealizado": **false**

`                `}

`            `]

`        `},

|**Grupo**|**Titular**|**Contacto**|**Invitados**|**Confirmados**|**Estado**|**Mensaje**|**Acciones**|
| :-: | :-: | :-: | -: | -: | :-: | :-: | :-: |
|Familia Anton (+1 adulto +2 menores)|Luis Anton|<luis@mail.com> / 12468879|2 adultos / 2 menores|2 adultos / 0 menores|PARCIAL|![ref3]|Ver detalle|
|Familia Cardinali (+1 adulto)|Nathalie Cardinali|<natha@mail.com> / 2254877788|2 adultos / 0 menores|2 adultos / 0 menores|CONFIRMADO|—|Ver detalle|
|Sandra Lopez|Sandra Lopez|<sandra@mail.com> / 22354877|1 adulto / 0 menores|1 adulto / 0 menores|CONFIRMADO|![ref3]|Ver detalle|

De donde salen los datos:

|**Grupo**|**Titular**|**Contacto Titular**|**Invitados**|**Confirmados**|**Estado**|**Mensaje**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- | :- |
|**grupoResumenTexto**|<p>titular</p><p></p>|<p>emailTitular</p><p>celularTitular</p>||||||

||
| :- |

|||||||||
| :- | :- | :- | :- | :- | :- | :- | :- |

|cantidadAdultosInvitadosGrupo, cantidadMenoresInvitadosGrupo|
| :- |

|||||cantidadAdultosConfirmadosGrupo, cantidadMenoresConfirmadosGrupo|rsvpEstadoGrupo|rsvpMensajeGrupo|Ver Detalle|
| :- | :- | :- | :- | :- | :- | :- | :- |



**Ver Detalle**

Abre un modal:

Encabezado

Familia Anton (+1 adulto +2 menores)\
\
Titular: Luis Anton\
\
Contacto:\
luis@mail.com\
12468879\
\
Estado RSVP: PARCIAL

|**Resumen del Grupo**||*campos*|
| :- | :-: | :-: |
|Adultos invitados|2|*cantidadAdultosInvitadosGrupo*|
|Menores invitados|2|*cantidadMenoresInvitadosGrupo*|
|Adultos confirmados|2|*cantidadAdultosConfirmadosGrupo*|
|Menores confirmados|0|*cantidadMenoresConfirmadosGrupo*|
|Personas cargadas|2|*cantidadIntegrantes*|
|Confirmados|2|*confirmados*|
|Pendientes|0|*pendientes*|
|No asisten|0|*rechazados*|

\
\


Mensaje del grupo

Mostrar solo si rsvpMensajeGrupo != null

Ejemplo:

“Vamos los dos adultos, los chicos finalmente no van.”

Integrantes

|Integrante|Rol grupo|Tipo|RSVP|Mensaje|Ingreso|
| :-: | :-: | :-: | :-: | :-: | :-: |
|**Luis Anton**|Titular|Adulto|Confirmado|—|Pendiente|
|**Jesica Lamas**|Acompañante|Adulto|Confirmado|“Sin gluten, gracias”|Pendiente|

De donde salen los campos:

|Integrante|Rol grupo|Tipo|RSVP|Mensaje|Ingreso|
| :-: | :-: | :-: | :-: | :-: | :-: |
|integrantes[].nombreCompleto|integrantes[].nombreCompleto|integrantes[].rolEvento|integrantes[].rsvpEstado|integrantes[].rsvpMensaje|integrantes[].checkinRealizado|




*Traducciones visuales*

rolEvento

- A = Adulto
- N = Menor

rsvpEstado

- Y = Confirmado
- P = Pendiente
- N = No asiste

checkinRealizado

- true = Ingresó
- false = Pendiente


**Tab Ingreso**

Usar endpoints QR/check-in existentes.

Reutilizar lo desarrollado para Captación y Audiencias / tab Control de Ingreso





[ref1]: Aspose.Words.8e51dec6-4634-4267-afcf-63a9517efa66.001.png
[ref2]: Aspose.Words.8e51dec6-4634-4267-afcf-63a9517efa66.002.png
[ref3]: Aspose.Words.8e51dec6-4634-4267-afcf-63a9517efa66.003.png
[ref4]: Aspose.Words.8e51dec6-4634-4267-afcf-63a9517efa66.004.png
