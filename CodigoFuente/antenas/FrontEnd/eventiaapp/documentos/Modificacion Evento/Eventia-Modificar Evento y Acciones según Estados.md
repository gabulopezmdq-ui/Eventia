# Eventia  - Modificar Evento y Acciones según Estados

Se agregan acciones de estado y edición de datos generales del evento.

En el detalle del evento agregar dos bloques de botones:

Datos generales:

- Editar datos generales

\
Acciones del evento, que se muestran o no de acuerdo al estado del evento:

- Activar evento
- Cerrar evento
- Anular evento
- Reabrir evento


Reabrir evento

Anular evento

Cerrar evento

Activar evento

Editar datos generales
![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.001.png)![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.002.png)![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.003.png)![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.004.png)![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.005.png)![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.006.png)

Estados que puede tener un evento:

B = Borrador\
P = Pendiente de pago\
A = Activo\
C = Cerrado\
X = Anulado

Colores posibles para los estados:

- Borrador: amarillo claro
- Pendiente de pago: naranja
- Activo: verde
- Cerrado: gris
- Anulado: rojo



Comportamiento de los botones según el estado del evento:

Estado Borrador (B):

- Editar datos generales
- Activar evento
- Anular evento

\
Estado PendientePago (P):

- Editar datos generales
- Anular evento

\
Estado Activo (A):

- Editar datos generales
- Cerrar evento
- Anular evento

\
Estado Cerrado (C):

- Reabrir evento

\
Estado Anulado (X):

- No mostrar acciones


**Editar datos generales**

Llenar el form o modal con los datos del evento a modificar

**Endpoint:**

**GET /eventos/GetEvento?idEvento={idEvento}**

Ejemplo

GET /eventos/GetEvento?idEvento=95

`	`Respuesta

{

`    `"idEvento": 95,

`    `"idTipoEvento": 7,

`    `"tipoEventoCodigo": "AFTER",

`    `"tipoEventoDescripcion": "After",

`    `"idIdioma": 1,

`    `"idCuenta": 2,

`    `"idUnidad": 6,

`    `"unidadNombre": "Club Principal",

`    `"idCliente": **null**,

`    `"clienteNombre": **null**,

`    `"modalidad": "PROPIO",

`    `"anfitrionesTexto": "Club de mar",

`    `"estado": "B",

`    	    `"estadoDescripcion": "Borrador",

`    	    `"estadoObservacionActual": "Creación evento B2B propio de cuenta”

`           `"fechaAlta": "2026-06-01T22:50:03.959547+00:00",

`    `"idDressCode": 12,

`    `"dressCodeDescripcion": **null**,

`    `"dressCodeTexto": "Playa",

`    `"saludo": "Despues de la playa....",

`    `"mensajeBienvenida": **null**,

`    `"notas": **null**,

`    `"idPlan": 5,

`    `"planCodigo": "B2B\_STARTER",

`    `"planNombre": "B2B Starter",

`    `"cuentaPlanCodigo": "B2B\_STARTER",

`    `"cuentaPlanNombre": "B2B Starter",

`    `"tipoOperacion": "EVENTO",

`    `"esPublico": **false**,

`    `"modoUi": "EVENTO\_PRIVADO",

`    `"mostrarGestionInvitados": **true**,

`    `"mostrarAudiencias": **false**,

`    `"modoGestionInvitados": "COMPLETA",

`    `"fechaInicio": **null**,

`    `"fechaFin": **null**,

`    `"idPais": 5,

`    `"paisCodigoIso2": "ES",

`    `"codigoMercado": "EU",

`    `"codigoMoneda": "EUR"

}

Campos editables:

- Idioma (combo)
- Anfitriones / nombre visible
- Dress code (combo según idioma)
- Detalle dress code
- Saludo
- Mensaje bienvenida
- Notas internas
- Información pública

No editar:

- Tipo de evento
- Cuenta
- Unidad
- Cliente
- Plan
- Estado
- Tipo operación
- Fechas de programa


**Endpoint**:

**PUT /eventos/{idEvento}/general**

Ejemplo

PUT /eventos/95/general

JSON:

{

`  `"idIdioma": 1,

`  `"anfitrionesTexto": "Club de mar",

`  `"idDressCode": **null**,

`  `"dressCodeDescripcion": "",

`  `"saludo": "Despues de la playa.... una tarde distinta",

`  `"mensajeBienvenida": "Te lo vas a perder?",

`  `"notas": "Notas internas actualizadas",

`  `"infoPublica": "Información pública visible del evento."

}

Después de guardar:

- Cerrar modal/pantalla
- Refrescar GET del evento
- Mostrar mensaje “Datos actualizados correctamente”

**Activar evento**

Usar para B2B, B2C Free y programas cuando terminaron de configurar.

**Endpoint**:

**PUT /eventos/{idEvento}/activar**

**Sin body**

Después de ejecutar:

- Refrescar detalle del evento
- Estado pasa a A (lo hace el backend)
- Links quedan activos

**Cerrar evento**

Abre un mini modal para indicar un motivo u observación de cierre del evento

**Endpoint:**

**PUT /eventos/{idEvento}/cerrar**

`	`Ejemplo:

PUT /eventos/95/cerrar

`	`JSON

{

`  `"observaciones": "Finalizamos el evento porque parece que va a haber mal clima"

}

Nota: El campo observaciones se guarda en el historial del evento

Después de ejecutar:

- Refrescar detalle
- Estado pasa a C
- Links quedan inactivos

Actualizar el estado:

![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.007.png)

Y debajo poner el **motivo** por el que se cerró (estadoObservacionActual que es el campo que devuelve el get evento)

Si el evento se reabre y pasa a A, no mostrar el motivo anterior en cabecera.

**Anular evento**

Abre un mini modal para indicar un motivo u observación de anulación del evento

**Endpoint:**

**PUT /eventos/{idEvento}/anular**

Ejemplo:

PUT /eventos/85/anular

`	`JSON

{

`  `"observaciones": "Se anula evento porque nos separamos"

}

Mostrar confirmación antes:

**El evento quedará anulado. No se eliminarán datos, pero no podrá operarse.**

Después:

- Refrescar detalle
- Estado pasa a X
- Links quedan inactivos

Actualizar el estado:

![](Aspose.Words.5e6065f9-8d38-479e-a374-d8f3a61f2457.008.png)

Y debajo poner el **motivo** por el que se anuló (estadoObservacionActual que es el campo que devuelve el get evento)


**Reabrir evento**

Abre un mini modal para indicar un motivo u observación de reapertura del evento

**Endpoint:**

**PUT /eventos/{idEvento}/reabrir**

Ejemplo:

PUT /eventos/95/reabrir

`	`JSON

{

`  `"observaciones": "Se reabre evento porque parece que no llueve"

}

Después:

- Refrescar detalle
- Estado pasa a A
- Links quedan activos

**Programas**

Los programas deberían funcionar igual a nivel estado, porque técnicamente siguen siendo registros en la tabla ef\_eventos.

Pero con una diferencia funcional:

Evento clásico activo:

- habilita links RSVP / invitaciones / acceso

Programa activo:

- habilita link público de inscripción / inscripción / operación diaria

Entonces para front:

Si campo tipo\_operacion = PROGRAMA:

- Mostrar estado igual: B, A, C, X
- Mostrar acciones igual: Activar, Cerrar, Anular, Reabrir
- Pero los textos deben decir “programa”, no “evento”

Ejemplo:

- Activar programa
- Cerrar programa
- Anular programa
- Reabrir programa
- Historial del programa

O sea: **mismo backend, misma lógica, textos adaptados en front según tipo\_operacion**.


**Historial**

Ya que estamos guardando el historial de cambio de estados podríamos mostrarlo (opcional y ver dónde y cómo… línea de tiempo?)

**Endpoint**:

**GET /eventos/{idEvento}/historial-estados**

Ejemplo:

GET /eventos/95/historial-estados

Respuesta

[

`    `{

`        `"fecha": "2026-06-05T11:15:17.379034+00:00",

`        `"estado": "A",

`        `"estadoDescripcion": "Activo",

`        `"usuario": "Amaia Castel",

`        `"observaciones": "Se reabre evento porque parece que no llueve"

`    `},

`    `{

`        `"fecha": "2026-06-04T22:47:21.119435+00:00",

`        `"estado": "C",

`        `"estadoDescripcion": "Cerrado",

`        `"usuario": "Amaia Castel",

`        `"observaciones": "Finalizamos el evento porque parece que va a haber mal clima"

`    `},

`    `{

`        `"fecha": "2026-06-04T22:41:32.756927+00:00",

`        `"estado": "A",

`        `"estadoDescripcion": "Activo",

`        `"usuario": "Amaia Castel",

`        `"observaciones": "Activación manual del evento"

`    `},

`    `{

`        `"fecha": "2026-06-01T22:50:03.959547+00:00",

`        `"estado": "B",

`        `"estadoDescripcion": "Borrador",

`        `"usuario": "Amaia Castel",

`        `"observaciones": "Creación evento B2B propio de cuenta"

`    `}

]




**RESUMEN**

Flujo de creación/activación

B2C Free:\
crea en Borrador → usuario activa manualmente\
\
B2C pago:\
crea en PendientePago → admin registra pago → pasa a Activo\
\
B2B:\
crea en Borrador → organizador activa manualmente

Para B2C pago no mostrar botón Activar mientras esté en P; se activa por pago.

**FLUJO**

B2C FREE

Crear evento\
→ B (Borrador)\
→ el usuario configura\
→ el usuario activa manualmente\
→ A (Activo)

Porque aunque sea free, todavía está armándolo.

B2C PAGO

Crear evento\
→ P (PendientePago)\
→ admin registra pago\
→ A (Activo automático)

**No necesita activar manualmente**, porque el “acto de publicación” ya es el pago.

B2B (cuenta)

Crear evento\
→ B (Borrador)\
→ organizador configura\
→ organizador activa\
→ A

Siempre manual.

Porque el plan ya está pago a nivel cuenta.

El evento no tiene aprobación comercial, sino **preparación operativa**.

Ejemplo:

Salón Cambrils crea 10 bodas juntas

No queremos:

10 links activos\
10 RSVP abiertos\
10 portales funcionando

cuando todavía no cargaron nada, o no terminaron de configurarlas
