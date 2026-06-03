# Eventia – Invitados Confirmación Grupos

# RSVP con grupo incompleto
##
Flujo completo:

1\. Invitado entra al link\
2\. Front llama GET /invitados/GetResumenRsvp?token={token}\
3\. Muestra formulario según estado actual\
4\. Invitado confirma / agrega acompañantes\
5\. Front hace POST de confirmación\
6\. Si el POST da OK, front vuelve a llamar GET /invitados/GetResumenRsvp?token={token}\
7\. Con esa respuesta actualizada muestra QR + cupos pendientes

A continuación se detalla el circuito:

Al confirmar RSVP

Cuando el invitado confirma asistencia, el front debe llamar siempre a este nuevo endpoint:

La primera pantalla pública debería arrancar así:

**Endpoint**

`	`**GET /invitados/GetResumenRsvp?token={token}**

Y con esa respuesta el front decide qué mostrar.

Cómo distingue primera vez vs reingreso

Por los estados de la respuesta.

Primera vez, sin confirmar nada

Vendría algo así:

{

`  `"rsvpEstadoGrupo": "PENDIENTE",

`  `"personasCargadas": 1,

`  `"cuposSinDefinir": 3,

`  `"adultosDisponibles": 1,

`  `"menoresDisponibles": 2,

`  `"puedeEditarGrupo": **true**,

`  `"grupoCerrado": **false**,

`  `"integrantes": [

`    `{

`      `"nombreCompleto": "Juan Pereyra",

`      `"rsvpEstado": "P",

`      `"qrToken": **null**

`    `}

`  `]

}

Entonces el front muestra como hasta ahora:

[Sí, voy a ir] [No podré asistir]

Y si toca “Sí”, habilita carga de acompañantes, y al confirmar hace el post.


Reingreso con titular ya confirmado pero grupo incompleto

Si el invitado vuelve a entrar con el mismo token, el front debe llamar de nuevo a:

**GET /invitados/GetResumenRsvp?token={token}**

El endpoint devuelve algo así:

{

`  `"rsvpEstadoGrupo": "INCOMPLETO",

`  `"personasCargadas": 1,

`  `"cuposSinDefinir": 3,

`  `"puedeEditarGrupo": **true**,

`  `"integrantes": [

`    `{

`      `"nombreCompleto": "Juan Pereyra",

`      `"rsvpEstado": "Y",

`      `"qrToken": "..."

`    `}

`  `]

}

Entonces el front muestra esta sección:

Confirmación registrada\
\
Juan Pereyra\
[QR]\
\
Te quedan acompañantes por definir:\
+1 adulto\
+2 menores\
\
[Agregar adulto]\
[Agregar menor]\
[No agregar más acompañantes]

**Mostrar esta sección solo si: puedeEditarGrupo = true**

Agregar acompañante adulto o menor

No hay endpoint nuevo. Se usa el mismo endpoint de confirmación RSVP que ya usaban antes.

El front debe volver a mandar el POST de confirmación con las nuevas personas agregadas.

Ejemplo: Juan ya estaba confirmado y ahora agrega 1 adulto.

Después del POST, el front debe llamar otra vez:

GET /invitados/GetResumenRsvp?token={token}


Botón “No agregar más acompañantes”

Al hacer clic en este botón se llama al **Endpoint** nuevo:

**POST /invitados/CerrarGrupoRsvp?token={token}**

JSON:

{

`  `"observaciones": "El titular indicó que no agregará más acompañantes."

}

Respuesta esperada:

{

`  `"rsvpEstadoGrupo": "CONFIRMADO",

`  `"puedeEditarGrupo": **false**,

`  `"grupoCerrado": **true**,

`  `"cuposSinDefinir": 3

}

Luego el front debe ocultar:

- Agregar adulto
- Agregar menor
- No agregar más acompañantes

y dejar solo los QR de los confirmados.


Grupo ya cerrado

{

`  `"grupoCerrado": **true**,

`  `"puedeEditarGrupo": **false**,

`  `"rsvpEstadoGrupo": "CONFIRMADO"

}


Entonces muestra solo:

Confirmación registrada\
Tus QR de ingreso

