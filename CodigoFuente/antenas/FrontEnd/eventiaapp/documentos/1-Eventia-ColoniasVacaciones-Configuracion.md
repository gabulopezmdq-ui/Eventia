# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# CONFIGURACIÓN

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho

Se introduce un nuevo concepto que es el **Tipo de Operación** en **Eventos**.

Regla funcional

- Si tipo\_operacion = EVENTO:
  - funciona como hasta ahora 
  - fecha\_evento puede seguir usándose 
  - plantillas/tramos/accesos aplican como ya venimos trabajando 
- Si tipo\_operacion = PROGRAMA:
  - fecha\_inicio y fecha\_fin son obligatorias 
  - no se usa wizard de plantillas 
  - no se usa estructura con plantilla/sin plantilla 
  - se habilita circuito propio de Programas

Si el usuario entra por:

- Mi espacio / Crear evento
- Cuenta / Eventos / Nuevo evento

Entonces:

- "tipo\_operacion": "EVENTO" (o directamente no lo manda, porque default = EVENTO)

Si el usuario entra por:

- Cuenta / Programas / Nuevo programa

Entonces:

- "tipo\_operacion": "PROGRAMA"

El usuario elige el **tipo de programa**, por ejemplo:

- Casal de verano
- Colonia de vacaciones
- Campus deportivo
- Taller infantil

Pero técnicamente todos esos tienen "tipo\_operacion": "PROGRAMA"

Para bodas, cumpleaños, tardeos, etc. no cambia nada. El usuario sigue eligiendo:

- Boda
- Cumpleaños
- Tardeo
- Evento corporativo
- Y el sistema guarda:
  - "tipo\_operacion": "EVENTO"

La lógica queda así:

Menú Eventos  → tipo\_operacion = EVENTO\
Menú Programas → tipo\_operacion = PROGRAMA

**Cambio de endpoints:**

Donde antes usábamos este endpoint

GET /tipos\_evento/GetAll?idIdioma=1

Ahora tenemos que usar este que agrega filtro tipo de operación:

GET /tipos\_evento/GetAll?idIdioma=1&tipoOperacion=EVENTO\
GET /tipos\_evento/GetAll?idIdioma=1&tipoOperacion=PROGRAMA

Regla:

Crear boda/cumple/tardeo → tipoOperacion=EVENTO 

Crear casal/colonia/campus → tipoOperacion=PROGRAMA 

Front:

En pantalla: Cuenta → Eventos → Nuevo evento

- llama: GET /tipos\_evento/GetAll?idIdioma=1&tipoOperacion=EVENTO

En pantalla: Cuenta → Programas → Nuevo programa

- llama: GET /tipos\_evento/GetAll?idIdioma=1&tipoOperacion=PROGRAMA

Así no aparece SUMMER\_CAMP cuando estamos creando una boda, ni WEDDING cuando estamos creando un programa.

Para **Nuevo Programa**, el front no debería parecer “Crear evento”. Tiene que parecer un alta de programa/casal.

Formulario: Cuenta → Programas → Nuevo programa

**Menú**

Cuenta / Programas / Nuevo programa

**1. Listar mis programas**

**Endpoint**:

**GET /programas/mis-programas**\
Authorization: Bearer TOKEN



**2. Crear Programa**

Sección 1: Datos generales

- Tipo de programa 
  - combo
  - campo **tipo\_evento** (sigue siendo la misma tabla, solo que filtrada)
  - **Endpoint**:

**GET /tipos\_evento/GetAll?idIdioma=3&tipoOperacion=PROGRAMA**

- Nombre del programa
  - Input
  - campo **saludo**
- Organiza / entidad
  - Input precargado con el nombre de la cuenta
  - Campo **anfitriones\_texto**
- Unidad / sede
  - Combo
  - Campo **id\_unidad**
  - **Endpoint:**

    **GET /cuenta\_unidades/MisUnidades?soloActivas=true**

Sección 2: Fechas

- Fecha inicio
  - Date picker. 
  - campo fecha\_inicio.
- Fecha fin
  - Date picker
  - campo fecha\_fin.

Validación: fecha\_fin >= fecha\_inicio

Sección 3: Textos públicos

- Mensaje de bienvenida
  - Textarea. 
  - campo mensaje\_bienvenida.
  - Ejemplo: Inscripció al casal d’estiu d’Aquamar.
- Notas internas
  - Textarea. 
  - campo notas. 
  - No visible al público.

Sección 4: Configuración comercial

- Plan
  - Oculto o precargado desde cuenta: B2B\_STARTER
  - Campo "codigo\_plan": "B2B\_STARTER"

Botones:

- Cancelar
- Guardar Programa

**Endpoint**:

**POST /eventos**

(postman: ColoniaVacaciones\Post Evento)

JSON:

{

`  `"IdTipoEvento": 27,

`  `"IdIdioma": 3,

`  `"IdCuenta": 5,

`  `"IdUnidad": 4,

`  `"IdCliente": **null**,

`  `"Modalidad": "PROPIO",

`  `"AnfitrionesTexto": "Aquamar",

`  `"Saludo": "Casal d’estiu Aquamar 2026",

`  `"MensajeBienvenida": "Inscripció al casal d’estiu d’Aquamar.",

`  `"Notas": "Programa de prueba para gestión de inscripciones por semanas.",

`  `"FechaInicio": "2026-06-22",

`  `"FechaFin": "2026-09-04",

`  `"CodigoPlan": "B2B\_STARTER"

}

Respuesta:

{

`    `"idEvento": 34,

`    `"idTipoEvento": 27,

`    `"tipoEventoCodigo": "CASAL",

`    `"tipoEventoDescripcion": "Casal",

`    `"idIdioma": 3,

`    `"idCuenta": 5,

`    `"idUnidad": 4,

`    `"unidadNombre": "Mar Cambrils Club",

`    `"idCliente": **null**,

`    `"clienteNombre": **null**,

`    `"modalidad": "PROPIO",

`    `"anfitrionesTexto": "Aquamar",

`    `"estado": "B",

`    `"fechaAlta": "2026-04-25T21:25:22.03931+00:00",

`    `"idDressCode": **null**,

`    `"dressCodeDescripcion": **null**,

`    `"dressCodeTexto": **null**,

`    `"saludo": "Casal d’estiu Aquamar 2026",

`    `"mensajeBienvenida": "Inscripció al casal d’estiu d’Aquamar.",

`    `"notas": "Programa de prueba para gestión de inscripciones por semanas.",

`    `"idPlan": 5,

`    `"planCodigo": "B2B\_STARTER",

`    `"planNombre": "B2B Starter",

`    `"cuentaPlanCodigo": "B2B\_STARTER",

`    `"cuentaPlanNombre": "B2B Starter",

`    `"tipoOperacion": "PROGRAMA",

`    `"fechaInicio": "2026-06-22",

`    `"fechaFin": "2026-09-04"

}

Después de guardar: “Programa creado exitosamente”

Y redirigir a:

Cuenta → Programas → Detalle del programa

Ahí recién mostramos:

- Generar link público de inscripción
- Configurar semanas
- Configurar servicios
- Ver inscripciones

Nota: **no mostrar plantillas ni tramos en este alta**. Eso queda para eventos clásicos.

**3. Crear Acceso default + link público de inscripción para Programas.**

La idea es:

Programa:

- Acceso default “Inscripción general”
- Link público con token
- Ese link se pega en la web del club

Usamos las tablas:

- ef\_evento\_accesos
- ef\_evento\_acceso\_links

Para programas, el acceso no significa “Cena + Fiesta”. Significa “Modalidad de inscripción”

Por ahora va a ser “Inscripción general”

Una vez creado el Programa, va a haber un botón:

- “**Generar link público de inscripción**”:

**Endpoint**:

`	`**POST /programas/{idEvento}/generar-link-publico**

`		`Ejemplo:

POST /programas/34/generar-link-publico\
Authorization: Bearer TOKEN

`		`Respuesta:

`		`{

`    `"ok": **true**,

`    `"idEvento": 34,

`    `"idAcceso": 49,

`    `"idAccesoLink": 14,

`    `"token": "ca9e51a010933c5fcf3e7067894582d3377413b17ccbe6f8efe0c1fe109ebc78",

`    `"urlPublica": "/programas/inscripcion/ca9e51a010933c5fcf3e7067894582d3377413b17ccbe6f8efe0c1fe109ebc78"

}

**Esa url\_publica es el link que el club pondría en su web.**

Si ya existe, el endpoint devuelve el mismo link activo (no crea uno nuevo)

Mostrar:

- Link público: [https://tudominio.com/programas/inscripcion/{token}](https://tudominio.com/programas/inscripcion/%7btoken%7d)
- Botón Copiar link

**4. Landing pública del programa por token**

Objetivo:

Padre entra a /programas/inscripcion/{token}\
→ Eventia valida el token\
→ devuelve datos públicos del programa

**Endpoint**:

**GET /programas/inscripcion/{token}**

(postman: ColoniaVacaciones\Entrar a la landing publica por token)

Ejemplo:

GET /programas/inscripcion/ca9e51a010933c5fcf3e7067894582d3377413b17ccbe6f8efe0c1fe109ebc78

Respuesta

{

`    `"idEvento": 34,

`    `"idAcceso": 49,

`    `"idAccesoLink": 14,

`    `"titulo": "Inscripción al programa",

`    `"leyendaPublica": "Formulario público de inscripción.",

`    `"anfitrionesTexto": "Aquamar",

`    `"saludo": "Casal d’estiu Aquamar 2026",

`    `"mensajeBienvenida": "Inscripció al casal d’estiu d’Aquamar.",

`    `"fechaInicio": "2026-06-22",

`    `"fechaFin": "2026-09-04",

`    `"idIdioma": 3,

`    `"expirado": **false**

}


**5. Períodos / semanas del programa**

Objetivo:

Definir los períodos/semanas disponibles para inscripción. 

Permitir que el administrador de la cuenta configure las semanas o períodos disponibles para inscripción dentro de un programa.

Esto no toca todavía servicios ni inscripción final; solo deja cargables las semanas con precio base y cupo.

Ejemplo:

Casal d’estiu Aquamar 2026\
\- Setmana 1: 22/06 al 26/06\
\- Setmana 2: 29/06 al 03/07\
\- Setmana 3: 06/07 al 10/07

Estas semanas después serán seleccionadas por los padres en la inscripción pública.

Pantalla front:

Habrá un botón asociado al Programa (evento) que diga “**Períodos / Semanas**”

Al hacer clic se abrirá una pantalla con una grilla:

**Endpoint**:

**GET /programas/{idEvento}/periodos**

(postman: ColoniaVacaciones\Listar Períodos de un Programa)

Authorization: Bearer TOKEN

Por defecto trae solo activos

Si queremos traer todos:

GET /programas/{idEvento}/periodos?soloActivos=false

- Orden
- Código
- Nombre
- Fecha desde
- Fecha hasta
- Precio base
- Moneda
- Cupo
- Activo
- Acciones: 
  - Editar 
  - Activar 
  - Desactivar

Y un botón en la parte superior “**Agregar período**”

Alta

Formulario:

- Código
  - Input text
  - Obligatorio
  - Campo: codigo
  - Regla: uppercase; único por programa. Ejemplo: SEMANA\_01
- Nombre visible:
  - Input text
  - Obligatorio
  - Campo: nombre
- Fecha Desde:
  - Date picker
  - Obligatorio
  - Campo: fecha\_desde
- Fecha Hasta:
  - Date picker
  - Obligatorio
  - Campo: fecha\_hasta
- Precio base:
  - Numerico, decimal
  - Obligatorio
  - Campo: precio\_base
- Moneda:
  - combo
  - Obligatorio
  - Campo: moneda
  - Valores: EUR / ARS / USD
- Cupo:
  - Numérico
  - NO Obligatorio
  - Campo: cuppo
  - Regla: null o >=0
- Orden:
  - Numérico 
  - Obligatorio
  - Campo: orden
- Activo:
  - toggle
  - Obligatorio
  - Campo: activo
  - Default true

Botón “**Guardar**”:

**Endpoint**:

**POST /programas/34/periodos/upsert**

(postman: ColoniaVacaciones\Definir un período)

JSON

Crear semana 1

{

`  `"id\_programa\_periodo": **null**,

`  `"id\_evento": 34,

`  `"codigo": "SEMANA\_01",

`  `"nombre": "Setmana 1 - del 22/06 al 26/06",

`  `"fecha\_desde": "2026-06-22",

`  `"fecha\_hasta": "2026-06-26",

`  `"precio\_base": 120,

`  `"moneda": "EUR",

`  `"cupo": 60,

`  `"orden": 1,

`  `"activo": **true**

}

Respuesta:

{

`    `"idProgramaPeriodo": 1,

`    `"idEvento": 34,

`    `"codigo": "SEMANA\_01",

`    `"nombre": "Setmana 1 - del 22/06 al 26/06",

`    `"fechaDesde": "2026-06-22",

`    `"fechaHasta": "2026-06-26",

`    `"precioBase": 100.0,

`    `"moneda": "EUR",

`    `"cupo": 60,

`    `"orden": 1,

`    `"activo": **true**

}

Crear semana 2

{

`  `"id\_programa\_periodo": **null**,

`  `"id\_evento": 34,

`  `"codigo": "SEMANA\_02",

`  `"nombre": "Setmana 2 - del 29/06 al 03/07",

`  `"fecha\_desde": "2026-06-29",

`  `"fecha\_hasta": "2026-07-03",

`  `"precio\_base": 120,

`  `"moneda": "EUR",

`  `"cupo": 60,

`  `"orden": 2,

`  `"activo": **true**

}

Editar Período

Se usa el mismo Endpoint que para el alta

**POST /programas/35/periodos/upsert**\
Authorization: Bearer TOKEN\
Content-Type: application/json

{

`  `"id\_programa\_periodo": 2,

`  `"id\_evento": 34,

`  `"codigo": "SEMANA\_02",

`  `"nombre": "Setmana 2 - del 29/06 al 03/07",

`  `"fecha\_desde": "2026-06-29",

`  `"fecha\_hasta": "2026-07-03",

`  `"precio\_base": 140,

`  `"moneda": "EUR",

`  `"cupo": 60,

`  `"orden": 2,

`  `"activo": **true**

}


Activar / Desactivar Período

**Endpoint**:

**PUT /programas/periodos/{idProgramaPeriodo}/set-activo?activo={true|false}**

*Activar Periodo*

PUT /programas/periodos/1/set-activo?activo=true

*Desactivar Período*

PUT /programas/periodos/1/set-activo?activo=false

Respuesta:

{

`    `"ok": **true**,

`    `"id\_programa\_periodo": 1,

`    `"activo": **false**

}


**6. Servicios del Programa**

Objetivo:

Permitir que cada programa configure servicios adicionales o incluidos en la inscripción.

Ejemplos según las capturas del casal de verano:

- Comedor / Menjador
- Acogida / Acollida
- Transporte
- Camiseta incluida con talle

Estos servicios pueden:

- sumar importe al total
- ser gratuitos
- ser obligatorios
- pedir selección por día
- pedir un dato adicional, como talle
- tener cupo
- activarse/desactivarse

En definitiva, este módulo sirve para configurar qué servicios estarán disponibles en la inscripción pública del programa.

Ejemplo:

- El casal ofrece comedor.
- El comedor cuesta 9 EUR por día.
- El padre puede elegir qué días necesita comedor.

O:

- El casal entrega camiseta incluida.
- No tiene precio.
- Es obligatoria.
- Debe pedir talle.


Pantalla front:

Habrá un botón asociado al Programa (evento) que diga (al igual que “Períodos / Semanas”) que diga “**Servicios incluidos**”

Al hacer clic se abrirá una pantalla con una grilla:

**Endpoint**:

**GET /programas/{idEvento}/servicios?soloActivos=false** 

(postman: ColoniaVacaciones\ Listar Servicios de un Programa)

Authorization: Bearer TOKEN

- Orden
- Servicio
- Código
- Tipo Cálculo
- Precio
- Moneda
- Obligatorio
- Selección por días
- Permite cantidad
- Cupo
- Activo
- Acciones:
  - Editar 
  - Activar 
  - Desactivar

Y un botón en la parte superior “**Agregar servicio**”

Alta

Formulario:

- Sección Servicio Base
  - Servicio
    - combo
    - Obligatorio
    - **Endpoint**:

      **GET /programas/servicios-base?idIdioma=3**

      (postman: ColoniaVacaciones\ Parametros-Servicios Base)

      Qué hace el front cuando el usuario selecciona un servicio base, autocompleta:

id\_servicio\_base\
codigo\
nombre\
descripcion

- Sección Datos Comerciales del Servicio
  - Nombre visible
    - Campo JSON: nombre
    - input
    - Obligatorio
    - Ejemplo: Menjador; puede venir precargado cuando el usuario selecciona el servicio del combo del catálogo base, pero se puede modificar.
  - Descripción
    - Campo JSON: descripcion
    - Textarea corto
    - NO Obligatorio
    - Ejemplo: Servei de menjador per dies seleccionats; puede venir precargado cuando el usuario selecciona el servicio del combo del catálogo base, pero se puede modificar
  - Tipo de Cálculo
    - Campo JSON: tipo\_calculo
    - combo
    - Obligatorio
    - **Endpoint**:

      **GET /programas/tipos-calculo?idIdioma=3**

      (postman: ColoniaVacaciones\ Parametros-Tipos de Calculo)

  - Precio
    - Campo JSON: precio
    - Input decimal
    - Obligatorio
    - >=0
  - Moneda
    - Campo JSON: moneda
    - Combo de opciones: EUR / ARS / USD
    - Obligatorio
  - Obligatorio
    - Campo JSON: obligatorio
    - Toggle (si/no)
    - Ejemplo:
      - Ejemplo camiseta: Sí
      - Ejemplo comedor: No
      - Uso: Si obligatorio = true, el servicio se agrega automáticamente a la inscripción.
  - Permite cantidad
    - Campo JSON: permite\_cantidad
    - Toggle (si/no)
    - Ejemplo:
      - Camiseta extra
      - Cantidad de tickets
      - Cantidad de kits
      - Para comedor /transporte normalmente false
  - Requiere Selección de días
    - Campo JSON: requiere\_seleccion\_dias
    - Toggle (si/no)
    - Este campo es clave para las capturas del casal.
    - Ejemplo comedor: Sí
      - Porque el padre puede elegir:
        - Semana 1: todos los días
        - Semana 2: lunes y jueves
        - Semana 3: sin comedor
    - Ejemplo camiseta: No
  - Cupo
    - Campo JSON: cupo
    - Input numérico
    - Obligatorio: NO
    - Ejemplo: 40 lugares de transporte
  - Orden
    - Campo JSON: orden
    - Input numérico
  - Activo
    - Campo JSON: activo
    - Toggle (si/no)
    - Default: True

- Sección Datos Adicionales del Servicio

  Esta es la sección en la que se pueden pedir datos adicionales como por ejemplo la camiseta y el talle

  Objetivo: permitir que un servicio pida un dato extra durante la inscripción

  - ¿Este servicio necesita pedir datos adicionales? 
    - Label + toggle (si/no)
    - Default false
  - Si el usuario marca **Sí**, se muestra:
    - una sección de campos adicionales
    - un Botón “Agregar campo adicional”
    - al hacer clic en el botón, se abre un modal “Agregar campo Adicional”

- Modal Agregar Campo Adicional:
  - Etiqueta Visible
    - Campo JSON: label
    - Input texto
    - Ejemplo: Talle
  - Código interno
    - Campo JSON: codigo
    - Input texto
    - Sugerencia UX: Autogenerarlo desde la etiqueta.
      - Ejemplo: Talle → TALLE
      - Ejemplo: Altura cm → ALTURA\_CM
  - Tipo campo/respuesta
    - Campo JSON: tipo
    - Combo:

      **Endpoint**:

      `	`**GET /programas/tipos-campo-extra?idIdioma=3**

      (postman: ColoniaVacaciones\ Parametros-Tipo campos extra)

    - El usuario ve: Text 
      - lliure
      - Número
      - Llista d’opcions
      - Data
      - Sí / No
    - El front guarda:
      - TEXT
      - NUMBER
      - SELECT
      - DATE
      - BOOLEAN
  - Obligatorio
    - Campo JSON: obligatorio
    - Toggle (si/no)

- Opciones
  - Solo visible si tipo = SELECT
  - Campo JSON: opciones
  - Tipo UI: lista editable
  - Botones: Agregar opción / Eliminar opción
  - Cuando el organizador agrega un **campo adicional** a un servicio, primero define qué tipo de respuesta necesita. Ejemplo:
    - Servicio: Camiseta
    - Campo adicional: Talle
    - Tipo: Lista de opciones
  - Entonces, el formulario debe mostrar una sección nueva:
    - Opciones disponibles:

      [ 4 ] Eliminar\
      [ 6 ] Eliminar\
      [ 8 ] Eliminar\
      [ 10 ] Eliminar\
      [ 12 ] Eliminar\
      [ 14 ] Eliminar\
      [ S ] Eliminar\
      [ M ] Eliminar\
      [ L ] Eliminar

      + Agregar opción

Después de agregar un campo adicional, mostrar una mini grilla de campos adicionales:

|Código|Etiqueta|Tipo|Obligatorio|Opciones|Acciones|
| :-: | :-: | :-: | :-: | :-: | :-: |
|**TALLE**|Talle|Lista de opciones|Sí|4, 6, 8, 10, 12, 14, S, M, L|Editar / Eliminar|

Qué manda el front en config\_json:

El usuario no escribe JSON.

El front arma esto:

{\
`  `"campos\_extra": [\
`    `{\
`      `"codigo": "TALLE",\
`      `"label": "Talla",\
`      `"tipo": "SELECT",\
`      `"obligatorio": true,\
`      `"opciones": ["4", "6", "8", "10", "12", "14", "S", "M", "L"]\
`    `}\
`  `]\
}

Y lo arma como string:

"config\_json": "{\"campos\_extra\":[{\"codigo\":\"TALLE\",\"label\":\"Talla\",\"tipo\":\"SELECT\",\"obligatorio\":true,\"opciones\":[\"4\",\"6\",\"8\",\"10\",\"12\",\"14\",\"S\",\"M\",\"L\"]}]}"

Botón “**Guardar**”:

**Endpoint**:

`	`**POST /programas/34/servicios/upsert**

(postman: ColoniaVacaciones\Definir un servicio para un programa - comedor)

JSON (ejemplo almuerzo)

{

`  `"IdProgramaServicio": **null**,

`  `"IdEvento": 34,

`  `"IdServicioBase": 1,

`  `"Codigo": "COMEDOR",

`  `"Nombre": "Menjador",

`  `"Descripcion": "Servei de menjador per dies seleccionats.",

`  `"TipoCalculo": "POR\_DIA",

`  `"Precio": 9,

`  `"Moneda": "EUR",

`  `"Obligatorio": **false**,

`  `"PermiteCantidad": **false**,

`  `"RequiereSeleccionDias": **true**,

`  `"Cupo": **null**,

`  `"Orden": 1,

`  `"Activo": **true**,

`  `"ConfigJson": **null**

}

Respuesta:

{

`    `"idProgramaServicio": 1,

`    `"idEvento": 34,

`    `"codigo": "COMEDOR",

`    `"nombre": "Menjador",

`    `"descripcion": "Servei de menjador per dies seleccionats.",

`    `"tipoCalculo": "POR\_DIA",

`    `"precio": 9.0,

`    `"moneda": "EUR",

`    `"obligatorio": **false**,

`    `"permiteCantidad": **false**,

`    `"cupo": **null**,

`    `"orden": 1,

`    `"activo": **true**,

`    `"requiereSeleccionDias": **true**,

`    `"idServicioBase": 1,

`    `"servicioBaseCodigo": "COMEDOR",

`    `"configJson": **null**

}


**Activar / desactivar servicio (desde la grilla de servicios, por ejemplo para desactivar transporte)**

**Endpoint**

**PUT /programas/servicios/{idProgramaServicio}/set-activo?activo=false**

Ejemplo:

PUT /programas/servicios/3/set-activo?activo=false

Respuesta:

{

`    `"ok": **true**,

`    `"id\_programa\_servicio": 3,

`    `"activo": **false**

}

Para activar:

PUT /programas/servicios/3/set-activo?activo=true


**Autorizaciones**

Circuito:

- Catálogo base de autorizaciones:
  - Programa define cuáles usa
  - Si no están en el catálogo base se crean personalizadas
  - Padre ve esas autorizaciones en inscripción
  - Respuestas del padre se guardan por participante

Objetivo:

Definir qué autorizaciones verá un padre en la inscripción pública del programa, por ejemplo:

- Autorizo atención ante emergencia médica.
- Autorizo uso de imagen.
- Autorizo actividad acuática.
- Autorizo salidas / excursiones.
- Autorizo tratamiento de datos por parte de Aquamar.

Debe soportar:

- autorizaciones base de Eventia
- autorizaciones personalizadas del programa
- traducciones por idioma
- activar/desactivar
- obligatoria/no obligatoria


Pantalla front:

Habrá un botón asociado al Programa (evento) que diga (al igual que “Períodos / Semanas”) que diga “**Autorizaciones**”

Al hacer clic se abrirá una pantalla con una grilla:

**Endpoint**:

**GET /programas/{idEvento}/autorizaciones-config?idIdioma=3&soloActivas=false** 

(postman: ColoniaVacaciones\ Listar Servicios de un Programa)

Authorization: Bearer TOKEN

- Orden (campo orden)
- Código (campo codigo)
- Tipo (base / personalizada)
- Título (campo titulo)
- Obligatoria (campo obligatoria)
- Requiere aceptación (campo requiere\_aceptacion)
- Requiere datos responsable (campo requiere\_datos\_responsable)
- Activa (campo activo)
- Idiomas (endpoint futuro)
- Acciones:
  - Editar 
  - Traducciones
  - Activar 
  - Desactivar

Y un botón en la parte superior “**Agregar Autorización**”

Alta

Formulario:

- **Tipo de Autorización:**
  - Combo:
    - Usar autorización base de Eventia
    - Crear autorización personalizada
- Usar Autorización Base
  - Autorización Base
    - combo
    - Obligatorio
    - **Endpoint**:

      **GET /programas/autorizaciones-base?idIdioma=3** 

      (postman: ColoniaVacaciones\Listar Catalogo Autorizaciones Base)

      El front guarda:

- id\_autorizacion\_base
- codigo

- Obligatoria
  - Campo: obligatoria
  - toggle

- Requiere Aceptación
  - Campo: requiere\_aceptacion
  - toggle

- Requiere datos Responsable
  - Campo: requiere\_datos\_responsable
  - toggle

- Orden
  - Campo: orden
  - numérico

- Activa
  - Campo: activo
  - toggle

**Endpoint:**

**POST /programas/34/autorizaciones-config/upsert**

(postman: ColoniaVacaciones\Guardar autorizacion Emergencia medica)

JSON ejemplo: emergencia médica

{

`  `"id\_programa\_autorizacion\_config": **null**,

`  `"id\_evento": 34,

`  `"id\_autorizacion\_base": 1,

`  `"codigo": "EMERGENCIA\_MEDICA",

`  `"obligatoria": **true**,

`  `"requiere\_aceptacion": **true**,

`  `"requiere\_datos\_responsable": **true**,

`  `"orden": 1,

`  `"activo": **true**

}

- Crear Autorización Personalizada

  Ejemplos:

- Aquamar quiere pedir autorización para tratamiento de datos.
- Otro casal de montaña quiere pedir autorización para escalada.
- Otro programa de invierno quiere pedir autorización para esquí o trineo.

Campos:

- Código interno
  - Campo: codigo
  - input
  - Obligatorio, uppercase
  - Ejemplo: CUSTOM\_TRATAMIENTO\_DATOS\_EMPRESA

- Obligatoria
  - Campo: obligatoria
  - Toggle
  - obligatorio

- Requiere Aceptación
  - Campo: requiere\_aceptacion
  - Toggle
  - obligatorio

- Requiere datos Responsable
  - Campo: requiere\_datos\_responsable
  - Toggle
  - obligatorio

- Orden
  - Campo: orden
  - Numérico
  - obligatorio

- Activa
  - Campo: activo
  - Toggle
  - obligatorio

Después de guardar la configuración, se habilita pantalla de traducciones.

**Endpoint**:

**POST /programas/34/autorizaciones-config/upsert**

JSON autorización personalizada:

{

`  `"id\_programa\_autorizacion\_config": **null**,

`  `"id\_evento": 34,

`  `"id\_autorizacion\_base": **null**,

`  `"codigo": "CUSTOM\_TRATAMIENTO\_DATOS\_AQUAMAR",

`  `"obligatoria": **true**,

`  `"requiere\_aceptacion": **true**,

`  `"requiere\_datos\_responsable": **true**,

`  `"orden": 7,

`  `"activo": **true**

}

Respuesta

{

`    `"id\_programa\_autorizacion\_config": 3,

`    `"id\_evento": 34,

`    `"id\_autorizacion\_base": **null**,

`    `"codigo": "CUSTOM\_TRATAMIENTO\_DATOS\_AQUAMAR",

`    `"titulo": **null**,

`    `"texto": **null**,

`    `"titulo\_override": **null**,

`    `"texto\_override": **null**,

`    `"obligatoria": **true**,

`    `"requiere\_aceptacion": **true**,

`    `"requiere\_datos\_responsable": **true**,

`    `"orden": 7,

`    `"activo": **true**

}


Traducciones de autorización

*Objetivo*

Cargar el título y texto que se verá en la inscripción pública según idioma.

Desde la grilla:

Acciones → Traducciones

Pantalla:

Traducciones — Autorización\
Código: CUSTOM\_TRATAMIENTO\_DATOS\_AQUAMAR
##
**Endpoint para obtener traducciones de una autorizacion**

**GET /programas/autorizaciones-config/{idProgramaAutorizacionConfig}/traducciones**

Ejemplo:

GET /programas/autorizaciones-config/3/traducciones
##
El sistema arma una grilla editable, con una fila por idioma activo:

- Idioma (sólo lectura)
- Locale (sólo lectura)
- Título (input)
- Texto (textarea)
- Activo (toggle)

Y si para algún idioma encuentra traducción con el endpoint anterior la completa.

Luego de completar las traducciones, el usuario hace clic en el botón “**Guardar traducciones**”:

**Endpoint**:

**PUT /programas/autorizaciones-config/{idProgramaAutorizacionConfig}/traducciones**

Ejemplo:

PUT /programas/autorizaciones-config/3/traducciones

JSON:

{

`  `"items": [

`    `{

`      `"id\_idioma": 3,

`      `"titulo": "Autorització per al tractament de dades per part d’Aquamar",

`      `"texto": "Autoritzo Aquamar a tractar les dades facilitades en aquesta inscripció per a la gestió del casal i les comunicacions relacionades.",

`      `"activo": **true**

`    `},

`    `{

`      `"id\_idioma": 1,

`      `"titulo": "Autorización para el tratamiento de datos por parte de Aquamar",

`      `"texto": "Autorizo a Aquamar a tratar los datos facilitados en esta inscripción para la gestión del casal y las comunicaciones relacionadas.",

`      `"activo": **true**

`    `},

`    `{

`      `"id\_idioma": 2,

`      `"titulo": "Authorization for data processing by Aquamar",

`      `"texto": "I authorize Aquamar to process the data provided in this registration for the management of the summer camp and related communications.",

`      `"activo": **true**

`    `}

`  `]

}

Respuesta:

{

`    `"ok": **true**

}


Acciones à Activar / desactivar autorización

**Endpoint**:

**PUT /programas/autorizaciones-config/{idProgramaAutorizacionConfig}/set-activo?activo=false**

Ejemplo:

PUT /programas/autorizaciones-config/2/set-activo?activo=false

Respuesta:

{

`    `"ok": **true**,

`    `"id\_programa\_autorizacion\_config": 2,

`    `"activo": **false**

}



**Programa Salud / Ficha Médica**

Objetivo

Permitir que cada programa defina qué información médica necesita pedir en la inscripción y luego pueda consultar esa información de forma operativa.

Ejemplos:

- ¿Tiene alergias?
- ¿Tiene restricciones alimentarias?
- ¿Tiene alguna condición médica?
- ¿Toma medicación?
- ¿Puede realizar actividad física?
- ¿Sabe nadar?
- Observaciones médicas
- Contacto de emergencia

Esto sirve para:

- inscripción pública
- operación diaria del casal
- emergencias
- reportes para monitores/coordinadores
- diferencial comercial 

Como módulo lo vamos a llamar “Programa Salud”, ya que puede servir para

- casales
- colonias
- campamentos
- programas deportivos
- programas para adultos
- actividades náuticas
- viajes grupales
- etc

No son consentimientos, son datos declarativos:

- Ficha médica declarada
- Tiene alergia a frutos secos.
- Toma medicación.
- Tiene asma.
- No puede realizar actividad intensa.
- Contacto de emergencia
- Acciones / incidentes
- Restricciones alimentarias.


**Circuito funcional Completo**

Paso 1 — El organizador define qué datos de salud va a pedir en la inscripción

Ejemplo:

Pedir alergias: Sí\
Pedir restricciones alimentarias: Sí\
Pedir medicación: Sí\
Pedir condición médica: Sí\
Pedir contacto de emergencia: Sí\
Pedir apto actividad física: Sí\
Pedir sabe nadar: Sí
##
Paso 2 — El padre completa la ficha en la inscripción pública

Por cada participante:

Ficha médica de Martina López

Completa los datos.
##
Paso 3 — El sistema guarda snapshot por participante

Después se puede consultar:

Participantes con alergias\
Participantes con medicación\
Participantes con condición médica\
Contactos de emergencia\
Reporte para monitores

Registro de acciones / incidentes de salud

Ejemplos:

Se administró medicación.\
Se llamó al responsable.\
Se registró dolor de panza.\
Se aplicó hielo por golpe.\
Se derivó a atención médica.

Pantalla front:

Habrá un botón asociado al Programa (evento) que diga (al igual que “Períodos / Semanas”, “Autorizaciones”, “Servicios”) “**Configuración Salud**”

Al hacer clic se abrirá una pantalla:

Campos:

- Solicitar problemas médicos
  - Campo: pedir\_problema\_medico
  - Toggle
- Obligatorio
  - Campo: problema\_medico\_obligatorio
  - Toggle

(podrían ir uno al lado del otro, de a pares)

- Solicitar alergias no alimentarias
  - Campo: pedir\_alergias\_no\_alimentarias
  - Toggle
- Obligatorio
  - Campo: alergias\_no\_alimentarias\_obligatorio
  - Toggle

- Solicitar necesidades especiales
  - Campo: pedir\_necesidad\_especial
  - Toggle
- Obligatorio
  - Campo: necesidad\_especial\_obligatorio
  - Toggle

- Solicitar cobertura médica
  - Campo: pedir\_cobertura\_medica
  - Toggle
- Obligatorio
  - Campo: cobertura\_medica\_obligatorio
  - Toggle
  - Ayuda: Permite pedir obra social / seguro médico.

- Solicitar contacto de emergencia
  - Campo: pedir\_contacto\_emergencia
  - Toggle
- Obligatorio
  - Campo: contacto\_emergencia\_obligatorio
  - Toggle
  - Default encendido / obligatorio

- Solicitar autorización para actuación en emergencia médica
  - Campo: pedir\_autoriza\_emergencia\_medica
  - Toggle
- Obligatorio
  - Campo: autoriza\_emergencia\_medica\_obligatorio
  - Toggle
  - Default encendido / obligatorio

- Solicitar observaciones de la familia
  - Campo: pedir\_observaciones\_familia
  - Toggle
- Obligatorio
  - Campo: observaciones\_familia\_obligatorio
  - Toggle

- Solicitar sección medicaciones
  - Campo: pedir\_medicaciones
  - Toggle
- Obligatorio
  - Campo: medicaciones\_obligatorio
  - Toggle

Sección resumen preview

Abajo pondría: Vista previa de inscripción

Ejemplo:

Se pedirá:\
✓ Problemas médicos\
✓ Alergias\
✓ Contacto emergencia\
✓ Medicaciones

Cómo se arma lo anterior?

La **vista previa** tiene que estar documentada con reglas fijas de render según cada toggle.

Ejemplo:

Si está prendido: pedir\_contacto\_emergencia = true

el front debe mostrar este bloque completo:

Contacto de emergencia\
\- Nombre\
\- Teléfono\
\- Relación

Y si además contacto\_emergencia\_obligatorio = true, entonces esos campos se muestran con \*.

Reglas de preview

|**Toggle**|**Bloque que muestra**|
| :- | :- |
|**pedir\_problema\_medico**|¿Tiene algún problema médico? + Detalle|
|**pedir\_alergias\_no\_alimentarias**|¿Tiene alergias no alimentarias? + Detalle|
|**pedir\_necesidad\_especial**|¿Tiene alguna necesidad especial? + Detalle|
|**pedir\_cobertura\_medica**|Cobertura médica + Nombre cobertura + Número|
|**pedir\_contacto\_emergencia**|Contacto emergencia + Nombre + Teléfono + Relación|
|**pedir\_autoriza\_emergencia\_medica**|Checkbox de autorización médica|
|**pedir\_observaciones\_familia**|Observaciones adicionales|
|**pedir\_medicaciones**|¿Toma medicación? + grilla de medicaciones|

Entonces la vista previa no inventa, renderiza según este mapa:

pedir\_contacto\_emergencia\
→ mostrar bloque Contacto emergencia\
→ campos: nombre, teléfono, relación

pedir\_cobertura\_medica\
→ mostrar bloque Cobertura médica\
→ campos: nombre cobertura, número afiliado/póliza

pedir\_medicaciones\
→ mostrar bloque Medicaciones\
→ pregunta “¿Toma medicación?”\
→ si sí, permitir agregar medicamento

Entonces la sección preview muestra una simulación de la sección “Salud” tal como la verá la familia en la inscripción pública, usando la configuración actual del formulario.



**Botón: Guardar configuración**

**Endpoint**:

**POST /programas/34/salud/config/upsert**

(postman: ColoniaVacaciones\ Configurar parametros de salud)

JSON:

{

`  `"pedir\_problema\_medico": **true**,

`  `"problema\_medico\_obligatorio": **false**,

`  `"pedir\_alergias\_no\_alimentarias": **true**,

`  `"alergias\_no\_alimentarias\_obligatorio": **false**,

`  `"pedir\_necesidad\_especial": **true**,

`  `"necesidad\_especial\_obligatorio": **false**,

`  `"pedir\_cobertura\_medica": **false**,

`  `"cobertura\_medica\_obligatorio": **false**,

`  `"pedir\_contacto\_emergencia": **true**,

`  `"contacto\_emergencia\_obligatorio": **true**,

`  `"pedir\_autoriza\_emergencia\_medica": **true**,

`  `"autoriza\_emergencia\_medica\_obligatorio": **true**,

`  `"pedir\_observaciones\_familia": **true**,

`  `"observaciones\_familia\_obligatorio": **false**,

`  `"pedir\_medicaciones": **true**,

`  `"medicaciones\_obligatorio": **false**,

`  `"activo": **true**

}

Respuesta:

{

`    `"id\_salud\_config": 1,

`    `"id\_evento": 34,

`    `"pedir\_problema\_medico": **true**,

`    `"problema\_medico\_obligatorio": **false**,

`    `"pedir\_alergias\_no\_alimentarias": **true**,

`    `"alergias\_no\_alimentarias\_obligatorio": **false**,

`    `"pedir\_necesidad\_especial": **true**,

`    `"necesidad\_especial\_obligatorio": **false**,

`    `"pedir\_cobertura\_medica": **false**,

`    `"cobertura\_medica\_obligatorio": **false**,

`    `"pedir\_contacto\_emergencia": **true**,

`    `"contacto\_emergencia\_obligatorio": **true**,

`    `"pedir\_autoriza\_emergencia\_medica": **true**,

`    `"autoriza\_emergencia\_medica\_obligatorio": **true**,

`    `"pedir\_observaciones\_familia": **true**,

`    `"observaciones\_familia\_obligatorio": **false**,

`    `"pedir\_medicaciones": **true**,

`    `"medicaciones\_obligatorio": **false**,

`    `"activo": **true**

}


**Staff**

Objetivo

Permitir que el programa tenga usuarios operativos con acceso limitado para resolver tareas reales:

- ver participantes
- ver alertas médicas
- ver restricciones alimentarias
- registrar incidentes
- registrar medicación administrada
- ver autorizaciones
- hacer check-in / asistencia
- consultar contacto de emergencia

No todos deben poder editar configuración, precios, servicios o datos comerciales.

Guido: te dejo copiado lo que me puso el chatgpt…. No sé como implementaste lo de staff… te dejo esta parte para que la completes vos

Usemos lo que ya existe:

ef\_usuarios\
ef\_evento\_usuarios\
ef\_staff\
ef\_staff\_unidades\_roles\
ef\_usuarios\_roles

La sensación que tenés es correcta: si seguimos creando tablas paralelas, Programas termina pareciendo otro sistema. Hay que apoyarlo sobre Eventia.
## Decisión
Para el staff del programa usamos:

ef\_evento\_usuarios

porque un programa sigue siendo un registro en:

ef\_eventos

Entonces el staff operativo del programa es, técnicamente:

usuarios asociados al evento/programa con un rol específico

-----
## Roles que agregaría al catálogo ef\_roles
En vez de crear tabla nueva, agregaría roles nuevos:

PROGRAM\_ADMIN\
PROGRAM\_COORDINATOR\
PROGRAM\_MONITOR\
PROGRAM\_HEALTH\
PROGRAM\_KITCHEN\
PROGRAM\_CHECKIN

Si querés mantenerlo más genérico:

EVENT\_ADMIN\
EVENT\_COORDINATOR\
EVENT\_MONITOR\
EVENT\_HEALTH\
EVENT\_KITCHEN\
EVENT\_CHECKIN

Pero como esto es muy de programas/casal, yo usaría PROGRAM\_....

-----
## Cómo se guarda
### ef\_evento\_usuarios
Guarda:

id\_evento = 34\
id\_usuario = usuario del monitor / cocina / salud\
id\_rol = PROGRAM\_MONITOR / PROGRAM\_KITCHEN / PROGRAM\_HEALTH\
activo = true

Eso ya te sirve para:

saber quién trabaja en ese programa\
saber qué puede ver\
listar staff del programa\
desactivar accesos\
validar permisos por evento

-----
## Qué NO haría ahora
No crearía:

ef\_programa\_staff

Porque duplicaría:

evento + usuario + rol + activo

y eso ya lo tenés.

-----
## Qué sí puede faltar
Puede que ef\_evento\_usuarios no tenga estos campos:

nombre temporal\
email invitado\
estado invitación\
id\_grupo

Pero no los agregaría todavía salvo que sean imprescindibles.

Para MVP funcional:

El usuario ya existe → lo agregás al programa con rol

Después hacemos invitación por email si hace falta.

-----
## Pantalla Staff usando lo existente
Programa\
→ Staff / Equipo
### Grilla
Endpoint sugerido:

GET /programas/34/staff

La query lee ef\_evento\_usuarios.

Columnas:

Usuario\
Email\
Rol\
Activo\
Acciones

-----
## Formulario Agregar staff
Campos:

Usuario / email\
Rol operativo\
Activo

Regla simple:

El email debe existir como usuario en Eventia.

Si no existe:

mostrar mensaje: “Primero debe registrarse el usuario o enviar invitación cuando implementemos invitaciones.”

-----
## Roles y vistas

|**Rol**|**Vista sugerida**|
| :-: | :-: |
|PROGRAM\_ADMIN|Todo el programa|
|PROGRAM\_COORDINATOR|Participantes, asistencia, salud, incidentes|
|PROGRAM\_MONITOR|Participantes asignados, asistencia, alertas básicas|
|PROGRAM\_HEALTH|Fichas médicas, medicaciones, incidentes|
|PROGRAM\_KITCHEN|Comedor y restricciones alimentarias|
|PROGRAM\_CHECKIN|Entrada/salida/retiro|

-----
## Conclusión clara
Sí: **usemos lo existente**.

El bloque staff debería apoyarse en:

ef\_evento\_usuarios + ef\_roles + ef\_usuarios

Y, si más adelante necesitás asignación por grupo/sección, ahí agregamos una tabla chica tipo:

ef\_programa\_staff\_grupos




