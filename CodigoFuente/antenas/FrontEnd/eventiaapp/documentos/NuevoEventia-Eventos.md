# Eventia – Eventos B2C y B2B 

Objetivo

Definir el circuito funcional y visual del módulo de eventos para front, contemplando usuarios B2C, usuarios que además pertenecen a una cuenta B2B, eventos personales, eventos de cuenta, eventos para clientes y eventos públicos tipo tardeo\.

1\. Reglas

Un mismo usuario puede operar en más de un contexto con el mismo login\.

El sistema NO debe asumir que por pertenecer a una cuenta todo evento nuevo será B2B\. La naturaleza del evento depende del contexto de creación elegido por el usuario\.

Se distinguen dos contextos de navegación:

- Mi espacio
- Cuenta

2\. Menús principales

- Mi espacio

\(Área personal del usuario\)

- 
	- Submenúes posibles:
		- Mis eventos
			- Muestra eventos personales del usuario

__Endpoint__: __GET /eventos/mios__

- 
	- 
		- Crear evento
			- Abre form Nuevo evento
		- Mi perfil
			- Datos de acceso
				- Email
				- Fecha Alta
				- Último Acceso

__Endpoint: GET /usuarios/mi\-perfil__

__\(postman: Usuarios\\__ Mi Perfil__\)__

- 
	- 
		- 
			- Datos personales básicos
				- nombre 
				- apellido 
				- teléfono 
				- país/región 
				- idioma preferido

__Endpoint: GET /usuarios/mi\-perfil__

- 
	- 
		- 
			- Preferencias de uso
				- idioma por defecto para creación de eventos
				- si desea recibir novedades

__Endpoint: GET /usuarios/mi\-perfil__

- 
	- 
		- 
			- Seguridad
				- cambiar contraseña \(pendiente\)
			- Resumen de actividad
				- cantidad de eventos propios 
				- cantidad de eventos compartidos 
				- último evento creado

En este contexto se crean eventos B2C\.

- Cuenta

\(Área de la cuenta a la que pertenece el usuario\)

- 
	- Submenúes posibles:
		- Dashboard: es una idea para desarrollar:

Objetivo

Dar al usuario de cuenta una vista rápida del estado operativo y comercial de su cuenta\.

Qué podríamos mostrar:

Card 1\. Resumen general

- nombre de cuenta
- plan de cuenta
- cantidad de unidades activas
- cantidad de usuarios activos
- cantidad de clientes activos

Card 2\. Eventos próximos

- próximos 5 eventos de la cuenta
- tipo de evento
- unidad
- fecha
- estado

Card 3\. Eventos por estado

- borrador
- activo
- pendiente de pago
- cerrado 

Card 4\. Eventos por unidad

- Bar: cantidad
- Restaurante: cantidad
- Salón: cantidad

Card 5\. Accesos rápidos

- Nuevo evento
- Nueva unidad
- Nuevo cliente
- Ver audiencias \(próximo desarrollo\)

Card 6\. Audiencias

- personas captadas último mes
- eventos públicos activos
- links activos
- top unidad con más registros
	- 
		- Unidades
			- Listar Unidades

__Endpoint: GET /cuenta\_unidades/MisUnidades?soloActivas=true__

__\(postman: B2B\\__Listar Unidades de una cuenta__\)__

- 
	- 
		- Clientes
			- Listar Clientes

__Endpoint: GET / clientes/MisClientes?soloActivos=true__

__\(postman: Clientes\\__Listar Clientes o Clientes\\Listar Clientes Activos__\)__

- 
	- 
		- Eventos

__Endpoint: GET /__ __cuenta\_eventos/mis\-eventos__

__\(postman: B2B\\__Eventos de mi cuenta__\)__

- 
	- 
		- Audiencias \(pendiente implementación\)
		- Usuarios

__Endpoint: GET /__ __cuenta\_eventos/mis\-eventos__

__\(postman: B2B\\__Eventos de mi cuenta__\)__

- 
	- 
		- Plan y facturación

__Endpoint: GET /__ __cuentas/MiPlan__

__\(postman: B2B\\__Plan y factuacion de la cuenta__\)__

En este contexto se crean eventos B2B\.

3\. Reglas de visibilidad de menús según login

Qué ocurre después del login?

Después de autenticarse, el front debe consultar el siguiente endpoint y, en base a esa respuesta, construir la navegación \(__Endpoint: GET /auth/me__\)

*Ejemplo 1 – se loguea un usuario que ya se registró y que entró por B2C:*

__Endpoint__

__POST /auth/login__

__\(postman: Eventos B2C\-B2B\-Completo\\__ Post Login \- Mauricio usuario B2C__\)__

__Endpoint__

__GET /auth/me__

__\(postman: Eventos B2C\-B2B\-Completo\\__ Auth me__\)__

Respuesta:

\{

    "usuario": \{

        "id\_usuario": 8,

        "email": "mauricio@eventia\.com"

    \},

    "roles\_globales": \[\],

    "cuenta": \{

        "estado\_ui": "SIN\_CUENTA",

        "id\_cuenta": __null__,

        "nombre\_cuenta": __null__,

        "tipo": __null__,

        "estado": __null__,

        "id\_plan": __null__,

        "plan\_codigo": __null__,

        "rol\_cuenta": __null__,

        "vinculo\_activo": __null__

    \},

    "eventos": \{

        "cantidad\_propios": 0,

        "cantidad\_compartidos": 0

    \},

    "ui": \{

        "mostrar\_solicitar\_cuenta": __true__,

        "mostrar\_estado\_cuenta\_pendiente": __false__,

        "mostrar\_menu\_cuenta": __false__,

        "mostrar\_admin": __false__,

        "puede\_crear\_evento\_b2c": __true__

    \}

\}

Cómo interpretar la respuesta:

*Bloque “usuario”:*

Identifica al usuario autenticado, datos básicos

*Bloque “roles\_globales”:*

Lista de roles del usuario que no dependen de una cuenta específica ni de un evento específico\.

Sirven para habilitar opciones generales del sistema\.

Si viene vacío significa que el usuario no tiene privilegios globales especiales y el front puede ignorarlo para la navegación normal\.

*Bloque “cuenta”:*

Define el contexto B2B actual del usuario\.

Para qué sirve

- saber si existe una cuenta activa para operar 
- obtener el nombre de la cuenta 
- obtener el plan de cuenta 
- obtener el rol del usuario dentro de la cuenta 
- completar el contexto B2B

Cómo lo interpreta el front:

Caso: sin cuenta

"cuenta": \{  
  "estado\_ui": "SIN\_CUENTA",  
  "id\_cuenta": null,  
  "nombre\_cuenta": null,  
  "tipo": null,  
  "estado": null,  
  "id\_plan": null,  
  "plan\_codigo": null,  
  "rol\_cuenta": null,  
  "vinculo\_activo": null  
\}

Interpretación:

- no hay contexto B2B disponible 
- no se puede crear evento de cuenta 
- no se muestran datos de cuenta 

Caso: cuenta activa

"cuenta": \{  
  "estado\_ui": "CUENTA\_ACTIVA",  
  "id\_cuenta": 1,  
  "nombre\_cuenta": "Eventos Full",  
  "tipo": "B2B",  
  "estado": "A",  
  "id\_plan": 6,  
  "plan\_codigo": "B2B\_STARTER",  
  "rol\_cuenta": "ACCOUNT\_ADMIN",  
  "vinculo\_activo": true  
\}

Interpretación:

- hay contexto B2B activo 
- se puede mostrar menú Cuenta 
- se pueden crear eventos de cuenta 
- se puede mostrar dashboard de cuenta 
- el rol de cuenta sirve para permisos dentro de ese menú 

Importante: El bloque cuenta __describe el contexto B2B__, pero la decisión final de navegación visible se toma con ui\.

*Bloque “eventos”:*

Sirve para mostrar indicadores rápidos del espacio personal del usuario

Para qué sirve:

- mostrar contadores rápidos en dashboard 
- mostrar estados vacíos o CTA 
- personalizar bienvenida del usuario 

Ejemplo:

"eventos": \{  
  "cantidad\_propios": 0,  
  "cantidad\_compartidos": 0  
\}

Uso sugerido en front:

- “Todavía no tenés eventos propios” 
- “Tenés 3 eventos compartidos” 
- mostrar accesos rápidos según si ya hay o no eventos

*Bloque “ui”:*

Es el bloque principal para que front resuelva navegación y visibilidad\. Contiene __banderas ya preparadas por backend__ para que el front no tenga que deducir lógica compleja\.

Para qué sirve:

- qué menús mostrar 
- qué CTAs mostrar 
- qué navegación habilitar 
- qué acciones principales permitir

## ui\.mostrar\_menu\_cuenta

Si es true:

- Mostrar menú __Cuenta__

Si es false:

- Ocultar menú __Cuenta__

## ui\.puede\_crear\_evento\_b2c

Si es true:

- Mostrar __Mi espacio__ y permitir crear eventos personales

Si es false:

- Ocultar o deshabilitar el alta B2C

## ui\.mostrar\_solicitar\_cuenta

Si es true:

- Mostrar CTA o banner:
	- “Solicitar cuenta” 
	- O el texto comercial que se defina

## ui\.mostrar\_estado\_cuenta\_pendiente

Si es true:

- Mostrar mensaje o banner indicando que la cuenta existe pero todavía no está operativa/aprobada

## ui\.mostrar\_admin

Si es true:

- Mostrar opciones globales de administración

4\. Reglas para construir el menú

Mostrar menú “Mi espacio”:

- ui\.puede\_crear\_evento\_b2c = true

Mostrar menú “Cuenta”:

- ui\.mostrar\_menu\_cuenta = true

Mostrar CTA “Solicitar cuenta”:

- ui\.mostrar\_solicitar\_cuenta = true

Mostrar banner o aviso de estado cuenta pendiente:

- ui\.mostrar\_estado\_cuenta\_pendiente = true

Mostrar menú “Admin”:

- ui\.mostrar\_admin = true

Ejemplos luego del auth/me

*Usuario solo B2C*

- 
	- cuenta\.estado\_ui = "SIN\_CUENTA"
	- cuenta\.id\_cuenta = null
	- ui\.mostrar\_menu\_cuenta = false
	- ui\.puede\_crear\_evento\_b2c = true

Qué muestra el front:

- Mi espacio
- Crear evento 
- Opcional: CTA Solicitar cuenta

Qué no muestra:

- Cuenta

*Usuario que pertenece a una cuenta B2B activa*

\{

    "usuario": \{

        "id\_usuario": 7,

        "email": "amaia@eventosfull\.com"

    \},

    "roles\_globales": \[\],

    "cuenta": \{

        "estado\_ui": "CUENTA\_ACTIVA",

        "id\_cuenta": 2,

        "nombre\_cuenta": "Salon Eventos Full",

        "tipo": "SALON",

        "estado": "A",

        "id\_plan": 5,

        "plan\_codigo": "B2B\_STARTER",

        "rol\_cuenta": "ACCOUNT\_ADMIN",

        "vinculo\_activo": __true__

    \},

    "eventos": \{

        "cantidad\_propios": 0,

        "cantidad\_compartidos": 0

    \},

    "ui": \{

        "mostrar\_solicitar\_cuenta": __false__,

        "mostrar\_estado\_cuenta\_pendiente": __false__,

        "mostrar\_menu\_cuenta": __true__,

        "mostrar\_admin": __false__,

        "puede\_crear\_evento\_b2c": __true__

    \}

\}

Qué muestra el front:

- Mi espacio
- Cuenta

*Usuario que pertenece a una cuenta pero quiere hacer un evento suyo personal*

Aunque el usuario tenga cuenta activa, si quiere crear un evento propio debe ingresar por __Mi espacio__\. Ese evento será B2C\.

Condición que lo permite:

- ui\.puede\_crear\_evento\_b2c = true

*Usuario staff de cuenta sin espacio personal habilitado*

Todavía no lo tenemos implementado, pero el front debería ocultar “Mi espacio” cuando:

- ui\.puede\_crear\_evento\_b2c = false
- ui\.mostrar\_menu\_cuenta = true

No olvidar:

- Si entra por Mi espacio → evento B2C
- Si entra por Cuenta → evento B2B

4\. Casos de uso principales

Caso 1\. Usuario B2C crea evento personal:

- Contexto: Mi espacio 
- Resultado: evento B2C

Caso 2\. Usuario de cuenta crea evento propio de una unidad

- Contexto: Cuenta 
- Resultado: evento B2B propio

Caso 3\. Usuario de cuenta crea evento para cliente

- Contexto: Cuenta 
- Resultado: evento B2B para cliente

Caso 4\. Usuario de cuenta crea evento personal para él mismo

- Contexto: Mi espacio 
- Resultado: evento B2C

Caso 5\. Usuario de cuenta crea tardeo para unidad Bar

- Contexto: Cuenta 
- Resultado: evento B2B propio, público, con plantilla Tardeo

Caso 6\. Usuario de cuenta crea cumpleaños para cliente del salón

Contexto: Cuenta 

Resultado: evento B2B para cliente, evento privado

__Estructura pantalla Crear Evento B2C:__

Step1: Información Básica

Campos:

- Idioma del Evento
- Tipo de evento:
	- Mostrar: Siempre y obligatorio\. Combo
	- Tipos de evento traducidos por idioma
- Plan \(debajo en letra chica poner la leyenda “Podrás cambiarlo más adelante”\)
- Dress code 
- Detalle dress code 
- Anfitriones 
- Saludo 
- Mensaje bienvenida 
- Notas 

Step2: Elegir Estructura

- Se selecciona Plantilla / o se crea Estructura 

Step3: Datos Base

- Editar Estructura

Step4: Listo

__Agregar__ __sección__: Acceso y Confirmación \(u otro nombre más descriptivo\) para B2C y B2B

__Tipo de evento \(campo es\_publico\)__

- Privado \(guarda false\)
- Público \(guarda true\)

__Cómo ingresan las personas \(campo modo\_acceso\)__

- Por invitación \(guarda “I”\)
- Por link público \(guarda “L”\)

__Cómo se registra la asistencia \(campo modo\_asistencia\)__

- Confirmación previa \(guarda “R”\)
- Control al ingresar \(guarda “C”\)

__Endpoint__:

__PUT /eventos/\{idEvento\}/configuración__

__\(postman: Eventos B2C\-B2B\-Completo\\Acceso y Confirmacion del evento\)__

JSON:

Ejemplo 1: para boda, cumpleaños

\{

  "EsPublico": __false__,

  "ModoAcceso": "I",

  "ModoAsistencia": "R"

\}

Respuesta:

\{

    "idEvento": 20,

    "idTipoEvento": 3,

    "tipoEventoCodigo": "WEDDING",

    "tipoEventoDescripcion": "Boda",

    "idIdioma": 1,

    "idCuenta": __null__,

    "idUnidad": __null__,

    "unidadNombre": __null__,

    "idCliente": __null__,

    "clienteNombre": __null__,

    "modalidad": __null__,

    "anfitrionesTexto": "Alicia y novio",

    "estado": "P",

    "fechaAlta": "2026\-04\-07T13:25:33\.613231\+00:00",

    "idDressCode": __null__,

    "dressCodeDescripcion": __null__,

    "dressCodeTexto": __null__,

    "saludo": "Nos vamos a casar\!",

    "mensajeBienvenida": "Gracias por estar con nosotros",

    "notas": "Boda paga",

    "idPlan": 4,

    "planCodigo": "B2C\_PRO",

    "planNombre": "B2C Pro",

    "cuentaPlanCodigo": __null__,

    "cuentaPlanNombre": __null__

\}

Ejemplo 2: para un tardeo / after:

\{

  "EsPublico": __true__,

  "ModoAcceso": "L",

  "ModoAsistencia": "R"

\}

Ejemplo 3: para evento con control fuerte en puerta

\{

  "EsPublico": __true__,

  "ModoAcceso": "L",

  "ModoAsistencia": "C"

\}

__Estructura pantalla Crear Evento B2B \- PROPIO:__

Step1: Información Básica

Campos:

- Idioma del Evento
- Tipo de evento:
	- Mostrar: Siempre y obligatorio\. Combo
	- Tipos de evento traducidos por idioma
- Unidad: 
	- Mostrar: sólo en B2B y obligatorio\. Combo
	- Son las unidades activas de la cuenta logueada

__Endpoint__:

__GET /cuenta\_unidades/MisUnidades?soloActivas=true __

Ejemplos:

- 
	- 
		- Bar 
		- Restaurante 
		- Salón 
- Para quién es este evento?: \(no es un campo que se guarda en BD, nos sirve para mostrar o no el campo cliente\)
	- Para mi unidad / negocio \(valor PROPIO\)
	- Para un cliente \(valor CLIENTE\)
- Cliente \(se muestra según la selección anterior, o sea si eligió CLIENTE\)
	- Combo con los clientes de la cuenta \(tienen que estar dados de alta previamente\)
	- Que muestra el combo:
		- nombre\_cliente 
		- email o telefono 
		- unidad\_principal
	- __Endpoint__:

__GET /clientes/MisClientes?soloActivos=true__

__\(postman: Clientes\\Listar Clientes Activos\) logueado con usuario que pertenezca a una cuenta__

- Dress code 
- Detalle dress code 
- Anfitriones 
- Saludo 
- Mensaje bienvenida 
- Notas 

El resto de los steps son iguales\.

