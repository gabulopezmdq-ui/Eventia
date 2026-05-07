# Eventia – Colonias Vacaciones / Casales / Eventos deportivos
# CIRCUITO Restricciones Alimentarias – Organización de la cocina

Cuenta prueba: AQUAMAR 

Unidades: MarCambrils / Quincho

**Programa → Gestión Inscripciones → Cocina**

No lo mezclamos con la configuración del programa. Tiene que ser una pantalla nueva dentro del programa (evento) y dentro de otro menú, al igual que los Pagos por ejemplo.

Programas (menú)

- Aquamar – Casal de verano (card?)
  - Configuración
    - Semanas
    - Servicios
    - Salud
    - Autorizaciones

- Gestión de inscripciones
  - Inscriptos
  - Pagos
  - Cocina
  - Transporte
  - Salud
  - Retiros

- Clínica de Tenis (card?)
  - ……..


Objetivo:

La pantalla debe responder:

- ¿Qué chicos comen cada día?
- ¿Qué menú/restricción tiene cada uno?
- ¿Qué alertas graves hay?
- ¿Cuántos menús especiales preparo?

Tablas que usa (a modo interno)

Para saber quién come ese día:

- ef\_programa\_inscripcion\_servicios
- ef\_programa\_inscripcion\_servicio\_dias
- ef\_rsvp\_grupo\_integrantes
- ef\_invitados
- ef\_programa\_inscripciones

Para restricciones:

- ef\_rsvp\_integrante\_restricciones
- ef\_param\_restricciones\_alimentarias
- ef\_param\_traducciones

Para salud extra:

- ef\_programa\_inscripcion\_salud\_fichas


**Pantalla Organización Comida –Restricciones Alimentarias**

Para el Header y Cards usar **Endpoint**:

**GET /programas/{idEvento}/cocina/dia?fecha=2026-06-24**

Ejemplo:

**GET /programas/34/cocina/dia?fecha=2026-06-24**

(se le podría agregar filtro por idioma, porque las alergias o restricciones son un tema sensible para verlo en catalán cuando la gente de cocina habla español: **programas/34/cocina/dia?fecha=2026-06-24&idIdioma=1**)

`	`Respuesta:	

{

`    `"idEvento": 34,

`    `"fecha": "2026-06-24",

`    `"servicioCodigo": "COMEDOR",

`    `"resumen": {

`        `"totalComedor": 14,

`        `"sinRestricciones": 1,

`        `"conRestricciones": 13,

`        `"alertasAltas": 11

`    `},

Header

Panel de Organización Comida Programa: Casal d’estiu Aquamar 2026 (campo “programa”)

Filtros:

- Fecha
  - Date picker

Acción: al cambiar la fecha (por ahora único filtro para no agregar complejidad), volver a llamar al endpoint.

Luego mostrar: Cards resumen

- Total (mostrar “totalComedor”)
- Sin Restricciones (mostrar “sinRestricciones”)
- Especiales (mostrar “conRestricciones”)
- Alertas (mostrar “alertasAltas”)

Sin Restricciones 1

Alertas 13

Con Restricciones 13

Total 14
![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.001.png)![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.002.png)![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.003.png)![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.004.png)


Podríamos colorear las cards

- Verde → Total y Sin restricciones 
- Amarillo → con restricciones 
- Rojo → con alertas


Luego chips (que no filtren, son solo para mostrar) Restricciones del día

Sale de la parte final del json:

"totalesPorRestriccion": [

`        `{

`            `"codigo": "ALERGIA\_HUEVO",

`            `"texto": "Alergia al huevo",

`            `"cantidad": 2,

`            `"alertaVisual": **true**

`        `},

`        `{

`            `"codigo": "ALERGIA\_MANIES",

`            `"texto": "Alergia al maní",

`            `"cantidad": 2,

`            `"alertaVisual": **true**

`        `},

`        `{

`            `"codigo": "GLUTEN\_CELIACO",

`            `"texto": "Celíaco / Sin gluten",

`            `"cantidad": 2,

`            `"alertaVisual": **true**

`        `},

`        `{

`            `"codigo": "ALERGIA\_COLORANTES",

`            `"texto": "Alergia a colorantes",

`            `"cantidad": 1,

`            `"alertaVisual": **true**

`        `},

`        `{

`            `"codigo": "ALERGIA\_FRUTOS\_SECOS",

`            `"texto": "Alergia a frutos secos",

`            `"cantidad": 1,

`            `"alertaVisual": **true**

`        `},

`        `{

`            `"codigo": "ALERGIA\_LECHE",

`            `"texto": "Alergia a la leche",

`            `"cantidad": 1,

`            `"alertaVisual": **true**

`        `},

Alergia al maní (2)

Celíaco / Sin Gluten (2)

Alergia al huevo (3)

![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.005.png)![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.006.png)![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.007.png)

Orden:

- Primero alertasVisual = true
- Luego por cantidad DESC 
- Luego alfabético 


Grilla principal:

|![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.008.png)|**Participante**|**Responsable**|**Teléfono**|**Restricciones**|**Observaciones**|**Ver Detalle**|
| :- | :- | :- | :- | :- | :- | :- |
|![ref1]|Iu Mas|Paula Mas|+34600567890|<p>Alergia a la leche</p><p>Alergia al huevo</p>|<p>Alergia a proteína de leche</p><p>Alergia al huevo. Revisar postres y rebozados</p>||
||||||<p>Mostrarlos como texto o chips… lo que sea mas fácil y quede mejor
</p><p>![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.010.png)</p>||
||||||||

Reglas visuales: sale del campo del json "nivelAlerta": "ALTA"

Columna ⚠

![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.011.png)![](Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.012.png)![ref1]ALTA\
`	`MEDIA\
NORMAL

{

`            `"idInvitado": 101,

`            `"idRsvpGrupoIntegrante": 61,

`            `"participante": "Iu Mas",

`            `"responsable": "Paula Mas",

`            `"telefonoResponsable": "+34600567890",

`            `"servicio": "Menjador",

`            `"restricciones": [

`                `{

`                    `"idRestriccionAlim": 10,

`                    `"codigo": "ALERGIA\_LECHE",

`                    `"texto": "Alergia a la leche",

`                    `"categoria": "ALERGIA",

`                    `"requiereAlertaVisual": **true**,

`                    `"requiereConfirmacionOrganizador": **true**,

`                    `"esAlergeno": **true**,

`                    `"observaciones": "Alergia a proteína de leche.",

`                    `"severidad": **null**

`                `},

`                `{

`                    `"idRestriccionAlim": 12,

`                    `"codigo": "ALERGIA\_HUEVO",

`                    `"texto": "Alergia al huevo",

`                    `"categoria": "ALERGIA",

`                    `"requiereAlertaVisual": **true**,

`                    `"requiereConfirmacionOrganizador": **true**,

`                    `"esAlergeno": **true**,

`                    `"observaciones": "Alergia al huevo. Revisar postres y rebozados.",

`                    `"severidad": **null**

`                `}

`            `],

`            `"alertaVisual": **true**,

`            `"nivelAlerta": "ALTA",

`            `"observacionesSalud": **null**

`        `},


**Botón Ver detalle (por registro)**

**Endpoint**

**GET /programas/{idEvento}/cocina/participantes/{idInvitado}/detalle**

Ejemplo:

**GET /programas/34/cocina/participantes/91/detalle?fecha=2026-06-24&idIdioma=1**

Mostrar ficha:

![ref1]\
**Nil Pons**\
Responsable: Mireia Pons\
Tel: +34600777111\
Email: mireia.pons@test.com\
\
Fecha: 24/06/2026\
Servicio: Menjador\
\
Alertas:\
`       `Nivel ALTA\
\
Restricciones alimentarias:\
\- Celíaco\
Severidad: ALTA\
Observaciones: Evitar contaminación cruzada\
\
Salud:\
\- Problema médico: Asma leve\
\- Necesidad especial: Llevar inhalador en mochila\
\- Observaciones familia: Avisar si se agita jugando

Esto lo devuelve el json… no sé si mezclarlo con las restricciones de cocina… capaz dejarlo porque capaz como problema de salud ponen si se brota porque comio algo que le daba alergia

**Export rápido para cocina**

Botón Descargar PDF Cocina

No lo tengo implementado, porque no sé si lo hace el front o el back.


Resumen circuito

1\. Cocina abre la pantalla\
2\. Selecciona fecha (ej: miércoles)\
3\. Ve resumen rápido\
4\. Mira chips de restricciones\
5\. Se enfoca en alertas rojas\
6\. Revisa observaciones\
7\. Cocina prepara menú

\
El front no debe calcular restricciones ni alertas. El backend devuelve todo resuelto.

[ref1]: Aspose.Words.493ac1bf-bfa3-4390-8bc8-3404743360fc.009.png
