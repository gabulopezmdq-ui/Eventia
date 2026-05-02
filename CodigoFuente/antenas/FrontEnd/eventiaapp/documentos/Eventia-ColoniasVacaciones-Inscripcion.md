# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# INSCRIPCION

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho

## INSCRIPCIÓN – Flujo Público Familiar

Objetivo de la inscripción

Permitir que el padre inscriba:

1\. 1 hijo\
2\. Varios hijos\
3\. Hijos con semanas distintas\
4\. Hijos con servicios distintos\
5\. Hijos con salud/restricciones distinta\
6\. Autorizados de retiro distintos por hijo

La inscripción genera:

- Audiencia
- Invitados
- Grupo familiar
- Integrantes
- Inscripción familiar
- Períodos por participante
- Servicios por participante/dia
- Restricciones
- Salud
- Autorizaciones legales
- Autorizaciones de retiro
- QR por participante

**UI: No lo haría tipo chorizo**. Lo haría **por pasos**, con botón **Siguiente**, guardando en memoria del front hasta confirmar. O sea el front arma el objeto y el backend recibe todo junto al final con un POST.

**Flujo** 

1\. Presentación del casal\
2\. Responsable\
3\. Participantes / hijos\
4\. Semanas por participante\
5\. Servicios por participante\
6\. Restricciones alimentarias\
7\. Salud\
8\. Autorizados de retiro\
9\. Autorizaciones legales\
10\. Resumen y confirmación

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.001.png)

Flujos de decisiones:

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.002.png)


Esto me armó el chatgpt como para tener una idea de como se organiza la info:

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.003.png) 

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.004.png) ![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.005.png)

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.006.png) ![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.007.png)

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.008.png) ![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.009.png)

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.010.png) ![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.011.png)

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.012.png) ![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.013.png)


El GET público completa la pantalla inicial y trae períodos, servicios, salud y autorizaciones. 

El POST confirmar guarda todo. 


**Pantalla 1 — Presentación del programa (casal / colonia / etc.)**

**Endpoint**:

**GET /programas/inscripcion/{token}?idIdioma=3**

Ejemplo:

GET /programas/inscripcion/ca9e51a010933c5fcf3e7067894582d3377413b17ccbe6f8efe0c1fe109ebc78?idIdioma=3

Con los datos del endpoint le muestra al padre

- idioma
- a qué programa se inscribe
- fechas generales
- semanas disponibles
- servicios disponibles
- autorizaciones configuradas
- configuración salud

Formulario:

Idioma: Català ▼ (selector de idioma)

GET /programas/inscripcion/{token}?idIdioma=1\
GET /programas/inscripcion/{token}?idIdioma=2\
GET /programas/inscripcion/{token}?idIdioma=3

Cuando cambia el idioma, no guarda nada. Solo refresca textos.

Inscripció al casal d’estiu d’Aquamar. (campo mensaje\_bienvenida)

Casal d’estiu Aquamar 2026 (campo saludo)\
\
Fechas: 22/06/2026 - 04/09/2026 (campos fechaInicio – fechaFin)\
\
Listar las semanas (periodos.nombre) + Precio (periodos.precio\_base + periodos.moneda)

"periodos": [

`        `{

`            `"id\_programa\_periodo": 1,

`            `"id\_evento": 34,

`            `"codigo": "SEMANA\_01",

`            `"nombre": "Setmana 1 - del 22/06 al 26/06",

`            `"fecha\_desde": "2026-06-22",

`            `"fecha\_hasta": "2026-06-26",

`            `"precio\_base": 120.00,

`            `"moneda": "EUR",

`            `"cupo": 60,

`            `"orden": 1,

`            `"activo": **true**

`        `},

Listar los servicios (servicios.nombre) + Precio (servicios.precio + servicios.moneda)

` `"servicios": [

`        `{

`            `"idProgramaServicio": 1,

`            `"idEvento": 34,

`            `"codigo": "COMEDOR",

`            `"nombre": "Menjador",

`            `"descripcion": "Servei de menjador per dies seleccionats.",

`            `"tipoCalculo": "POR\_DIA",

`            `"precio": 9.00,

`            `"moneda": "EUR",

`            `"obligatorio": **false**,

`            `"permiteCantidad": **false**,

`            `"cupo": **null**,

`            `"orden": 1,

`            `"activo": **true**,

`            `"requiereSeleccionDias": **true**,

`            `"idServicioBase": 1,

`            `"servicioBaseCodigo": "COMEDOR",

`            `"configJson": **null**

`        `},

10% de descompte per germà/na

PAGAMENT\
El pagament es pot fer directament al Club amb targeta o efectiu, o bé mitjançant transferència bancària al número de compte ES48 0081 0087 5800 0222 1726, indicant *“Casal + nom del nen/a”*.   Una vegada fet el pagament enviar justificant per whatsapp al 659 84 95 05 (Info\_publica)

\
Botón **Comenzar inscripción**


**Pantalla 2 — Datos del responsable**

Objetivo

Cargar la cabecera familiar.

El responsable es quien:

- hace la inscripción
- firma
- acepta condiciones
- recibe el token de consulta
- puede volver después al portal

Formulario

**Datos del Responsable**

|*Campo pantalla*|*JSON*|
| :- | :- |
|Nombre|responsable.nombre|
|Apellido|responsable.apellido|
|Email|responsable.email|
|Teléfono / WhatsApp|responsable.telefono|
|Documento|responsable.documento|
|Relación (combo de opciones fijas: Madre, Padre, Tutor/a, Familiar, Otro)|responsable.relacion|
|Acepta comunicaciones|responsable.acepta\_comunicaciones|
|Acepta promociones|responsable.acepta\_promociones|

JSON

"responsable": {

`  `"nombre": "Laura",

`  `"apellido": "Garcia",

`  `"email": "laura.garcia@test.com",

`  `"telefono": "+34600111222",

`  `"documento": "X1234567",

`  `"relacion": "Madre",

`  `"acepta\_comunicaciones": **true**,

`  `"acepta\_promociones": **false**

}

**Pantalla 3 — Participantes**

Formulario

**Participantes**

**Botón Agregar Participante**

|*Campo pantalla*|*JSON*|
| :- | :- |
|Nombre|participantes[].nombre|
|Apellido|participantes[].apellido|
|Fecha nacimiento|participantes[].fecha\_nacimiento|
|Documento|participantes[].documento|
|Observaciones|participantes[].observaciones|

JSON

"participantes": [

`  `{

`    `"nombre": "Tomas",

`    `"apellido": "Garcia",

`    `"fecha\_nacimiento": "2017-05-10",

`    `"documento": **null**,

`    `"observaciones": "Le gusta pileta."

`  `}

]


**Pantalla 4 — Semanas** 

(cada hijo tiene sus propias semanas)

Tomás García\
\
Seleccioná semanas:\
\
[ ] Setmana 1\
22/06 — 26/06\
140 €\
\
[ ] Setmana 2\
29/06 — 03/07\
140 €

Lucas García

Seleccioná semanas:\
\
[ ] Setmana 1\
22/06 — 26/06\
140 €\
\
[ ] Setmana 2\
29/06 — 03/07\
140 €

|*Campo pantalla*|*JSON*|
| :- | :- |
|Semana seleccionada|participantes[].periodos[].id\_programa\_periodo|

JSON

"periodos": [

`  `{

`    `"id\_programa\_periodo": 1

`  `},

`  `{

`    `"id\_programa\_periodo": 2

`  `}

]


**Pantalla 5 — Servicios**

(cada hijo tiene sus propios servicios)

Servicios por día:

Si: requiereSeleccionDias = true

- mostrar dentro de cada semana seleccionada.

Ejemplo:

Tomás García\
Setmana 1 - 22/06 — 26/06

\
\
Menjador — 9 €/día\
[Lun] [Mar] [Mié] [Jue] [Vie]\
\
Transport — 6 €/día\
[Lun] [Mar] [Mié] [Jue] [Vie]

|*Campo pantalla*|*JSON*|
| :- | :- |
|Servicio seleccionado|participantes[].servicios[].id\_programa\_servicio|
|Semana del servicio|participantes[].servicios[].id\_programa\_periodo|
|Fechas marcadas|participantes[].servicios[].fechas|
|Cantidad|participantes[].servicios[].cantidad|
|Campos extra|participantes[].servicios[].campos\_extra|

Podría ser algo así visual por semana y por hijo:

![](Aspose.Words.58b35f69-f35b-481d-80ff-dc795897a213.014.png)

O algo más simple tipo (por semana e hijo también):

Comedor\
[L] [M] [X] [J] [V]\
\
Transporte\
[L] [M] [X] [J] [V]

JSON Ejemplo comedor por días

{

`  `"id\_programa\_servicio": 1,

`  `"id\_programa\_periodo": 1,

`  `"fechas": [

`    `"2026-06-22",

`    `"2026-06-23",

`    `"2026-06-24"

`  `],

`  `"cantidad": **null**,

`  `"campos\_extra": **null**

}

Servicios únicos

Si requiereSeleccionDias = false

- mostrar una vez

Ejemplo:

Samarreta incluida\
\
Talla \*\
[ 10 ▼ ]

El combo sale de config\_json.

JSON Ejemplo camiseta con talle

{

`  `"id\_programa\_servicio": 4,

`  `"id\_programa\_periodo": **null**,

`  `"fechas": [],

`  `"cantidad": 1,

`  `"campos\_extra": {

`    `"TALLE": "10"

`  `}

}

**Pantalla 6 - Restricciones Alimentarias**

Objetivo

Cargar restricciones que después alimentan cocina.

Restricciones alimentarias — Tomás García\
\
[ ] Sin gluten\
[ ] Sin lactosa\
[ ] Frutos secos\
[ ] Vegetariano\
[ ] Otra\
\
Severidad:\
[ Leve / Moderada / Severa ]\
\
Observaciones

(Guarda en ef\_rsvp\_integrante\_restricciones)


**Pantalla 7 — Restricciones de Salud**

Objetivo

Ficha médica operativa por hijo.



**Pantalla 8 — Autorizados Retiro**

Objetivo

Definir quién puede retirar a cada niño.


**Pantalla 9 — Firma**

Objetivo

Dejar constancia de quién confirma.

Formulario

Firma responsable\
\
Escriba su nombre completo \*\
\
Fecha \*

**Pantalla 10 — Resumen/Reserva**






