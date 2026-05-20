# Eventia – Eventos: Pantalla pública post-Confirmación -RSVP


Objetivo

Cuando el invitado confirma, no puede quedar solo en un mensaje que indica que la confirmación fue correcta. Tiene que ver los QR de cada persona confirmada.

**Endpoint**

`	`**GET /invitados/GetResumenRsvp?token=TOKEN\_RSVP**

Ejemplo:

GET /invitados/GetResumenRsvp?token=TOKEN\_RSVP\_ANABELA\_BARNETO 

GET <https://eventia-kg28.onrender.com/invitados/GetResumenRsvp?token=e6vHmuk9U6QBXEHIVdLZ7jexm0lcHdjevbVhWm9IfMbbaWjLqoLh61oMFxdtGUhi>

Respuesta

{

`    `"idEvento": 80,

`    `"evento": "8 años",

`    `"idRsvpGrupo": 43,

`    `"titular": "Anabela Barneto",

`    `"rsvpEstadoGrupo": "CONFIRMADO",

`    `"rsvpMensaje": **null**,

`    `"integrantes": [

`        `{

`            `"idInvitado": 143,

`            `"nombreCompleto": "Anabela Barneto",

`            `"esTitularGrupo": **true**,

`            `"rsvpEstado": "Y",

`            `"qrToken": "gfc7bzTWdMzRWaP215e96mpFjmw0PUAYgBrqJS4A7nEIWovzusKYtl3uHK4QHSfq",

`            `"rsvpMensaje": **null**,

`            `"fechaRsvp": "2026-05-12T22:09:40.256889+00:00",

`            `"idMesa": **null**,

`            `"mesaNombre": **null**,

`            `"tieneRestricciones": **true**,

`            `"restricciones": [

`                `"GLUTEN\_CELIACO"

`            `],

`            `"cantidadSugerenciasMusica": 0,

`            `"sugerenciasMusica": []

`        `},

`        `{

`            `"idInvitado": 145,

`            `"nombreCompleto": "Juanita Grana",

`            `"esTitularGrupo": **false**,

`            `"rsvpEstado": "Y",

`            `"qrToken": "ajaKCdxb4arfDmHEmga1748fYNKZKW9vYJtr0GfWzGt7SnWBJentahrQJEREGEle",

`            `"rsvpMensaje": **null**,

`            `"fechaRsvp": "2026-05-12T22:09:40.256889+00:00",

`            `"idMesa": **null**,

`            `"mesaNombre": **null**,

`            `"tieneRestricciones": **true**,

`            `"restricciones": [

`                `"SIN\_CARNE\_CERDO"

`            `],

`            `"cantidadSugerenciasMusica": 0,

`            `"sugerenciasMusica": []

`        `},

`        `{

`            `"idInvitado": 144,

`            `"nombreCompleto": "Pablo Grana",

`            `"esTitularGrupo": **false**,

`            `"rsvpEstado": "Y",

`            `"qrToken": "H8zUcyReLZiIRiw5lamcvoUu4xrCBk84LFa7l6JxeqZwT6iG8h3PAWPtdL8e3jRf",

`            `"rsvpMensaje": **null**,

`            `"fechaRsvp": "2026-05-12T22:09:40.256889+00:00",

`            `"idMesa": **null**,

`            `"mesaNombre": **null**,

`            `"tieneRestricciones": **false**,

`            `"restricciones": [],

`            `"cantidadSugerenciasMusica": 0,

`            `"sugerenciasMusica": []

`        `}

`    `]

}

Diseño de pantalla pública

Confirmación registrada

Guardá tus QR para el ingreso al evento.

Estos son tus QR de ingreso:

Cards por integrante registrado:

- rsvpEstado = "Y"
- qrToken != null

Cada card:

Anabela Barneto

Titular (esTitularGrupo = true)

QR de ingreso (es el qr generado desde qrToken)

Botón Descargar QR

Juanita Grana

Acompañante (esTitularGrupo = true)

QR de ingreso (es el qr generado desde qrToken)

Botón Descargar QR

Pablo Grana

Acompañante

QR de ingreso (es el qr generado desde qrToken)

Botón Descargar QR

