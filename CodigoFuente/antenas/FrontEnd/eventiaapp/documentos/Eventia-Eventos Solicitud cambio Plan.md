# Eventia – Eventos: Solicitud Cambio de Plan B2C por Evento

1\. Concepto general

- El organizador no cambia el plan directamente.
- El organizador **solicita** el cambio y el SUPERADMIN lo revisa, cobra y aprueba.

El Flujo es el siguiente

Organizador solicita upgrade\
↓\
Queda solicitud PENDIENTE\
↓\
Admin ve plan actual, plan solicitado, diferencia sugerida\
↓\
Admin puede aplicar descuento / bonificación / recargo\
↓\
Admin aprueba o rechaza\
↓\
Si aprueba: el evento cambia de plan y se registra pago

2\. Reglas de mercado / moneda

El front **NO manda mercado ni moneda** al solicitar cambio de plan.

El backend lo resuelve así:

- Si el evento es B2B:
  - usa país/moneda de la cuenta
- Si el evento es B2C:
  - usa id\_pais guardado en el evento

- Si al crear B2C no se mandó país:
  - backend usa país del usuario si existe
  - si no, default AR

El idioma no define moneda:

- Usuario idioma español Argentina + evento España = EUR
- Usuario idioma catalán + evento Argentina = ARS


3\. Pantalla Crear Evento

Agregar campo nuevo:

- **País del evento** (combo)

Podría ser al lado del campo Idioma del Evento y pasar Tipo de Evento a la siguiente línea

Cómo se completa este campo:

**Evento B2C**

- Mostrar combo País del Evento.
  - si usuario tiene país en perfil → usar ese como default
  - cómo sé el país del usuario? **Endpoint**:

**GET /usuarios/mi-perfil**

Authorization: Bearer TOKEN

{

`    `"id\_usuario": 7,

`    `"email": "amaia@eventosfull.com",

`    `"nombre": "Amaia",

`    `"apellido": "Castel",

`    `"telefono": "+54 9 11 1234-5678",

`    `"id\_pais": 5,

`    `"pais\_nombre": "España",

`    `"id\_idioma\_preferido": 1,

`    `"idioma\_preferido\_nombre": "Español (Argentina)",

`    `"id\_idioma\_default\_evento": 1,

`    `"idioma\_default\_evento\_nombre": "Español (Argentina)",

`    `"recibir\_novedades": **true**,

`    `"fecha\_alta": "2026-04-08T12:02:48.274235+00:00",

`    `"ultimo\_acceso": "2026-05-15T16:07:07.919539+00:00",

`    `"cantidad\_eventos\_propios": 3,

`    `"cantidad\_eventos\_compartidos": 0,

`    `"cantidad\_eventos\_cuenta": 12,

`    `"ultimo\_evento\_creado": "Juan y Juana"

}

- si usuario no tiene país en el perfil, mostrar el combo de países

  **Endpoint:**

**GET /paises/GetAll?idIdioma=1 (idioma del evento)**

Traer todos los países porque un usuario puede:

- vivir en Argentina
- pero organizar un evento en España

Hay que modificar entonces lo que se manda en el guardar del evento para contemplar el país:

**Endpoint**:

**POST /eventos**

JSON:


**Evento B2B**

Si el evento se crea desde cuenta, el país sale de la cuenta.\
El front debe mostrarlo **solo lectura**, y no se debe poder editar porque la cuenta define el país comercial.

Y no conviene que cada evento pueda elegir otro país/mercado.

Ejemplo incorrecto: Cuenta España → elegir AR para pagar menos

El **Endpoint** que devuelve el contexto de la cuenta seleccionada (la del usuario logueado)

**GET /cuentas/MiCuenta**

Respuesta:

{

`    `"id\_cuenta": 2,

`    `"nombre\_cuenta": "Salon Eventos Full",

`    `"tipo": "SALON",

`    `"estado": "A",

`    `"id\_plan": 5,

`    `"instagram": "@salonEventosFull",

`    `"web": "https://www.eventosfull.com.ar",

`    `"telefono": "+34911222333",

`    `"ciudad": "Barcelona",

`    `"id\_pais": 5,

`    `"id\_tipo\_identificacion\_fiscal": 3,

`    `"identificacion\_fiscal": "B12345678",

`    `"descripcion": "Salon para bodas, eventos y demas",

`    `"fecha\_alta": "2026-04-08T12:03:49.006891+00:00",

`    `"fecha\_modif": "2026-05-15T17:09:20.096762+00:00"

}


4\. POST crear evento

**Endpoint**:

**POST /eventos**\
Authorization: Bearer TOKEN
##
En el JSON agregar IdPais (y suerte!)

5\. Pantalla Configuración del evento — Panel Plan
##
## ![](Aspose.Words.38dd0ddd-f156-42bd-a84e-55418713eafa.001.png)
##
*Card principal*

Actualmente muestra:

- Plan actual\
  B2C Plus

- Estado\
  Pendiente de pago / Activo / Borrador

Agregar

- País comercial\
  Argentina (o AR porque eso devuelve el endpoint)

- Mercado / moneda\
  AR / ARS

**Endpoint**:

**GET /eventos/GetEvento?idEvento=85**

Respuesta:

{

`    `"idEvento": 85,

`    `"idTipoEvento": 5,

`    `"tipoEventoCodigo": "ANNIVERSARY",

`    `"tipoEventoDescripcion": "Aniversario",

`    `"idIdioma": 1,

`    `"idCuenta": **null**,

`    `"idUnidad": **null**,

`    `"unidadNombre": **null**,

`    `"idCliente": **null**,

`    `"clienteNombre": **null**,

`    `"modalidad": **null**,

`    `"anfitrionesTexto": "Juan y Juana",

`    `"estado": "P",

`    `"fechaAlta": "2026-05-13T18:35:58.802127+00:00",

`    `"idDressCode": **null**,

`    `"dressCodeDescripcion": **null**,

`    `"dressCodeTexto": **null**,

`    `"saludo": **null**,

`    `"mensajeBienvenida": **null**,

`    `"notas": **null**,

`    `"idPlan": 2,

`    `"planCodigo": "B2C\_BASIC",

`    `"planNombre": "B2C Basic",

`    `"cuentaPlanCodigo": **null**,

`    `"cuentaPlanNombre": **null**,

`    `"tipoOperacion": "EVENTO",

`    `"fechaInicio": **null**,

`    `"fechaFin": **null**,

`    `"idPais": 4,

`    `"paisCodigoIso2": "AR",

`    `"codigoMercado": "AR",

`    `"codigoMoneda": "ARS"

}

Botón “**Cambiar Plan**”:

Al hacer clic en el botón, el sistema primero valida si no tiene ya una solicitud de cambio de plan pendiente.

**Endpoint**:

**GET /eventos/{id\_evento}/plan-cambios/pendiente**\
Authorization: Bearer TOKEN\_OWNER

Respuesta:

Si ya tiene una solicitud pendiente el endpoint va a devolver

{

`    `"tiene\_pendiente": **true**,

`    `"solicitud": {

`        `"id\_evento\_plan\_cambio": 1,

`        `"id\_evento": 84,

`        `"plan\_actual\_codigo": "B2C\_PLUS",

`        `"plan\_solicitado\_codigo": "B2C\_PRO",

`        `"codigo\_mercado": "AR",

`        `"codigo\_moneda": "ARS",

`        `"precio\_plan\_actual\_reconocido": 199000.00,

`        `"precio\_plan\_solicitado\_publicado": 299000.00,

`        `"diferencia\_base": 100000.00,

`        `"total\_a\_cobrar": 100000.00,

`        `"estado": "PENDIENTE",

`        `"fecha\_solicitud": "2026-05-15T22:03:14.545499+00:00"

`    `}

}

Se podría mostrar un modal simple con algunos datos:

- Solicitud pendiente
- Plan solicitado: B2C Pro
- Estado: Pendiente de revisión

En cambio, si el endpoint devuelve

{

`    `"tiene\_pendiente": **false**

}

Se abre un modal para solicitar el cambio de plan:

Campos

- Plan actual: 
  - Ejemplo B2C Plus
  - Sólo lectura
- Nuevo plan: 
  - Combo
  - **Endpoint**:

    **GET /precios/planes?tipo=B2C&mercado=AR**

    **Nota: mercado sale de los datos del evento**

    **Ejemplo: GET /eventos/GetEvento?idEvento=85**

{

`    `"idEvento": 85,

`    `"idTipoEvento": 5,

`    `"tipoEventoCodigo": "ANNIVERSARY",

`    `"tipoEventoDescripcion": "Aniversario",

`    `"idIdioma": 1,

`    `"idCuenta": **null**,

`    `"idUnidad": **null**,

`    `"unidadNombre": **null**,

`    `"idCliente": **null**,

`    `"clienteNombre": **null**,

`    `"modalidad": **null**,

`    `"anfitrionesTexto": "Juan y Juana",

`    `"estado": "P",

`    `"fechaAlta": "2026-05-13T18:35:58.802127+00:00",

`    `"idDressCode": **null**,

`    `"dressCodeDescripcion": **null**,

`    `"dressCodeTexto": **null**,

`    `"saludo": **null**,

`    `"mensajeBienvenida": **null**,

`    `"notas": **null**,

`    `"idPlan": 2,

`    `"planCodigo": "B2C\_BASIC",

`    `"planNombre": "B2C Basic",

`    `"cuentaPlanCodigo": **null**,

`    `"cuentaPlanNombre": **null**,

`    `"tipoOperacion": "EVENTO",

`    `"fechaInicio": **null**,

`    `"fechaFin": **null**,

`    `"idPais": 4,

`    `"paisCodigoIso2": "AR",

`    `"codigoMercado": "AR",

`    `"codigoMoneda": "ARS"

}


- Motivo: 
  - Textarea: opcional

Al hacer clic en el botón “**Solicitar**”:

**Endpoint:**

`	`**POST /eventos/{id\_evento}/plan-cambios/solicitar**

Ejemplo

POST /eventos/84/plan-cambios/solicitar

JSON

{

`  `"codigo\_plan\_solicitado": "B2C\_PRO",

`  `"motivo\_solicitud": "Necesito más funcionalidades para el evento."

}

Respuesta

{

`    `"id\_evento\_plan\_cambio": 1,

`    `"id\_evento": 84,

`    `"plan\_actual\_codigo": "B2C\_PLUS",

`    `"plan\_solicitado\_codigo": "B2C\_PRO",

`    `"codigo\_mercado": "AR",

`    `"codigo\_moneda": "ARS",

`    `"precio\_plan\_actual\_reconocido": 199000.00,

`    `"precio\_plan\_solicitado\_publicado": 299000.00,

`    `"diferencia\_base": 100000.00,

`    `"total\_a\_cobrar": 100000.00,

`    `"estado": "PENDIENTE",

`    `"fecha\_solicitud": "2026-05-15T22:03:14.5454991+00:00"

}

Mensaje UI:

Solicitud enviada. El equipo de Eventia revisará el cambio y confirmará el importe final.


6\. Pantalla SuperAdmin

Administración → Comercial → Cambios de planes para eventos (después vemos donde lo ponemos porque tenemos que organizar el superadmin que como es de uso interno quedó todo mezclado)

**Endpoint**:

**GET /admin/eventos\_planes/pendientes**\
Authorization: Bearer TOKEN\_SUPERADMIN

Respuesta

[

`    `{

`        `"id\_evento\_plan\_cambio": 1,

`        `"id\_evento": 84,

`        `"evento\_anfitriones": "prueba registro",

`        `"plan\_actual\_codigo": "B2C\_PLUS",

`        `"plan\_actual\_nombre": "B2C Plus",

`        `"plan\_solicitado\_codigo": "B2C\_PRO",

`        `"plan\_solicitado\_nombre": "B2C Pro",

`        `"estado": "PENDIENTE",

`        `"codigo\_mercado": "AR",

`        `"codigo\_moneda": "ARS",

`        `"precio\_plan\_actual\_reconocido": 199000.00,

`        `"precio\_plan\_solicitado\_lista": 399000.00,

`        `"precio\_plan\_solicitado\_publicado": 299000.00,

`        `"diferencia\_base": 100000.00,

`        `"tipo\_ajuste": **null**,

`        `"importe\_ajuste": **null**,

`        `"motivo\_ajuste": **null**,

`        `"descripcion\_ajuste": **null**,

`        `"total\_a\_cobrar": 100000.00,

`        `"motivo\_solicitud": "Necesito más funcionalidades para el evento.",

`        `"observacion\_admin": **null**,

`        `"id\_usuario\_solicita": 7,

`        `"fecha\_solicitud": "2026-05-15T22:03:14.545499+00:00"

`    `}

]

Con este resultado se arma una grilla con las solicitudes pendientes:

- Fecha
- Evento
- Plan actual
- Plan solicitado
- Mercado
- Precio actual
- Precio nuevo
- Diferencia
- Estado
- Acciones:
  - Ver / Gestionar

Ver / Gestionar:

**Endpoint**:

**GET /admin/eventos\_planes/{id\_evento\_plan\_cambio}**\
Authorization: Bearer TOKEN\_SUPERADMIN

Ejemplo:

GET /admin/eventos\_planes/1

Devuelve:

{

`    `"id\_evento\_plan\_cambio": 1,

`    `"id\_evento": 84,

`    `"evento\_anfitriones": "prueba registro",

`    `"plan\_actual\_codigo": "B2C\_PLUS",

`    `"plan\_actual\_nombre": "B2C Plus",

`    `"plan\_solicitado\_codigo": "B2C\_PRO",

`    `"plan\_solicitado\_nombre": "B2C Pro",

`    `"estado": "PENDIENTE",

`    `"codigo\_mercado": "AR",

`    `"codigo\_moneda": "ARS",

`    `"precio\_plan\_actual\_reconocido": 199000.00,

`    `"precio\_plan\_solicitado\_lista": 399000.00,

`    `"precio\_plan\_solicitado\_publicado": 299000.00,

`    `"diferencia\_base": 100000.00,

`    `"tipo\_ajuste": **null**,

`    `"importe\_ajuste": **null**,

`    `"motivo\_ajuste": **null**,

`    `"descripcion\_ajuste": **null**,

`    `"total\_a\_cobrar": 100000.00,

`    `"motivo\_solicitud": "Necesito más funcionalidades para el evento.",

`    `"observacion\_admin": **null**,

`    `"id\_usuario\_solicita": 7,

`    `"fecha\_solicitud": "2026-05-15T22:03:14.545499+00:00"

}

Armar un modal o una pantalla (porque tal vez son muchos datos) con los siguientes campos:

Header (sólo lectura)

Solicitud: #1

Estado: PENDIENTE

Evento: prueba registro (campo evento\_anfitriones)

Fecha solicitud: 2026-05-15T22:03:14.545499+00:00 

Resumen (sólo lectura)

Plan actual: B2C Plus

Plan solicitado: B2C Pro\
\
Motivo organizador: Necesito más funcionalidades para el evento

Comercial (sólo lectura)

Precio reconocido plan actual: 199.000 ARS

Precio lista plan solicitado: 399.000 ARS

Precio publicado plan solicitado: 299.000 ARS

Diferencia base: 100.000 ARS

Ajuste comercial (editable)

- Tipo ajuste
  - Obligatorio: no
  - Combo de opciones fijas:
    - Null
    - DESCUENTO
    - BONIFICACION
    - RECARGO

(mantener mayúsculas porque el back hace cálculos en base al tipo ajuste)

- Importe ajuste
  - Obligatorio sólo si hay tipo de ajuste
  - Input numérico decimal
- Motivo ajuste
  - Obligatorio: no
  - Input text
- Descripción ajuste
  - Obligatorio: no
  - textarea

**Regla front según Tipo ajuste:**

Sin ajuste (null) → total a cobrar = diferencia\_base\
DESCUENTO → total a cobrar = diferencia\_base - importe\_ajuste\
BONIFICACION → total a cobrar = diferencia\_base - importe\_ajuste\
RECARGO → total a cobrar = diferencia\_base + importe\_ajuste\
Si total < 0 → total a cobrar = 0

Mostrar bien grande:

- Total a cobrar: 50.000 ARS

Pago

- Importe pagado
  - obligatorio
  - Input numérico decimal
- Moneda
  - Sólo lectura
  - Sale de código\_moneda
  - No se manda en el json
- Medio de pago:
  - obligatorio
  - Combo:

    **Endpoint**:

    **GET /medios\_pago/GetAll?idIdioma=1**

    Authorization: Bearer TOKEN\_SUPERADMIN

- Referencia pago
  - Input text
- Observaciones Admin
  - textarea

Botón “**Aprobar Cambio de Plan**”

**Endpoint**

**POST /admin/eventos\_planes/aprobar**

Ejemplo aprobar con BONIFICACION

{

`  `"id\_evento\_plan\_cambio": 1,

`  `"tipo\_ajuste": "BONIFICACION",

`  `"importe\_ajuste": 50000,

`  `"motivo\_ajuste": "Recomendación comercial inicial",

`  `"descripcion\_ajuste": "Se bonifica parte del upgrade porque se recomendó un plan menor al inicio.",

`  `"importe\_pagado": 50000,

`  `"medio\_pago": "PAYPAL",

`  `"referencia\_pago": "PAYPAL-9XJ123",

`  `"observacion\_admin": "Pago recibido por PayPal."

}

Ejemplo aprobar con DESCUENTO

{

`  `"id\_evento\_plan\_cambio": 1,

`  `"tipo\_ajuste": "DESCUENTO",

`  `"importe\_ajuste": 20000,

`  `"motivo\_ajuste": "Promoción comercial",

`  `"descripcion\_ajuste": "Descuento aplicado por promoción vigente.",

`  `"importe\_pagado": 80000,

`  `"medio\_pago": "TRANSFERENCIA\_LOCAL",

`  `"referencia\_pago": "TRX-456789",

`  `"observacion\_admin": "Cliente envió comprobante."

}

Ejemplo aprobar con RECARGO

{

`  `"id\_evento\_plan\_cambio": 1,

`  `"tipo\_ajuste": "RECARGO",

`  `"importe\_ajuste": 20000,

`  `"motivo\_ajuste": "Gestión express",

`  `"descripcion\_ajuste": "Activación urgente solicitada por el cliente.",

`  `"importe\_pagado": 120000,

`  `"medio\_pago": "WISE",

`  `"referencia\_pago": "WISE-REF-7788",

`  `"observacion\_admin": "Pago internacional recibido."

}

Respuesta

{

`    `"ok": **true**

}



Botón “**Rechazar”**

Abre un modal chico:

Rechazar solicitud

- Motivo / observación admin
  - Textarea

- Botones
  - Cancelar
  - Confirmar Rechazo\
    **Endpoint**:

**POST /admin/eventos\_planes/rechazar**\
Authorization: Bearer TOKEN\_SUPERADMIN

JSON

{

`  `"id\_evento\_plan\_cambio": 1,

`  `"observacion\_admin": "El cliente no confirmó el pago."

}


Regla de visualización según estado

Estado PENDIENTE

Mostrar:

bloque ajuste editable\
bloque pago editable\
botones Aprobar / Rechazar

Estado APROBADO

Mostrar todo solo lectura:

badge APROBADO\
datos de ajuste\
datos de pago\
ocultar botones

Estado RECHAZADO

Mostrar todo solo lectura:

badge RECHAZADO\
observación admin\
ocultar botones
















