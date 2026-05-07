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

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.001.png)

Flujos de decisiones:

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.002.png)


Esto me armó el chatgpt como para tener una idea de como se organiza la info:

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.003.png) 

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.004.png) ![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.005.png)

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.006.png) ![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.007.png)

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.008.png) ![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.009.png)

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.010.png) ![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.011.png)

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.012.png) ![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.013.png)


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

![](Aspose.Words.40b70f85-64d3-49db-b519-b0e3e6d6de0b.014.png)

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

Cargar restricciones que después alimentan cocina para preparar menus diferenciados

UI por participante (repetir por cada hijo)

Restricciones alimentarias — Tomás García

Lista de opciones (checkbox):\
(se trae del GET: restricciones\_alimentarias\_config)\
\
[ ] Sin gluten \
[ ] Sin lactosa \
[ ] Frutos secos \
[ ] Vegetariano \
[ ] Vegano \
[ ] Halal \
[ ] Otra\
\
Severidad (opcional):\
[ Leve / Moderada / Severa ]\
\
Observaciones (textarea libre

(Guarda en ef\_rsvp\_integrante\_restricciones)

Objetivo\
Cargar restricciones que luego usa cocina para preparar menús diferenciados.\
\
UI por participante (repetir por cada hijo)\
\
Restricciones alimentarias — {Nombre Participante}\
\
Lista de opciones (checkbox):\
(se trae del GET: Guido no encuentro el get)\
\
[ ] Sin gluten \
[ ] Sin lactosa \
[ ] Frutos secos \
[ ] Vegetariano \
[ ] Vegano \
[ ] Halal \
[ ] Otra \
\
Severidad (opcional):\
[ Leve / Moderada / Severa ]\
\
Observaciones (textarea libre)\
\
Reglas:\
· Puede seleccionar múltiples restricciones\
· Si marca “Otra”, observaciones es obligatorio\
· Si no selecciona ninguna → no se envía el array\
\
JSON:\
\
"restricciones\_alimentarias": [\
{\
"id\_restriccion\_alimentaria": 8,\
"observacion": "Alergia a frutos secos",\
"severidad": "SEVERA"\
}\
]

**Pantalla 7 — Restricciones de Salud**

Objetivo

Registrar Ficha médica operativa por hijo o participante

\
UI por participante\
\
Salud — {Nombre Participante}\
\
¿Tiene problema médico?\
[ Sí / No ]\
\
Si Sí:\
Detalle (textarea)\
\
¿Tiene alergias NO alimentarias?\
[ Sí / No ]\
\
Si Sí:\
Detalle (textarea)\
\
¿Requiere atención especial?\
(texto libre)\
\
Cobertura médica\
(input texto)\
\
Observaciones de la familia\
(textarea)\
\
Autoriza atención médica de emergencia\
[ Sí / No ] (obligatorio)\
\
Contactos de emergencia\
Botón: Agregar contacto\
\
Campos por contacto:\
· Nombre\
· Teléfono\
· Relación\
· Orden\
\
Medicaciones\
Botón: Agregar medicación\
\
Campos:\
· Nombre medicación\
· Dosis\
· Frecuencia\
· Indicaciones\
· Requiere autorización (bool)\
\
Reglas:\
· Si tiene\_problema\_medico = false → no obligar detalle\
· Debe haber al menos 1 contacto de emergencia\
· Autoriza\_emergencia es obligatorio\
\
JSON:\
\
"salud": {\
"tiene\_problema\_medico": true,\
"problema\_medico\_detalle": "Asma",\
"tiene\_alergias\_no\_alimentarias": true,\
"alergias\_no\_alimentarias\_detalle": "Abejas",\
"necesidad\_especial": "Evitar calor extremo",\
"cobertura\_medica": "Sanitas",\
"observaciones\_familia": "Lleva inhalador",\
"autoriza\_emergencia\_medica": true,\
"contactos\_emergencia": [\
{\
"nombre": "Laura",\
"telefono": "+34600111999",\
"relacion": "Madre",\
"orden": 1\
}\
],\
"medicaciones": []\
}


**Pantalla 8 — Autorizados Retiro**

Objetivo

Definir quién puede retirar a cada niño.

UI por participante\
\
Autorizados — {Nombre Participante}\
\
Botón: Agregar autorizado\
\
Campos:\
· Nombre completo\
· Teléfono\
· Relación (combo: Madre, Padre, Abuela, Tutor, Otro)\
· Observaciones\
\
Ejemplos:\
"Puede retirar lunes y miércoles"\
"Solo con DNI"\
\
Reglas:\
· Debe haber al menos 1 autorizado\
· El responsable puede autoincluirse\
· No validar duplicados por ahora\
\
JSON:\
\
"autorizados\_retiro": [\
{\
"nombre\_autorizado": "Laura Serra",\
"telefono\_autorizado": "+34600111999",\
"relacion": "Madre",\
"observaciones": "Puede retirar todos los días"\
}\
]

**Pantalla 9 — Firma**

Objetivo

Dejar constancia de quién confirma.

Campos:\
\
Nombre completo (input obligatorio)\
Fecha (auto o editable)\
\
Reglas:\
· Nombre obligatorio\
· Fecha obligatoria\
\
JSON:\
\
"firma": {\
"nombre": "Laura Serra",\
"fecha": "2026-05-02"\
}

**Pantalla 10 — Resumen/Reserva**

Objetivo\
Mostrar todo antes de guardar.\
\
Debe mostrar:\
\
Responsable\
Participantes\
\
Por participante:\
· Semanas seleccionadas\
· Servicios (con cantidad de días)\
· Restricciones\
· Salud (resumen)\
· Autorizados retiro\
\
Totales:\
· Base (semanas)\
· Servicios\
· Total final

Botones:

- Volver
- Confirmar inscripción

\
\
Reglas:\
· No permite confirmar si falta algo obligatorio\
· Antes de confirmar → llamar a cotizar\
\
Flujo:\
\
1\. Usuario revisa\
2\. Hace click en Confirmar\
3\. Se llama:\
\
POST /programas/inscripcion/{token}/confirmar\
\
4\. Backend responde OK\
5\. Mostrar pantalla de éxito:

Inscripción confirmada\
\
Guarda esta pantalla o descarga los QR de retiro.\
\
Responsable:

- Laura Serra

\
\
Participantes:

- Eloi Serra
- Txell Serra

\
QR de retiro\
\
Laura Serra

Puede retirar:

- Eloi Serra
- Txell Serra

Botones:

- Ver QR (El QR debe codificar: QrToken)
- Descargar imagen

\
Marc Vidal

Puede retirar: 

- Eloi Serra

\
Botones:

- Ver QR
- Descargar imagen

Carme Serra 

Puede retirar: 

- Txell Serra

Botones:

- Ver QR
- Descargar imagen

El endpoint de confirmar, devuelve para los qr:

"qrs\_retiro": [

`        `{

`            `"nombre\_autorizado": "Carla Domenech",

`            `"telefono\_autorizado": "+34600999111",

`            `"relacion": "Madre",

`            `"qr\_token": "f9d17bdd65c4df5ef48e78fd7291cadafba7f5669a49fffcf6a0f64208a8fbcb",

`            `"participantes": [

`                `{

`                    `"id\_invitado": 116,

`                    `"nombre\_completo": "Bruno Domenech"

`                `},

`                `{

`                    `"id\_invitado": 117,

`                    `"nombre\_completo": "Sofia Domenech"

`                `}

`            `]

`        `},

`        `{

`            `"nombre\_autorizado": "Jose Domenech",

`            `"telefono\_autorizado": "+34600999222",

`            `"relacion": "Abuelo",

`            `"qr\_token": "3757eeb2164ae477655a92258a82a6d5a6316a61288d9783af070253408be452",

`            `"participantes": [

`                `{

`                    `"id\_invitado": 116,

`                    `"nombre\_completo": "Bruno Domenech"

`                `}

`            `]

`        `},

`        `{

`            `"nombre\_autorizado": "Laura Perez",

`            `"telefono\_autorizado": "+34600999333",

`            `"relacion": "Tía",

`            `"qr\_token": "d69e0c305d30102e3c4ccbcd6dc786eff5c1b2035c7f5037c763204bcc6f68e3",

`            `"participantes": [

`                `{

`                    `"id\_invitado": 117,

`                    `"nombre\_completo": "Sofia Domenech"

`                `}

`            `]

`        `}

`    `]


**EJEMPLO FINAL PARA PODER PROBAR UN CASO COMPLETO**

**Endpoint**:

**POST /programas/inscripcion/{token}/confirmar**

Ejemplo de JSON completo (caso con 2 hijos con distintas semanas, distintas autorizaciones, distintas restricciones alimentarias, distintos servicios, etc.) para ver donde van todos los datos del front en casos complejos:

{

`  `"id\_idioma": 3,

`  `"responsable": {

`    `"nombre": "Laura",

`    `"apellido": "Serra",

`    `"email": "laura.serra.full@test.com",

`    `"telefono": "+34600111999",

`    `"documento": "X1234567L",

`    `"relacion": "Madre",

`    `"acepta\_comunicaciones": **true**,

`    `"acepta\_promociones": **false**

`  `},

`  `"participantes": [

`    `{

`      `"nombre": "Eloi",

`      `"apellido": "Serra",

`      `"fecha\_nacimiento": "2016-05-14",

`      `"documento": **null**,

`      `"observaciones": "Va dos semanas. Tiene comedor algunos días, transporte otros días y alergia alimentaria importante.",

`      `"periodos": [

`        `{

`          `"id\_programa\_periodo": 1

`        `},

`        `{

`          `"id\_programa\_periodo": 2

`        `}

`      `],

`      `"servicios": [

`        `{

`          `"id\_programa\_servicio": 1,

`          `"id\_programa\_periodo": 1,

`          `"fechas": [

`            `"2026-06-22",

`            `"2026-06-23",

`            `"2026-06-24",

`            `"2026-06-25",

`            `"2026-06-26"

`          `],

`          `"cantidad": **null**,

`          `"campos\_extra": **null**

`        `},

`        `{

`          `"id\_programa\_servicio": 3,

`          `"id\_programa\_periodo": 1,

`          `"fechas": [

`            `"2026-06-22",

`            `"2026-06-24",

`            `"2026-06-26"

`          `],

`          `"cantidad": **null**,

`          `"campos\_extra": **null**

`        `},

`        `{

`          `"id\_programa\_servicio": 1,

`          `"id\_programa\_periodo": 2,

`          `"fechas": [

`            `"2026-06-29",

`            `"2026-07-01",

`            `"2026-07-03"

`          `],

`          `"cantidad": **null**,

`          `"campos\_extra": **null**

`        `},

`        `{

`          `"id\_programa\_servicio": 4,

`          `"id\_programa\_periodo": **null**,

`          `"fechas": [],

`          `"cantidad": 1,

`          `"campos\_extra": {

`            `"TALLE": "10"

`          `}

`        `}

`      `],

`      `"restricciones\_alimentarias": [

`        `{

`          `"id\_restriccion\_alimentaria": 8,

`          `"observacion": "Alergia a frutos secos. Evitar nueces, almendras, avellanas y trazas."

`        `},

`        `{

`          `"id\_restriccion\_alimentaria": 12,

`          `"observacion": "Alergia al huevo. Revisar rebozados, masas y postres."

`        `}

`      `],

`      `"autorizados\_retiro": [

`        `{

`          `"nombre\_autorizado": "Laura Serra",

`          `"telefono\_autorizado": "+34600111999",

`          `"relacion": "Madre",

`          `"observaciones": "Puede retirar todos los días."

`        `},

`        `{

`          `"nombre\_autorizado": "Marc Vidal",

`          `"telefono\_autorizado": "+34600222999",

`          `"relacion": "Padre",

`          `"observaciones": "Puede retirar lunes, miércoles y viernes."

`        `}

`      `],

`      `"autorizaciones": [

`        `{

`          `"id\_programa\_autorizacion\_config": 1,

`          `"acepta": **true**,

`          `"nombre\_responsable": "Laura Serra",

`          `"documento\_responsable": "X1234567L",

`          `"observaciones": "Acepta condiciones generales."

`        `},

`        `{

`          `"id\_programa\_autorizacion\_config": 2,

`          `"acepta": **true**,

`          `"nombre\_responsable": "Laura Serra",

`          `"documento\_responsable": "X1234567L",

`          `"observaciones": "Autoriza uso de imagen para comunicaciones internas del casal."

`        `}

`      `],

`      `"salud": {

`        `"tiene\_problema\_medico": **true**,

`        `"problema\_medico\_detalle": "Asma leve. Lleva inhalador en la mochila.",

`        `"tiene\_alergias\_no\_alimentarias": **true**,

`        `"alergias\_no\_alimentarias\_detalle": "Alergia a picaduras de abeja.",

`        `"necesidad\_especial": "Evitar actividad física intensa si hace mucho calor.",

`        `"cobertura\_medica": "Sanitas",

`        `"observaciones\_familia": "Avisar a la madre si presenta dificultad respiratoria o reacción alérgica.",

`        `"autoriza\_emergencia\_medica": **true**,

`        `"contactos\_emergencia": [

`          `{

`            `"nombre": "Laura Serra",

`            `"telefono": "+34600111999",

`            `"relacion": "Madre",

`            `"orden": 1

`          `},

`          `{

`            `"nombre": "Marc Vidal",

`            `"telefono": "+34600222999",

`            `"relacion": "Padre",

`            `"orden": 2

`          `}

`        `],

`        `"medicaciones": [

`          `{

`            `"nombre\_medicacion": "Inhalador",

`            `"dosis": "1 aplicación",

`            `"frecuencia": "Solo si presenta dificultad respiratoria",

`            `"horario": **null**,

`            `"indicaciones": "Administrar según indicación familiar y avisar inmediatamente.",

`            `"requiere\_autorizacion": **true**

`          `},

`          `{

`            `"nombre\_medicacion": "Antihistamínico",

`            `"dosis": "5 ml",

`            `"frecuencia": "Solo ante reacción alérgica leve",

`            `"horario": **null**,

`            `"indicaciones": "Usar si aparece urticaria leve. Si hay dificultad respiratoria, llamar emergencias.",

`            `"requiere\_autorizacion": **true**

`          `}

`        `]

`      `}

`    `},

`    `{

`      `"nombre": "Txell",

`      `"apellido": "Serra",

`      `"fecha\_nacimiento": "2019-09-03",

`      `"documento": **null**,

`      `"observaciones": "Va solo una semana. Usa acogida algunos días. Tiene dieta vegetariana y no tiene problemas médicos.",

`      `"periodos": [

`        `{

`          `"id\_programa\_periodo": 1

`        `}

`      `],

`      `"servicios": [

`        `{

`          `"id\_programa\_servicio": 2,

`          `"id\_programa\_periodo": 1,

`          `"fechas": [

`            `"2026-06-23",

`            `"2026-06-24"

`          `],

`          `"cantidad": **null**,

`          `"campos\_extra": **null**

`        `},

`        `{

`          `"id\_programa\_servicio": 1,

`          `"id\_programa\_periodo": 1,

`          `"fechas": [

`            `"2026-06-24",

`            `"2026-06-25"

`          `],

`          `"cantidad": **null**,

`          `"campos\_extra": **null**

`        `},

`        `{

`          `"id\_programa\_servicio": 4,

`          `"id\_programa\_periodo": **null**,

`          `"fechas": [],

`          `"cantidad": 1,

`          `"campos\_extra": {

`            `"TALLE": "6"

`          `}

`        `}

`      `],

`      `"restricciones\_alimentarias": [

`        `{

`          `"id\_restriccion\_alimentaria": 22,

`          `"observacion": "Menú vegetariano los días que use comedor."

`        `},

`        `{

`          `"id\_restriccion\_alimentaria": 27,

`          `"observacion": "No tolera comidas picantes."

`        `}

`      `],

`      `"autorizados\_retiro": [

`        `{

`          `"nombre\_autorizado": "Laura Serra",

`          `"telefono\_autorizado": "+34600111999",

`          `"relacion": "Madre",

`          `"observaciones": "Puede retirar todos los días."

`        `},

`        `{

`          `"nombre\_autorizado": "Carme Serra",

`          `"telefono\_autorizado": "+34600333999",

`          `"relacion": "Abuela",

`          `"observaciones": "Puede retirar martes y jueves."

`        `}

`      `],

`      `"autorizaciones": [

`        `{

`          `"id\_programa\_autorizacion\_config": 1,

`          `"acepta": **true**,

`          `"nombre\_responsable": "Laura Serra",

`          `"documento\_responsable": "X1234567L",

`          `"observaciones": "Acepta condiciones generales."

`        `},

`        `{

`          `"id\_programa\_autorizacion\_config": 2,

`          `"acepta": **false**,

`          `"nombre\_responsable": "Laura Serra",

`          `"documento\_responsable": "X1234567L",

`          `"observaciones": "No autoriza uso de imagen pública."

`        `}

`      `],

`      `"salud": {

`        `"tiene\_problema\_medico": **false**,

`        `"problema\_medico\_detalle": **null**,

`        `"tiene\_alergias\_no\_alimentarias": **false**,

`        `"alergias\_no\_alimentarias\_detalle": **null**,

`        `"necesidad\_especial": **null**,

`        `"cobertura\_medica": "Sanitas",

`        `"observaciones\_familia": "Es tímida al inicio. Avisar si no quiere participar en actividades grupales.",

`        `"autoriza\_emergencia\_medica": **true**,

`        `"contactos\_emergencia": [

`          `{

`            `"nombre": "Laura Serra",

`            `"telefono": "+34600111999",

`            `"relacion": "Madre",

`            `"orden": 1

`          `},

`          `{

`            `"nombre": "Carme Serra",

`            `"telefono": "+34600333999",

`            `"relacion": "Abuela",

`            `"orden": 2

`          `}

`        `],

`        `"medicaciones": []

`      `}

`    `}

`  `],

`  `"autorizaciones\_grupo": [

`    `{

`      `"id\_programa\_autorizacion\_config": 3,

`      `"acepta": **true**,

`      `"nombre\_responsable": "Laura Serra",

`      `"documento\_responsable": "X1234567L",

`      `"observaciones": "Acepta tratamiento de datos personales para la inscripción."

`    `},

`    `{

`      `"id\_programa\_autorizacion\_config": 4,

`      `"acepta": **true**,

`      `"nombre\_responsable": "Laura Serra",

`      `"documento\_responsable": "X1234567L",

`      `"observaciones": "Autoriza contacto telefónico ante incidencias."

`    `}

`  `],

`  `"firma": {

`    `"nombre": "Laura Serra",

`    `"fecha": "2026-05-02"

`  `}

}

Notas:

responsable → datos del padre/madre/tutor que encabeza el grupo familiar\
\
participantes[] → cada hijo\
\
participantes[].periodos → semanas seleccionadas por ese hijo\
\
participantes[].servicios → servicios elegidos por ese hijo, por semana y por día\
\
participantes[].restricciones\_alimentarias → lo que luego usa cocina\
\
participantes[].autorizados\_retiro → personas autorizadas a retirar a ese hijo específico\
\
participantes[].salud → ficha médica de ese hijo específico\
\
participantes[].autorizaciones → autorizaciones particulares del hijo\
\
autorizaciones\_grupo → autorizaciones generales de toda la inscripción/familia\
\
firma → firma/responsable final de la inscripción


REGLAS GENERALES DEL FRONT

1\. Todo se arma en memoria

No se guarda nada hasta el POST final

2\. Cada pantalla valida antes de avanzar

3\. Datos jerárquicos:

Responsable

→ Participantes

`   `→ Periodos

`   `→ Servicios

`   `→ Salud

`   `→ Restricciones

`   `→ Retiro

4\. Servicios:

· Si requiereSeleccionDias = true → usar fechas

· Si no → usar cantidad o campos\_extra

5\. Si un participante no tiene semanas → no puede avanzar

6\. Cotización:

Cada vez que cambian semanas o servicios, el front puede llamar: 

**POST /programas/inscripcion/{token}/cotizar**

**Ejemplo:**

**POST [**https://eventia-kg28.onrender.com/programas/inscripcion/ca9e51a010933c5fcf3e7067894582d3377413b17ccbe6f8efe0c1fe109ebc78/cotizar**](https://eventia-kg28.onrender.com/programas/inscripcion/ca9e51a010933c5fcf3e7067894582d3377413b17ccbe6f8efe0c1fe109ebc78/cotizar)**

Este endpoint NO guarda nada.\
Solo calcula importes para mostrar el resumen vivo.\
El guardado real se hace recién al final con:\
\
POST /programas/inscripcion/{token}/confirmar


