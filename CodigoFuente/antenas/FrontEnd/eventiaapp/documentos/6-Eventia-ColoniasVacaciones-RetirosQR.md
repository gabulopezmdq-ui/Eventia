# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# CIRCUITO RETIROS DE NIÑOS CON QR

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho


**Token**: sale de la tabla ef\_autorizaciones, campo qr\_token (para hacer pruebas)

**Programa → Gestión Inscripciones → Retiros**

Programas (menú)

- Aquamar – Casal de verano (card?)
  - Configuración
    - Semanas
    - Servicios
    - Salud
    - Autorizaciones

- Gestión de inscripciones
  - Inscriptos
  - Pagos
  - Cocina
  - Transporte
  - Salud
  - Retiros

- Clínica de Tenis (card?)
  - ……..



Objetivo: 

Validar quién puede retirar a cada niño y registrar la salida del día.

Pantalla:

**Sección Escanear QR**

Retiros — Casal Aquamar

- Botón **Escanear QR**

O

- Ingresar token manualmente:\
  [\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]\
\
  Botón “**Validar”**

Al presionar Validar (escanear o validar manualmente) se llama al **Endpoint**:

**POST /programas/retiros/validar-qr**

JSON:

{\
`  `"qrToken": "PEGAR\_TOKEN\_QR",\
`  `"fechaOperativa": "2026-06-24"\
}

JSON ejemplo:

{

`  `"qrToken": "f9d17bdd65c4df5ef48e78fd7291cadafba7f5669a49fffcf6a0f64208a8fbcb",

`  `"fechaOperativa": "2026-06-24"

}

Response ejemplo:

{

`    `"valido": **true**,

`    `"mensaje": "QR válido.",

`    `"idEvento": 34,

`    `"nombreAutorizado": "Carla Domenech",

`    `"telefonoAutorizado": "+34600999111",

`    `"relacion": "Madre",

`    `"qrToken": "f9d17bdd65c4df5ef48e78fd7291cadafba7f5669a49fffcf6a0f64208a8fbcb",

`    `"participantesAutorizados": [

`        `{

`            `"idInvitado": 116,

`            `"idAutorizacion": 7,

`            `"nombreCompleto": "Bruno Domenech",

`            `"yaRetiradoHoy": **false**,

`            `"fechaRetiro": **null**

`        `},

`        `{

`            `"idInvitado": 117,

`            `"idAutorizacion": 9,

`            `"nombreCompleto": "Sofia Domenech",

`            `"yaRetiradoHoy": **false**,

`            `"fechaRetiro": **null**

`        `}

`    `]

}

Response QR inválido

{

`    `"valido": **false**,

`    `"mensaje": "QR inexistente, vencido o no habilitado para retiro.",

`    `"idEvento": 0,

`    `"nombreAutorizado": "",

`    `"telefonoAutorizado": **null**,

`    `"relacion": **null**,

`    `"qrToken": "d69e0c305d30102e3c4ccbcd6dc786eff5c1b2035c7f5037c763204bcc6f68e",

`    `"participantesAutorizados": []

}
#
**Pantalla 2 — Resultado del QR**

Mostrar “**QR válido**” (o “QR inexistente, vencido o no habilitado para retiro”, pero en el ejemplo suponemos que es válido)\
\
Autorizado:\
Carla Domenech\
Madre\
+34600999111\
\
Puede retirar:\
(checkbox)\
[   ] Bruno Domenech\
[✓] Sofia Domenech — ya retirada 15:30 

Si registra retiro que lo veremos más adelante como se registra, pero sale de:

`        `{

`            `"idInvitado": 117,

`            `"idAutorizacion": 9,

`            `"nombreCompleto": "Sofia Domenech",

`            `"yaRetiradoHoy": **false**,

`            `"fechaRetiro": **null**

`        `}

Y si muestra deshabilitado para no permitir volver a seleccionarlo.

Puede seleccionar a más de uno porque se lleva a todos los niños que tiene autorizados, por ese en el endpoint de registrar el retiro se arma una lista:

`			`"idsInvitadosNinos": [201, 202]


\
Observaciones (campo texto para que pongan alguna aclaración, por ejemplo Retiro en puerta principal)\
\
Botón “**Registrar retiro**”:

Llama al **Endpoint**:

**POST /programas/retiros/registrar**

JSON:

{

`  `"qrToken": "PEGAR\_TOKEN\_QR",

`  `"fechaOperativa": "2026-06-24",

`  `"idsInvitadosNinos": [201],

`  `"observaciones": "Retiro registrado en puerta principal."

}

JSON EJEMPLO:

{

`  `"qrToken": "f9d17bdd65c4df5ef48e78fd7291cadafba7f5669a49fffcf6a0f64208a8fbcb",

`  `"fechaOperativa": "2026-06-24",

`  `"idsInvitadosNinos": [116],

`  `"observaciones": "Retiro registrado en puerta principal."

}

Respuesta

{

`    `"ok": **true**,

`    `"mensaje": "Retiro registrado correctamente.",

`    `"fechaOperativa": "2026-06-24",

`    `"retiros": [

`        `{

`            `"idRetiro": 1,

`            `"idInvitado": 116,

`            `"participante": "Bruno Domenech",

`            `"nombreRetirador": "Carla Domenech",

`            `"fechaRetiro": "2026-05-05T12:55:09.061133+00:00"

`        `}

`    `]

}


**Sección Retiros del día**

Filtros:

- Fecha (cada vez que cambia la fecha refresca cards y grilla)

Cards:

- Total retiros hoy: 24

  **Endpoint**:

  **GET /programas/{idEvento}/retiros/dia?fecha=YYYY-MM-DD**

  Ejemplo:

  **GET /programas/34/retiros/dia?fecha=2026-06-24**

  Respuesta:

{

`    `"idEvento": 34,

`    `"fecha": "2026-06-24",

`    `"totalRetiros": 1,

`    `"items": [

`        `{

`            `"idRetiro": 1,

`            `"idInvitado": 116,

`            `"participante": "Bruno Domenech",

`            `"nombreRetirador": "Carla Domenech",

`            `"telefonoRetirador": "+34600999111",

`            `"metodoValidacion": "A",

`            `"observaciones": "Retiro registrado en puerta principal.",

`            `"fechaRetiro": "2026-05-05T12:55:09.061133+00:00"

`        `}

`    `]

}

*Este endpoint llena la card y la grilla*

Grilla

|Hora|Participante|Retiró|Teléfono|Método|Observaciones|
| :- | :- | :- | :- | :- | :- |
|12:55|Bruno Domenech|Carla Domenech|+34600999111|QR Autorizado|Retiro registrado en puerta principal|

Interpretación de la columna “Método”, que sale del campo “metodoValidacion” del json:

- A = QR autorizado
- M = Manual
- O = Otro

Por ahora solo usamos A, pero para tenerlo contemplado
#
#
Resumen - Flujo completo front

El módulo Retiros permite validar por QR si una persona está autorizada a retirar uno o más participantes.\
\
El QR se genera al confirmar la inscripción y representa a una persona autorizada. Un mismo QR puede estar asociado a varios niños.\
\
El front no debe decidir permisos. Solo escanea el QR, llama al backend y renderiza los participantes autorizados.

1\. Operador entra a Programa > Gestión de inscripciones > Retiros.\
2\. Escanea QR.\
3\. Front llama validar-qr.\
4\. Backend devuelve autorizado y participantes.\
5\. Operador selecciona qué niños se retiran.\
6\. Front llama registrar.\
7\. Backend guarda salida.\
8\. Front refresca retiros del día.


