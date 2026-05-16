# Eventia –Perfil de Cuenta (B2B)

Una vez que se hace la solicitud de cuenta, y se aprueba y demás, no estamos viendo los datos de la cuenta en ningún lado.

Necesitamos mostrar los datos de la cuenta. En el menú podríamos agregar la opción “Perfil de Cuenta”, debajo de Plan y Facturación:

![](Aspose.Words.aff15481-fc2d-47da-807b-1f928310652b.001.png)

La pantalla a mostrar es la misma que la que se usa cuando se hace la solicitud de cuenta, pero con unos cambios:

![](Aspose.Words.aff15481-fc2d-47da-807b-1f928310652b.002.png)

Cambios:

Título: datos de la cuenta

País:

- Ponerlo en la sección Datos de tu empresa, debajo de Teléfono y Ciudad 
- Debe ser obligatorio

Resto de los campos se pueden modificar, excepto Nombre de la Empresa y País.

**Endpoint** para guardar modificaciones:

**PUT  /cuentas/UpdateMiCuenta**

Authorization: Bearer TU\_TOKEN

JSON:

{

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

`    `"fecha\_modif": "2026-04-08T12:05:09.017788+00:00"

}

