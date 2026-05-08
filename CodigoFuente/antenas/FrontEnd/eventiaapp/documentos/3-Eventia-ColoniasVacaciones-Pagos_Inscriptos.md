# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# CIRCUITO PAGOS INSCRIPTOS

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho

**Programa → Gestión Inscripciones → Pagos**

No lo mezclamos con la configuración del programa. Tiene que ser una pantalla nueva dentro del programa (evento) y dentro de otro menú, ya que ahora empezamos con los pagos pero desde acá vamos a manejar todo lo que se configuró en la inscripción para que realmente tenga valor funcional.

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

Cuando viene una familia a pagar, el organizador debe poder:

- buscar la inscripción
- ver cuánto debe
- ver el detalle de semanas y servicios
- aplicar descuento/bonificación/recargo manual si corresponde
- registrar pago total o parcial
- anular un pago si se cargó mal
- ver estado: pendiente, parcial, pagado

Concepto general

La inscripción ya tiene un total calculado al momento de confirmar:

ef\_programa\_inscripciones.total\_general

Luego se calcula:

- total\_original- descuentos / bonificaciones + recargos = total\_a\_pagar
- total\_a\_pagar - pagos\_no\_anulados = saldo

El estado de pago se calcula, no se guarda:

- SIN\_CARGO
- PENDIENTE
- PARCIAL
- PAGADO

Tablas usadas

- Inscripción (ef\_programa\_inscripciones)
- Ajustes manuales (ef\_programa\_inscripcion\_ajustes)
  - Guarda descuentos, bonificaciones o recargos.
  - Ejemplos:
    - Descuento socio club
    - Descuento familiar staff
    - Bonificación comercial
    - Recargo administrativo
    - Corrección por error de carga
- Pagos (ef\_programa\_inscripcion\_pagos)
  - Guarda dinero recibido.
  - Ejemplos:
    - Pago efectivo
    - Pago transferencia
    - Pago parcial
    - Pago completo
    - Pago anulado

- Tipo de ajuste (ef\_param\_programa\_tipos\_ajuste y ef\_param\_traducciones)
  - Sirve para que el motivo del ajuste sea parametrizable y traducible.


**Pantalla 1 — Pagos de inscripciones**

**Endpoint**

**GET /programas/{idEvento}/inscripciones/pagos**

Ejemplo:

GET /programas/34/inscripciones/pagos

[

`    `{

`        `"idInscripcion": 12,

`        `"idRsvpGrupo": 27,

`        `"responsable": "Nuria Costa",

`        `"email": "nuria.costa.cocina@test.com",

`        `"telefono": "+34600123456",

`        `"participantes": [

`            `"Aina Costa",

`            `"Pol Costa",

`            `"Jana Costa"

`        `],

`        `"totalOriginal": 450.00,

`        `"totalDescuentos": 0.0,

`        `"totalRecargos": 0.0,

`        `"totalAPagar": 450.00,

`        `"totalPagado": 0.0,

`        `"saldo": 450.00,

`        `"moneda": "EUR",

`        `"estadoPago": "PENDIENTE"

`    `},

`    `{

`        `"idInscripcion": 13,

`        `"idRsvpGrupo": 28,

`        `"responsable": "Marc Ferrer",

`        `"email": "marc.ferrer.cocina@test.com",

`        `"telefono": "+34600234567",

`        `"participantes": [

`            `"Biel Ferrer",

`            `"Mar Ferrer",

`            `"Adil Ferrer"

`        `],

`        `"totalOriginal": 459.00,

`        `"totalDescuentos": 0.0,

`        `"totalRecargos": 0.0,

`        `"totalAPagar": 459.00,

`        `"totalPagado": 0.0,

`        `"saldo": 459.00,

`        `"moneda": "EUR",

`        `"estadoPago": "PENDIENTE"

`    `},

……………………….

Muestra una grilla con todas las inscripciones del programa:

Ver que filtros poner. Podría ser:

- Buscar por responsable / participante
- Buscar por Estado: [Todos] [Pendiente] [Parcial] [Pagado]

|**Responsable**|**Participantes**|**Total**|**Ajustes**|**A Pagar**|**Pagado**|**Saldo**|**Estado**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- | :- | :- |
|**Jordi Serra**|Eloi, Txell|380 €|-30 €|350 €|100 €|250 €|Parcial|<p>- Ver detalle</p><p>- Registrar Pago</p>|
|**Marta Puig**|Laia, Cesc|310 €|0 €|310 €|310 €|0 €|Pagado|<p>- Ver detalle</p><p>- Registrar Pago</p>|
|**Nuria Costa**|Aina Costa, Pol Costa, Jana Costa |450 €|0 €|450 €|0 €|450 €|Pendiente|<p>- Ver detalle</p><p>- Registrar Pago</p>|

`    `{

`        `"idInscripcion": 12,

`        `"idRsvpGrupo": 27,

`        `"responsable": "Nuria Costa",

`        `"email": "nuria.costa.cocina@test.com",

`        `"telefono": "+34600123456",

`        `"participantes": [

`            `"Aina Costa",

`            `"Pol Costa",

`            `"Jana Costa"

`        `],

`        `"totalOriginal": 450.00,

`        `"totalDescuentos": 0.0,

`        `"totalRecargos": 0.0,

`        `"totalAPagar": 450.00,

`        `"totalPagado": 0.0,

`        `"saldo": 450.00,

`        `"moneda": "EUR",

`        `"estadoPago": "PENDIENTE"

`    `},

**Acciones: Ver detalle:**

**Endpoint**

**GET /programas/inscripciones/{idInscripcion}/estado-pago?idIdioma=3**

Ejemplo:

GET /programas/inscripciones/5/estado-pago?idIdioma=1

Respuesta

{

`    `"periodos": [

`        `{

`            `"participante": "Arlet Vidal",

`            `"nombre": "Setmana 1 - del 22/06 al 26/06",

`            `"fechaDesde": "2026-06-22",

`            `"fechaHasta": "2026-06-26",

`            `"precioBase": 120.00,

`            `"moneda": "EUR"

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"nombre": "Setmana 1 - del 22/06 al 26/06",

`            `"fechaDesde": "2026-06-22",

`            `"fechaHasta": "2026-06-26",

`            `"precioBase": 120.00,

`            `"moneda": "EUR"

`        `}

`    `],

`    `"servicios": [

`        `{

`            `"participante": "Arlet Vidal",

`            `"codigo": "ACOGIDA",

`            `"nombre": "Acollida",

`            `"tipoCalculo": "POR\_DIA",

`            `"precio": 4.00,

`            `"subtotal": 8.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 2

`        `},

`        `{

`            `"participante": "Arlet Vidal",

`            `"codigo": "CAMISETA",

`            `"nombre": "Samarreta",

`            `"tipoCalculo": "POR\_INSCRIPCION",

`            `"precio": 0.00,

`            `"subtotal": 0.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 1

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"codigo": "COMEDOR",

`            `"nombre": "Menjador",

`            `"tipoCalculo": "POR\_DIA",

`            `"precio": 9.00,

`            `"subtotal": 45.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 5

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"codigo": "CAMISETA",

`            `"nombre": "Samarreta",

`            `"tipoCalculo": "POR\_INSCRIPCION",

`            `"precio": 0.00,

`            `"subtotal": 0.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 1

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"codigo": "TRANSPORTE",

`            `"nombre": "Transport",

`            `"tipoCalculo": "POR\_DIA",

`            `"precio": 6.00,

`            `"subtotal": 18.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 3

`        `}

`    `],

`    `"ajustes": [],

`    `"pagos": [],

`    `"idInscripcion": 5,

`    `"idRsvpGrupo": 20,

`    `"responsable": "Clara Vidal",

`    `"email": "clara.vidal.servicios@test.com",

`    `"telefono": "+34600444555",

`    `"participantes": [

`        `"Biel Vidal",

`        `"Arlet Vidal"

`    `],

`    `"totalOriginal": 311.00,

`    `"totalDescuentos": 0.0,

`    `"totalRecargos": 0.0,

`    `"totalAPagar": 311.00,

`    `"totalPagado": 0.0,

`    `"saldo": 311.00,

`    `"moneda": "EUR",

`    `"estadoPago": "PENDIENTE"

}

Cómo se muestra el detalle de la deuda de una inscripción:

Formulario:

Detalle Pago

Responsable: (campo json responsable)

Clara Vidal (campo json responsable)

<clara.vidal.servicios@test.com> (campo json email)

Participantes: (campo json participantes)

Biel Vidal

Arlet Vidal

Detalle Inscripción

Períodos:

Arlet Vidal

- Setmana 1 – 120 EUR
- Setmana 2 – 120 EUR (si hubiera otra semana, agruparla por participante)

  Biel Vidal

- Setmana 1 – 120 EUR

"periodos": [

`        `{

`            `"participante": "Arlet Vidal",

`            `"nombre": "Setmana 1 - del 22/06 al 26/06",

`            `"fechaDesde": "2026-06-22",

`            `"fechaHasta": "2026-06-26",

`            `"precioBase": 120.00,

`            `"moneda": "EUR"

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"nombre": "Setmana 1 - del 22/06 al 26/06",

`            `"fechaDesde": "2026-06-22",

`            `"fechaHasta": "2026-06-26",

`            `"precioBase": 120.00,

`            `"moneda": "EUR"

`        `}

`    `],

Servicios:

Arlet Vidal

- Acollida – 2 dias – 8 EUR
- Samarreta – 1 – 0 EUR

Biel Vidal

- Menjador – 5 dias – 45 EUR
- Samarreta – 1 – 0 EUR
- Transport – 3 dias – 18 EUR

"servicios": [

`        `{

`            `"participante": "Arlet Vidal",

`            `"codigo": "ACOGIDA",

`            `"nombre": "Acollida",

`            `"tipoCalculo": "POR\_DIA",

`            `"precio": 4.00,

`            `"subtotal": 8.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 2

`        `},

`        `{

`            `"participante": "Arlet Vidal",

`            `"codigo": "CAMISETA",

`            `"nombre": "Samarreta",

`            `"tipoCalculo": "POR\_INSCRIPCION",

`            `"precio": 0.00,

`            `"subtotal": 0.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 1

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"codigo": "COMEDOR",

`            `"nombre": "Menjador",

`            `"tipoCalculo": "POR\_DIA",

`            `"precio": 9.00,

`            `"subtotal": 45.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 5

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"codigo": "CAMISETA",

`            `"nombre": "Samarreta",

`             `"tipoCalculo": "POR\_INSCRIPCION",

`            `"precio": 0.00,

`            `"subtotal": 0.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 1

`        `},

`        `{

`            `"participante": "Biel Vidal",

`            `"codigo": "TRANSPORTE",

`            `"nombre": "Transport",

`            `"tipoCalculo": "POR\_DIA",

`            `"precio": 6.00,

`            `"subtotal": 18.00,

`            `"moneda": "EUR",

`            `"cantidadCalculada": 3

`        `}

`    `],

Total: 311 EUR

"totalOriginal": 311.00,


Ajustes:

Si "ajustes": [],

Dejar vacía esta sección

Sino una grilla que muestre los ajustes:

|**Fecha** |**Tipo**|**Código Ajuste**|**Descripción**|**Importe**|
| :- | :- | :- | :- | :- |
|**03-05-2026**|RECARGO|Corrección por error de carga|Corrección por servicio agregado manualmente|15 EUR|

"idInscripcionAjuste": 3,

`            `"tipo": "RECARGO",

`            `"idTipoAjuste": 8,

`            `"tipoAjusteCodigo": "ERROR\_CARGA",

`            `"tipoAjusteTexto": "Corrección por error de carga",

`            `"descripcion": "Corrección por servicio agregado manualmente.",

`            `"importe": 15.00,

`            `"moneda": "EUR",

`            `"activo": **true**,

`            `"fechaAlta": "2026-05-03T01:19:13.131051+00:00"

`        `},

Botón “**Agregar Ajuste**”



Pagos:

Si "pagos": [],

Dejar vacía esta sección

Sino una grilla que muestre los pagos:

|**Fecha** |**Medio Pago**|**Referencia**|**Observaciones**|**Importe**|**Anulado**|**Acciones**|
| :- | :- | :- | :- | :- | :- | :- |
|**03-05-2026**|BIZUM|Bizum Laura García|Pago Recibido por Bizum|75 EUR|Si / No|Anular Pago|

"pagos": [

`        `{

`            `"idInscripcionPago": 2,

`            `"fechaPago": "2026-05-03T01:36:58.68419+00:00",

`            `"importe": 75.00,

`            `"moneda": "EUR",

`            `"medioPago": "BIZUM",

`            `"referencia": "Bizum Laura Garcia",

`            `"observaciones": "Pago recibido por Bizum.",

`            `"anulado": **false**

`        `},


Botón “**Registrar Pago**”

Resumen:

- Total Original: 311 EUR
- Descuentos: 0 EUR
- Recargos: 0 EUR
- Total a Pagar: 311 EUR
- Pagado: 0 EUR
- Saldo: 311 EUR
- Estado: Pendiente

  "totalOriginal": 311.00,

  `    `"totalDescuentos": 0.0,

  `    `"totalRecargos": 0.0,

  `    `"totalAPagar": 311.00,

  `    `"totalPagado": 0.0,

  `    `"saldo": 311.00,

  `    `"moneda": "EUR",

  `    `"estadoPago": "PENDIENTE"

Resumen Secciones:

1. Responsable y participantes
1. Detalle original: semanas
1. Detalle original: servicios
1. Total Original
1. Ajustes aplicados
1. Pagos registrados
1. Resumen final
1. Acciones

Botón “**Agregar Ajuste**”

Se usa cuando el organizador necesita modificar el importe a pagar sin cambiar la inscripción original.

Ejemplos:

- descuento por socio del club
- descuento por hermano
- descuento comercial
- recargo administrativo
- corrección por error de carga
- bonificación

Al hacer clic en el botón Agregar Ajuste, se abre un modal:

Agregar ajuste\
\
Tipo de ajuste:

- Obligatorio
- Combo
- Valores:
  - DESCUENTO
  - BONIFICACION
  - RECARGO

Motivo

- Obligatorio
- Combo
- **Endpoint**:

  **GET /programas/tipos-ajuste?idIdioma=3**

`		`Ejemplos: Error de carga, cliente habitual, etc.

\
Importe

- Obligatorio
- Numérico

\
Detalle

- Texto
- Ejemplo: Descuento aplicado por ser socio activo del club

Botones:

- Cancelar
- **Guardar ajuste**
  - **Endpoint**:

    **POST /programas/inscripciones/{idInscripcion}/ajustes**

    Ejemplo de DESCUENTO:

    {

    `  `"tipo": "DESCUENTO",

    `  `"idTipoAjuste": 4,

    `  `"importe": 30,

    `  `"descripcion": "Descuento aplicado por ser socio activo del club."

    }

    Respuesta:

    {

    `    `"ok": **true**,

    `    `"idInscripcion": 5,

    `    `"totalOriginal": 311.00,

    `    `"totalDescuentos": 30.00,

    `    `"totalRecargos": 0.0,

    `    `"totalAPagar": 281.00,

    `    `"totalPagado": 0.0,

    `    `"saldo": 281.00,

    `    `"estadoPago": "PENDIENTE"

    }

    Ejemplo de BONIFICACION:

    {

    `  `"tipo": "BONIFICACION",

    `  `"idTipoAjuste": 6,

    `  `"importe": 50,

    `  `"descripcion": "Bonificación comercial autorizada por dirección."

    }


Ejemplo de RECARGO:

{

`  `"tipo": "RECARGO",

`  `"idTipoAjuste": 8,

`  `"importe": 15,

`  `"descripcion": "Corrección por servicio agregado manualmente."

}

Luego el front debe volver a llamar:

GET /programas/inscripciones/5/estado-pago?idIdioma=3

Para refrescar grilla de ajustes con los datos:

"ajustes": [

`        `{

`            `"idInscripcionAjuste": 3,

`            `"tipo": "RECARGO",

`            `"idTipoAjuste": 8,

`            `"tipoAjusteCodigo": "ERROR\_CARGA",

`            `"tipoAjusteTexto": "Corrección por error de carga",

`            `"descripcion": "Corrección por servicio agregado manualmente.",

`            `"importe": 15.00,

`            `"moneda": "EUR",

`            `"activo": **true**,

`            `"fechaAlta": "2026-05-03T01:19:13.131051+00:00"

`        `},

`        `{

`            `"idInscripcionAjuste": 2,

`            `"tipo": "BONIFICACION",

`            `"idTipoAjuste": 6,

`            `"tipoAjusteCodigo": "PROMOCION",

`            `"tipoAjusteTexto": "Promoción comercial",

`            `"descripcion": "Bonificación comercial autorizada por dirección.",

`            `"importe": 50.00,

`            `"moneda": "EUR",

`            `"activo": **true**,

`            `"fechaAlta": "2026-05-03T01:18:32.873554+00:00"

`        `},

`        `{

`            `"idInscripcionAjuste": 1,

`            `"tipo": "DESCUENTO",

`            `"idTipoAjuste": 4,

`            `"tipoAjusteCodigo": "SOCIO\_CLUB",

`            `"tipoAjusteTexto": "Socio del club",

`            `"descripcion": "Descuento aplicado por ser socio activo del club.",

`            `"importe": 30.00,

`            `"moneda": "EUR",

`            `"activo": **true**,

`            `"fechaAlta": "2026-05-03T01:16:55.775883+00:00"

`        `}

`    `],

Y para refrescar la sección de resumen:

`    `"totalOriginal": 311.00,

`    `"totalDescuentos": 80.00,

`    `"totalRecargos": 15.00,

`    `"totalAPagar": 246.00,

`    `"totalPagado": 0.0,

`    `"saldo": 246.00,

`    `"moneda": "EUR",

`    `"estadoPago": "PENDIENTE"


Botón “**Agregar Pago**”

Se usa cuando la familia entrega dinero o confirma transferencia.

Al hacer clic en el botón Agregar Pago, se abre un modal:

Registrar pago\
\
Saldo pendiente

- Sólo lectura (campo TotalAPagar)

Importe

- Numérico
- Obligatorio

Medio de pago:

- Obligatorio
- Combo
- Valores fijos:
  - EFECTIVO
  - TRANSFERENCIA
  - TARJETA
  - BIZUM
  - OTRO

Referencia

- Opcional
- Ejemplo: Transferencia Banco BBVA 007-250

Observaciones

- Opcional
- Ejemplo: pago hecho en recepcion

Botones:

- Cancelar
- **Guardar pago**
  - **Endpoint**:

    **POST /programas/inscripciones/{idInscripcion}/pagos**

Ejemplo de pago parcial:

{

`  `"importe": 100,

`  `"medioPago": "TRANSFERENCIA",

`  `"referencia": "TRF-2026-0001",

`  `"observaciones": "Seña inicial."

}

Respuesta:

{

`    `"ok": **true**,

`    `"idInscripcion": 5,

`    `"totalOriginal": 311.00,

`    `"totalDescuentos": 80.00,

`    `"totalRecargos": 15.00,

`    `"totalAPagar": 246.00,

`    `"totalPagado": 100.00,

`    `"saldo": 146.00,

`    `"estadoPago": "PARCIAL"

}

Ejemplo de pago bizum:

{

`  `"importe": 75,

`  `"medioPago": "BIZUM",

`  `"referencia": "Bizum Laura Garcia",

`  `"observaciones": "Pago recibido por Bizum."

}

Luego el front debe volver a llamar:

GET /programas/inscripciones/5/estado-pago?idIdioma=3

Para refrescar grilla de pagos con los datos:

"pagos": [

`        `{

`            `"idInscripcionPago": 2,

`            `"fechaPago": "2026-05-03T01:36:58.68419+00:00",

`            `"importe": 75.00,

`            `"moneda": "EUR",

`            `"medioPago": "BIZUM",

`            `"referencia": "Bizum Laura Garcia",

`            `"observaciones": "Pago recibido por Bizum.",

`            `"anulado": **false**

`        `},

`        `{

`            `"idInscripcionPago": 1,

`            `"fechaPago": "2026-05-03T01:35:47.692617+00:00",

`            `"importe": 100.00,

`            `"moneda": "EUR",

`            `"medioPago": "TRANSFERENCIA",

`            `"referencia": "TRF-2026-0001",

`            `"observaciones": "Seña inicial.",

`            `"anulado": **false**

`        `}

`    `],

Y para refrescar la sección de resumen:

`    `"totalOriginal": 311.00,

`    `"totalDescuentos": 80.00,

`    `"totalRecargos": 15.00,

`    `"totalAPagar": 246.00,

`    `"totalPagado": 175.00,

`    `"saldo": 71.00,

`    `"moneda": "EUR",

`    `"estadoPago": "PARCIAL"


Botón grilla “**Anular Pago**”

No borra físicamente. Marca:

- anulado = true
- fecha\_anulacion
- motivo\_anulacion

Al hacer clic en esta acción se abre un modal:

Anular pago\
\
Motivo

- Texto
- Obligatorio

Botones:

- Cancelar
- **Confirmar anulación**
  - **Endpoint**:

    **PUT /programas/inscripciones/pagos/{idPago}/anular**

Ejemplo JSON:

"Pago cargado por error."

Respuesta:

{

`    `"ok": **true**,

`    `"idInscripcion": 5,

`    `"totalOriginal": 311.00,

`    `"totalDescuentos": 80.00,

`    `"totalRecargos": 15.00,

`    `"totalAPagar": 246.00,

`    `"totalPagado": 100.00,

`    `"saldo": 146.00,

`    `"estadoPago": "PARCIAL"

}

Luego el front debe volver a llamar:

GET /programas/inscripciones/5/estado-pago?idIdioma=3

Para refrescar grilla de pagos con los datos anulado:

`        `{

`            `"idInscripcionPago": 2,

`            `"fechaPago": "2026-05-03T01:36:58.68419+00:00",

`            `"importe": 75.00,

`            `"moneda": "EUR",

`            `"medioPago": "BIZUM",

`            `"referencia": "Bizum Laura Garcia",

`            `"observaciones": "Pago recibido por Bizum.",

`            `"anulado": **true**

`        `},

Y para refrescar la sección de resumen


