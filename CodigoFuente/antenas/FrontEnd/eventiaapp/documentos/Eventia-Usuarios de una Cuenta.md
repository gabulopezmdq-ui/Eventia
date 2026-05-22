# Eventia – Usuarios de Cuenta

Objetivo: 

Permitir que un ACCOUNT\_ADMIN invite usuarios a una cuenta B2B para que puedan operar en ese espacio.

Un usuario puede tener:

- Mi espacio personal
- Cuenta Aquamar
- Cuenta Salón Faro Norte
- Cuenta Juan Eventos

El front debe trabajar siempre con una **cuenta activa seleccionada**.

Ejemplo:

idCuentaActiva = 5\
nombreCuentaActiva = Aquamar\
rolCuentaActiva = ACCOUNT\_ADMIN

Todos los endpoints de usuarios de cuenta reciben: idCuenta

**Menú: Cuenta → Usuarios**

Objetivo

Mostrar los usuarios asociados a la cuenta seleccionada y permitir:

- ver usuarios activos/inactivos 
- invitar nuevo usuario 
- cambiar rol 
- activar/desactivar usuario

Pantalla

En la parte superior colocar un botón “**Invitar Usuario”**

Grilla:

**Endpoint**:

**GET /cuenta\_usuarios/MisUsuarios?idCuenta=2**\
Authorization: Bearer TOKEN

Respuesta

[

`    `{

`        `"id\_usuario": 7,

`        `"id\_cuenta\_usuario": 2,

`        `"nombre": "Amaia",

`        `"apellido": "Castel",

`        `"email": "amaia@eventosfull.com",

`        `"rol\_cuenta": "ACCOUNT\_ADMIN",

`        `"activo": **true**,

`        `"fecha\_alta": "2026-04-08T12:03:49.358227+00:00"

`    `}

]

Columnas:

- Id vínculo
  - Visible o no
  - Campo id\_cuenta\_usuario
- Nombre
  - Campo nombre
- Apellido
  - Campo apellido
- Email
  - Campo email
  - Es el email del login
- Rol
  - Campo rol\_cuenta
  - ACCOUNT\_ADMIN / ACCOUNT\_STAFF
- Estado
  - Campo activo
  - Toggle
- Fecha Alta
  - Campo fecha\_alta
- Acciones
  - Cambiar Rol
  - Activar / Desactivar

Ejemplo:

|**Usuario**|**Email**|**Rol**|**Estado**|**Acciones**|
| :- | :- | :- | :- | :- |
|Laura Pérez|<laura@aquamar.com>|Administrador|Activo|Cambiar rol|
|Martín Gómez|<martin@aquamar.com>|Staff|Activo|Cambiar rol / Desactivar|
|Sofía Ruiz|<sofia@aquamar.com>|Staff|Inactivo|Activar|


Botón “**Invitar Usuario”**

Al hacer clic en el botón, se abre un modal con los siguientes campos:

- Email usuario invitado
  - Input email
  - Obligatorio
- Rol
  - Combo de opciones:
    - Administrador de cuenta (guardar ACCOUNT\_ADMIN)
    - Staff de cuenta (guardar ACCOUNT\_STAFF)
- Leyenda: 
  - La persona recibirá un link para iniciar sesión o registrarse. Si ya tiene usuario en Eventia, se vinculará ese usuario existente a esta cuenta.

- Botón **Guardar**:

  **Endpoint**

**POST /cuenta\_usuarios/Invitar?idCuenta=2**\
Authorization: Bearer TOKEN

JSON

{

`  `"email": "martin@eventosfull.com",

`  `"rol\_codigo": "ACCOUNT\_STAFF"

}

Respuesta

{

`    `"ok": **true**,

`    `"url\_invitacion": "https://eventiaapp.vercel.app/login?invite=account&token=vZ86QKHf3CElKQ1AU8zmVq8FbpgmepO665KBViM3voaas8RVatrmOvjyEeP0CzrE",

`    `"email\_invitado": "martin@eventosfull.com",

`    `"rol\_codigo": "ACCOUNT\_STAFF"

}

Qué hace el front:

Después de invitar, mostrar modal de éxito:

**Invitación generada correctamente.\
Copiá este link y enviáselo a la persona invitada.**

Mostrar campo readonly:

https://eventiaapp.vercel.app/login?invite=account&token=ABC123TOKEN

Botón: **Copiar link**

Login con invitación

URL que recibe el usuario:

https://eventiaapp.vercel.app/login?invite=account&token=ABC123TOKEN

No se hace landing especial. Se usa la pantalla normal de login/registro.

Al cargar el login:

- El front detecta:
  - invite=account
  - token=ABC123TOKEN
  - Entonces llama:

    **GET /cuenta\_usuarios/ValidarInvitacion?token=ABC123TOKEN**

    (endpoint público)

Response válido:

{

`    `"valida": **true**,

`    `"mensaje": "Invitación válida.",

`    `"nombre\_cuenta": "Salon Eventos Full",

`    `"email\_invitado": "martin@eventosfull.com",

`    `"rol\_codigo": "ACCOUNT\_STAFF"

}

Qué muestra el login

Mostrar arriba del formulario:

**Te invitaron a sumarte a la cuenta Eventos Full.\
Ingresá con el email martin@eventosfull.com para aceptar la invitación.**

Campo email: martin@eventosfull.com

Si se puede dejarlo sólo lectura.

Si la invitación no es válida:

Ejemplo response:

{

`  `"valida": **false**,

`  `"mensaje": "La invitación está vencida.",

`  `"nombre\_cuenta": **null**,

`  `"email\_invitado": **null**,

`  `"rol\_codigo": **null**

}

Mostrar arriba del formulario:

**La invitación está vencida.\
Pedí una nueva invitación al administrador de la cuenta.**


**Usuario existente vs usuario nuevo**

Caso A: el usuario ya existe

Ejemplo:

martin@eventosfull.com ya tenía Eventia para uso personal

Flujo:

- Entra al link. 
- Login muestra email precargado. 
- Inicia sesión. 
- Front llama a **aceptar invitación**. 
- Backend lo vincula a la cuenta. 

No se crea otro usuario.

Caso B: el usuario no existe

Flujo:

- Entra al link. 
- Login muestra email precargado. 
- Usuario va a registrarse. 
- Registro usa ese mismo email. 
- Luego de registrarse/loguearse, front llama a **aceptar invitación**. 
- Backend lo vincula a la cuenta. 


Aceptar invitación

Este endpoint se llama después del login o registro.

**Endpoint**

**POST /cuenta\_usuarios/AceptarInvitacion**\
Authorization: Bearer TOKEN

JSON:

{

`  `"token": "vZ86QKHf3CElKQ1AU8zmVq8FbpgmepO665KBViM3voaas8RVatrmOvjyEeP0CzrE"

}

Respuesta

{

`    `"ok": **true**,

`    `"mensaje": "Invitación aceptada correctamente.",

`    `"id\_cuenta": 2,

`    `"nombre\_cuenta": "Salon Eventos Full",

`    `"rol\_codigo": "ACCOUNT\_STAFF"

}

Puede suceder que la persona intenta aceptar con otro usuario. El back devuelve:

{

`  `"message": "Esta invitación fue emitida para martin@aquamar.com. Iniciá sesión con ese email o pedí una nueva invitación."

}

Entonces se muestra ese mensaje.

Qué hace el front después que el usuario se logueó exitosamente y quedó vinculado a la cuenta

Redirigir a:

Cuenta → Dashboard (si el usuario tiene o está asociado a una sola cuenta)

o a:

Selector de espacios (si el usuario tiene varias cuentas)

**Selector de espacios**

Esto es clave para multi-cuenta.

Después del login, si el usuario tiene más de un espacio, mostrar un selector

Cómo sabe el front si tiene más de un espacio? Con el siguiente **endpoint**:

**GET /auth/me**\
Authorization: Bearer TOKEN

Respuesta:

{

`    `"usuario": {

`        `"id\_usuario": 23,

`        `"email": "martin@eventosfull.com",

`        `"nombre": "Martin",

`        `"apellido": "Santos"

`    `},

`    `"roles\_globales": [],

`    `"cuenta": {

`        `"estado\_ui": "CUENTA\_ACTIVA",

`        `"id\_cuenta": 5,

`        `"nombre\_cuenta": "Aquamar",

`        `"tipo": "EMPRESA",

`        `"estado": "A",

`        `"id\_plan": 5,

`        `"plan\_codigo": "B2B\_STARTER",

`        `"rol\_cuenta": "ACCOUNT\_STAFF",

`        `"vinculo\_activo": **true**

`    `},

`    `"espacios": [

`        `{

`            `"tipo": "PERSONAL",

`            `"id\_cuenta": **null**,

`            `"nombre": "Mi espacio personal",

`            `"nombre\_cuenta": **null**,

`            `"rol\_cuenta": **null**,

`            `"estado": **null**,

`            `"vinculo\_activo": **true**

`        `},

`        `{

`            `"tipo": "CUENTA",

`            `"id\_cuenta": 5,

`            `"nombre": "Aquamar",

`            `"nombre\_cuenta": "Aquamar",

`            `"rol\_cuenta": "ACCOUNT\_STAFF",

`            `"estado": "A",

`            `"vinculo\_activo": **true**

`        `},

`        `{

`            `"tipo": "CUENTA",

`            `"id\_cuenta": 2,

`            `"nombre": "Salon Eventos Full",

`            `"nombre\_cuenta": "Salon Eventos Full",

`            `"rol\_cuenta": "ACCOUNT\_STAFF",

`            `"estado": "A",

`            `"vinculo\_activo": **true**

`        `}

`    `],

`    `"eventos": {

`        `"cantidad\_propios": 0,

`        `"cantidad\_compartidos": 0

`    `},

`    `"ui": {

`        `"mostrar\_solicitar\_cuenta": **false**,

`        `"mostrar\_estado\_cuenta\_pendiente": **false**,

`        `"mostrar\_menu\_cuenta": **true**,

`        `"mostrar\_admin": **false**,

`        `"puede\_crear\_evento\_b2c": **true**

`    `}

}

Utilizar el bloque **espacios** para armar el selector, mostrando sólo los que tienen id\_cuenta distinto de null (no usar el bloque cuenta ya que quedó por compatibilidad).

Selector:

- ¿Con qué espacio querés trabajar?
  - Aquamar
  - Salón Faro Norte
  - Juan Eventos

Mi espacio personal se muestra siempre (el front trabaja sin idCuenta)

Si elige:

- Aquamar

El front guarda:

- contexto\_tipo = CUENTA
- id\_cuenta\_activa = 5
- nombre\_cuenta\_activa = Aquamar
- rol\_cuenta\_activa = ACCOUNT\_ADMIN

Y todos los endpoints B2B usan:

- idCuenta=5

Volviendo a la grilla de Invitar Usuarios:

|**Usuario**|**Email**|**Rol**|**Estado**|**Acciones**|
| :- | :- | :- | :- | :- |
|Laura Pérez|<laura@aquamar.com>|Administrador|Activo|Cambiar rol|
|Martín Gómez|<martin@aquamar.com>|Staff|Activo|Cambiar rol / Desactivar|
|Sofía Ruiz|<sofia@aquamar.com>|Staff|Inactivo|Activar|

Cambiar rol:

Abre un modal con los siguientes campos:

Cambiar rol de usuario:

- Usuario
  - Texto
  - Solo lectura
- Email
  - Texto
  - Solo lectura
- Rol
  - Combo

    |Texto visible|Valor|
    | :- | :- |
    |Administrador de cuenta|ACCOUNT\_ADMIN|
    |Staff de cuenta|ACCOUNT\_STAFF|

- Botón **Guardar:**

  **Endpoint**:

**PUT /cuenta\_usuarios/CambiarRol?idCuenta=5**\
Authorization: Bearer TOKEN

JSON

{

`  `"id\_cuenta\_usuario": 9,

`  `"rol\_codigo": "ACCOUNT\_ADMIN"

}

Respuesta:

{

`    `"ok": **true**,

`    `"mensaje": "Rol actualizado correctamente."

}

Validaciones importantes que hace el backend:

- Solo ACCOUNT\_ADMIN puede cambiar roles. 
- No se permite dejar la cuenta sin ningún ACCOUNT\_ADMIN. 
- No se permite que un admin se quite a sí mismo el rol admin. 


Activar / Desactivar usuario:

**Endpoint**

**PUT /cuenta\_usuarios/SetActivo?idCuenta=5&idCuentaUsuario=8&activo=false**\
Authorization: Bearer TOKEN

Pedir confirmación: 

Deseas desactivar a Martín Gomez de esta cuenta? No podrá operar en este espacio hasta que vuelva a activarse.

Respuesta

{

`    `"ok": **true**,

`    `"mensaje": "Usuario desactivado correctamente."

}


Validaciones que hace el backend:

- Solo ACCOUNT\_ADMIN puede activar/desactivar. 
- No se permite desactivarse a sí mismo. 
- No se permite dejar la cuenta sin ningún ACCOUNT\_ADMIN activo. 
#
#
**Endpoints finales para probar**

Listar usuarios

GET https://eventia-kg28.onrender.com/cuenta\_usuarios/MisUsuarios?idCuenta=5\
Authorization: Bearer TOKEN

Invitar usuario

POST https://eventia-kg28.onrender.com/cuenta\_usuarios/Invitar?idCuenta=5\
Authorization: Bearer TOKEN\
Content-Type: application/json

{\
`  `"email": "staff.prueba@eventia.com",\
`  `"rol\_codigo": "ACCOUNT\_STAFF"\
}

Validar invitación

GET https://eventia-kg28.onrender.com/cuenta\_usuarios/ValidarInvitacion?token=PEGAR\_TOKEN

Aceptar invitación

POST https://eventia-kg28.onrender.com/cuenta\_usuarios/AceptarInvitacion\
Authorization: Bearer TOKEN\_DEL\_USUARIO\_INVITADO\
Content-Type: application/json

{\
`  `"token": "PEGAR\_TOKEN"\
}

Cambiar rol

PUT https://eventia-kg28.onrender.com/cuenta\_usuarios/CambiarRol?idCuenta=5\
Authorization: Bearer TOKEN\
Content-Type: application/json

{\
`  `"id\_cuenta\_usuario": 8,\
`  `"rol\_codigo": "ACCOUNT\_ADMIN"\
}

Desactivar usuario

PUT https://eventia-kg28.onrender.com/cuenta\_usuarios/SetActivo?idCuenta=5&idCuentaUsuario=8&activo=false\
Authorization: Bearer TOKEN

Activar usuario

PUT https://eventia-kg28.onrender.com/cuenta\_usuarios/SetActivo?idCuenta=5&idCuentaUsuario=8&activo=true\
Authorization: Bearer TOKEN

Mensajes sugeridos para front

- Invitación creada
- Invitación generada correctamente. Copiá el link y envialo a la persona invitada.
- Invitación válida en login
- Te invitaron a sumarte a la cuenta Aquamar.\
  Ingresá con el email martin@aquamar.com para aceptar la invitación.
- Aceptación exitosa
- Ya formás parte de la cuenta Aquamar.
- Error email incorrecto
- Esta invitación fue emitida para martin@aquamar.com. Iniciá sesión con ese email o pedí una nueva invitación.
- El usuario ya pertenece a la cuenta.
- Último admin: La cuenta debe tener al menos un ACCOUNT\_ADMIN activo.



