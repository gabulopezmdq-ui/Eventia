# Eventia -- Programas / Eventos: Crear STAFF

[Qué tipos de personas existen ahora]{.underline}

-   [Usuario real del sistema]{.underline}

Es alguien que tiene usuario en Eventia.

Ejemplos:

-   superadmin

-   Amaia

-   coordinador

-   profesor

-   salud

-   coorganizador

```{=html}
<!-- -->
```
-   Dónde vive

    -   ef_usuarios

    -   si pertenece a una cuenta: ef_cuenta_usuarios

    -   si participa en un programa/evento: ef_evento_usuarios

-   Cómo entra

    -   login normal

## 

-   [Staff operativo reusable]{.underline}

Es una persona operativa que no necesita usuario real.

> Ejemplos:

-   puerta

-   barra

-   DJ

-   cocina

-   seguridad

-   personal del salón

```{=html}
<!-- -->
```
-   dónde vive

    -   ef_staff

-   cómo entra

    -   por código

-   qué representa

    -   La persona base reusable.

    -   No representa todavía "qué hace en cada evento".

```{=html}
<!-- -->
```
-   [Staff asignado a un evento/programa]{.underline}

Es la relación entre una persona reusable y un evento puntual.

> Ejemplo:

-   Juan está en ef_staff

-   en evento 27 lo asignás como STAFF_RECEPTOR

-   en evento 27 también puede estar como STAFF_BARTENDER

-   en programa 34 puede estar como STAFF_COCINA

```{=html}
<!-- -->
```
-   dónde vive

    -   ef_evento_staff

```{=html}
<!-- -->
```
-   qué representa

    -   La función operativa de esa persona dentro de ese
        evento/programa.

[Qué hace cada tabla]{.underline}

## ef_evento_usuarios

Solo usuarios reales del sistema.

Sirve para:

-   equipo interno

-   coordinadores

-   monitores

-   salud

-   coorganizadores

Puede tener varios roles por usuario en el mismo evento.

## ef_staff

Persona reusable de cuenta.

Sirve para:

-   no volver a cargar siempre a la misma gente

-   tener código único

-   controlar vigencia

-   controlar activo/inactivo

-   ver usos

## ef_evento_staff

Asignación de una persona reusable a un evento/programa.

Sirve para:

-   decir qué rol tiene esa persona en ese evento

-   permitir multirol

-   no duplicar personas

-   reutilizar staff ya existente

**Menú Cuenta Staff y Accesos**

[Objetivo]{.underline}

-   Administrar **staff operativo reusable de la cuenta**.

Ejemplo:

-   el salón tiene siempre su recepción

-   el quincho tiene su barra habitual

-   el club tiene cocina frecuente

-   una planner tiene DJ y personal operativo recurrente

Qué NO es:

-   No es equipo interno.

-   No es usuario real.

-   No es staff ya asignado a un programa puntual.

Botón superior "**Nuevo Staff**"

[Grilla]{.underline}

**Endpoint**

**GET /cuenta/{id_cuenta}/staff**

Logueado con algún account admin de la cuenta

Ejemplo:

GET /cuenta/2/staff

El back devuelve una lista de staff reusable de la cuenta

-   nombre

-   apellido

-   email

-   teléfono

-   rol base

-   código de acceso

-   activo

-   fecha expiración

-   fecha primer uso

-   cantidad usos

-   acciones:

    -   editar

    -   renovar vigencia

    -   activar/inactivar

    -   copiar código

[Nuevo Staff]{.underline}:

Objetivo: Dar de alta una persona reusable de la cuenta

Campos:

-   Nombre

    -   tipo: texto

    -   obligatorio visualmente

-   Apellido

    -   tipo: texto\
        obligatorio visualmente

-   Email

    -   tipo: texto

    -   opcional

-   Teléfono

    -   tipo: texto

    -   opcional

-   Rol base

    -   tipo: combo

    -   obligatorio

    -   **Endpoint**:

**GET /roles/combo-staff?idIdioma=1&tipoOperacion=EVENTO**

> qué debería mostrar el combo
>
> Ejemplos:

-   Puerta / Check-in

-   Barra / Beneficios

-   DJ

-   Cocina

-   Seguridad

> No debe mostrar:

-   SUPERADMIN

-   ACCOUNT_ADMIN

-   ACCOUNT_STAFF

-   EVENT_OWNER

-   EVENT_CLIENT_ADMIN

-   INVITADO

```{=html}
<!-- -->
```
-   Expira el

    -   tipo: fecha

    -   opcional

-   Unidades asignadas

    -   tipo: multiselección

    -   opcional

    -   solo si la cuenta trabaja con unidades

```{=html}
<!-- -->
```
-   botón **Guardar**

    -   **Endpoint**

> **POST /cuenta/{id_cuenta}/staff**

Ejemplo:

POST /cuenta/2/staff

JSON:

> {
>
>   \"id_rol\": 9,
>
>   \"nombre\": \"Andres\",
>
>   \"apellido\": \"Pérez\",
>
>   \"email\": \"andres.staff@example.com\",
>
>   \"telefono\": \"+541122334455\",
>
>   \"fecha_expiracion\": \"2027-06-23T00:00:00Z\",
>
>   \"id_unidades\": \[1\]
>
> }
>
> Respuesta
>
> {
>
>     \"id_staff\": 5,
>
>     \"codigo\": \"SARE5182\",
>
>     \"nombre\": \"Andres\",
>
>     \"apellido\": \"Pérez\",
>
>     \"fecha_expiracion\": \"2027-06-23T00:00:00+00:00\"
>
> }

Acciones de la grilla:

[Editar]{.underline}

Sirve para modificar datos de la persona reusable sin recrearla.

Ejemplos:

-   corregir email

-   corregir teléfono

-   cambiar nombre/apellido

-   activar/desactivar

-   ajustar fecha de expiración

-   cambiar rol base

Abre un modal con los siguientes campos:

**Endpoint** para cargar el modal:

**GET /cuenta/{id_cuenta}/staff/{id_staff}**

-   nombre

-   apellido

-   email

-   teléfono

-   rol

-   fecha expiración

-   activo

-   Botón **Guardar**:

> **Endpoint**
>
> **PUT /cuenta/{id_cuenta}/staff/{id_staff}**

Ejemplo

PUT / cuenta/2/staff/5

> {
>
>   \"nombre\": \"Andres Ariel\",
>
>   \"apellido\": \"Pérez\",
>
>   \"email\": \"andres.staff@example.com\",
>
>   \"telefono\": \"+541122334455\",
>
>   \"id_rol\": 9,
>
>   \"fecha_expiracion\": \"2027-12-31T23:59:59Z\",
>
>   \"activo\": **true**
>
> }

Respuesta

> {
>
>     \"id_staff\": 5,
>
>     \"nombre\": \"Andres Ariel\",
>
>     \"apellido\": \"Pérez\",
>
>     \"email\": \"andres.staff@example.com\",
>
>     \"telefono\": \"+541122334455\",
>
>     \"rol_codigo\": \"STAFF_RECEPTOR\",
>
>     \"rol_descripcion\": \"Recepción - Acceso a scanner de ingreso\",
>
>     \"codigo\": \"SARE5182\",
>
>     \"activo\": **true**,
>
>     \"fecha_expiracion\": \"2027-12-31T23:59:59+00:00\",
>
>     \"usos\": 0,
>
>     \"fecha_uso\": **null**
>
> }

[Renovar vigencia]{.underline}

Objetivo: Extender la vigencia del código sin crear otra persona.

Abre un modal chico:

Campos

-   Nueva fecha de expiración

    -   tipo: fecha

    -   obligatorio

> **Endpoint**
>
> **PUT /cuenta/{id_cuenta}/staff/{id_staff}/renovar**

Ejemplo

PUT / cuenta/2/staff/5/renovar

> JSON
>
> {
>
>   \"fecha_expiracion\": \"2027-12-31T23:59:59Z\"
>
> }
>
> Respuesta
>
> {
>
>     \"id_staff\": 5,
>
>     \"codigo\": \"SARE5182\",
>
>     \"nombre\": \"Andres\",
>
>     \"apellido\": \"Pérez\",
>
>     \"fecha_expiracion\": \"2027-12-31T23:59:59+00:00\"
>
> }

[Activar / Inactivar]{.underline}

**Endpoint**

**PUT /cuenta/{id_cuenta}/staff/{id_staff}**

Ejemplo

PUT /cuenta/2/staff/5

JSON

{

  \"activo\": **true**

}

[Copiar código]{.underline}

No necesita endpoint, porque el código ya viene en:

-   GET /cuenta/{id_cuenta}/staff

-   en el campo: codigo

Front: Solo copia al portapapeles.
