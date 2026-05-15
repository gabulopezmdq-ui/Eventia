# Eventia – Mi perfil de usuario B2C

1\. Pantalla Mi Perfil

![](Aspose.Words.8619b919-f42e-4c41-87aa-f5a7c8d7ac96.001.png)

![](Aspose.Words.8619b919-f42e-4c41-87aa-f5a7c8d7ac96.002.png)

**Endpoint**

**GET /usuarios/mi-perfil**\
Authorization: Bearer TOKEN

Orden recomendado de campos en “Información personal”:

1. Nombre (obligatorio)
1. Apellido (obligatorio)
1. Teléfono móvil 
1. Idioma preferido 
- Combo
- **Tomar el idioma preferido del perfil**
- **Si no tiene guardado ningún idioma preferido, y vienen null:**

  **Endpoint**

  **GET /idiomas/GetAll?idIdioma=1**

- Muestra campo “texto”
1. País de residencia
- Combo
- Toma el país de residencia del perfil
- Si no tiene guardado ningún país de residencia:
  - Para completar este campo sí o sí tiene que haber seleccionado un idioma preferido, para saber en qué idioma mostrar los países

    **Endpoint**

    **GET /paises/GetAll?idIdioma=1 (es el id\_idioma\_preferido)**

1. Idioma default para eventos:
- Ídem idioma preferido
1. Recibir novedades / comunicaciones :
- Toggle o checkbox

**Endpoint**

**PUT /usuarios/mi-perfil\
Authorization: Bearer TOKEN**

JSON

{

`  `"nombre": "Amaia",

`  `"apellido": "Castel",

`  `"telefono": "+54 9 11 1234-5678",

`  `"id\_idioma\_preferido": 1,

`  `"id\_pais": 5,

`  `"id\_idioma\_default\_evento": 1,

`  `"recibir\_novedades": **true**

}

Respuesta

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

`    `"ultimo\_acceso": "2026-05-15T11:07:25.53875+00:00",

`    `"cantidad\_eventos\_propios": 3,

`    `"cantidad\_eventos\_compartidos": 0,

`    `"cantidad\_eventos\_cuenta": 12,

`    `"ultimo\_evento\_creado": "Juan y Juana"

}


2\. Card Resumen de actividad

![](Aspose.Words.8619b919-f42e-4c41-87aa-f5a7c8d7ac96.003.png)

Ya se puede actualizar con lo que devuelve el endpoint (arriba marcado en amarillo)

