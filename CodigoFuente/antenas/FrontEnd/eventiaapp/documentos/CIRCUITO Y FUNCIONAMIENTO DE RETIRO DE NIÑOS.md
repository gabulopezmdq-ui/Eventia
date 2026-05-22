**CIRCUITO Y FUNCIONAMIENTO DE RETIRO DE NIÑOS (CHECK-OUT)**

Este documento detalla el funcionamiento del módulo de **Retiro de Niños** en la plataforma Eventia. Abarca desde la lógica de negocio y el flujo de usuario en el frontend hasta las especificaciones técnicas del backend, base de datos y endpoints involucrados.

-----
**Objetivo del Módulo**

El objetivo principal de este módulo es garantizar la seguridad física de los menores asistentes al evento, validando mediante códigos QR quién está autorizado a retirarlos, controlando duplicidades y registrando un historial auditable de las salidas diarias.

-----
**1. Conceptos Claves y Reglas de Negocio**

El sistema gestiona la entrega de los menores basándose en las siguientes entidades:

**1.1 Participantes (Niños — Rol N)**

Son los menores inscriptos en el programa. Cada uno tiene asignado un código QR único (qr\_token) generado al confirmar su inscripción.

**1.2 Responsables (Padres/Tutores — Rol R)**

Adultos a cargo del grupo familiar. También disponen de un código QR propio que representa a todo el grupo familiar.

**1.3 Autorizados de Retiro (ef\_autorizaciones tipo R)**

Personas explícitamente autorizadas por los responsables para retirar a un niño.

Cada autorización contiene:

- Token QR único (qr\_token) 
- Nombre completo 
- Teléfono celular 
- Parentesco / relación 
- Estado activo/inactivo 

**1.4 Operador (Staff / Portero)**

Usuario interno de la plataforma que utiliza el panel de retiros desde tablet o smartphone para escanear y validar las salidas.

-----
**2. Reglas Críticas de Negocio**

**2.1 Doble Tipo de Lectura QR**

El operador puede escanear:

**QR de Responsable (R)**

Lista automáticamente todos los niños asociados al grupo familiar.

**QR de Autorizado específico**

Permite retirar únicamente los niños asignados a esa autorización.

-----
**2.2 Validación de Identidad**

El backend exige que el nombre del retirador físico coincida exactamente (case-insensitive) con alguno de los autorizados activos registrados para el menor.

-----
**2.3 Control de Retiros Duplicados**

Un niño no puede ser retirado dos veces el mismo día.

Si ya fue retirado:

- El sistema deshabilita su selección 
- La UI muestra: 
  - “Ya retirado” 
  - Hora exacta del retiro previo 
-----
**2.4 Trazabilidad Completa**

**Escaneos QR**

Todo escaneo exitoso o fallido se registra en:

ef\_qr\_scans

**Retiros Confirmados**

Todo retiro exitoso queda guardado de forma inmutable en:

ef\_retiros

-----
**3. Ciclo de Vida y Creación de Autorizaciones**

Las autorizaciones de tipo "R" pueden crearse desde dos canales principales.

-----
**3.1 Canal del Responsable Familiar (RSVP Personal)**

Flujo de autoservicio para padres o tutores.

**Paso 1 — Acceso**

El responsable accede mediante su:

rsvp\_token

enviado por Eventia luego de la inscripción.

-----
**Paso 2 — Formulario de Autorizados**

El responsable puede agregar personas autorizadas indicando:

- Nombre completo 
- Celular 
- Relación / parentesco 
-----
**Paso 3 — Guardado Backend (CreateFromPersonalLinkAsync)**

El frontend realiza:

POST /autorizacion/p/{rsvpToken}/autorizaciones

El backend:

- Verifica que el usuario sea titular del grupo 
- Verifica rol R (Responsable) 
- Busca todos los niños del grupo familiar 
- Normaliza el celular a formato E.164 
- Genera autorizaciones automáticamente 
-----
**Multi-guardado Automático**

Al autorizar una persona:

- El sistema crea una autorización para cada niño del grupo familiar 
- Todos comparten: 
  - mismo autorizado 
  - mismo teléfono 
  - mismo vínculo 

Cada autorización se guarda con:

activo = true\
tipo = "R"\
fecha\_alta = UTC\
qr\_token generado automáticamente

-----
**3.2 Canal del Operador / Coordinador (Backoffice)**

Flujo administrativo interno.

-----
**Paso 1 — Acceso**

El operador accede desde:

- Gestión de Inscripciones 
- Detalle de Inscripto 
- Panel de Autorizaciones 
-----
**Paso 2 — Alta Manual**

Selecciona un participante específico y agrega:

- Nombre autorizado 
- Teléfono 
- Relación 
- Observaciones 
-----
**Paso 3 — Guardado Backend (CreateAsync)**

El panel realiza:

POST /autorizacion

El backend:

- Verifica que el participante exista 
- Verifica pertenencia al evento 
- Inserta una autorización individual 
-----
**3.3 Modificación y Baja**

**Modificación**

PUT /autorizacion/{idAutorizacion}

Permite actualizar:

- nombre 
- teléfono 
- relación 
- observaciones 
-----
**Baja Lógica / Desactivación**

DELETE /autorizacion/{idAutorizacion}

El sistema:

- NO elimina físicamente el registro 
- Establece: 
  - activo = false 
  - fecha\_baja = UTC 

Esto invalida inmediatamente el QR.

-----
**4. Flujo Operativo de Retiro**

**Paso 1 — Llegada del Adulto**

El adulto presenta:

- QR de Responsable\
  o 
- QR de Autorizado 
-----
**Paso 2 — Escaneo o Ingreso Manual**

El operador:

- escanea mediante cámara\
  o 
- escribe manualmente el token 
-----
**Paso 3 — Validación Backend**

Se realiza:

POST /programas/retiros/validar-qr

El backend valida:

- existencia del token 
- estado activo 
- autorizaciones vigentes 
- niños asociados 
-----
**Paso 4 — Resultado Visual**

La UI muestra:

- Nombre autorizado 
- Relación familiar 
- Teléfono 
- Niños habilitados 
-----
**Paso 5 — Control de Retiros Previos**

Si un niño ya salió:

- aparece bloqueado 
- muestra badge: 
  - “Ya retirado HH:mm” 
-----
**Paso 6 — Selección de Menores**

El operador selecciona:

- uno 
- varios 
- o todos los niños 

que efectivamente abandonan el predio.

-----
**Paso 7 — Observaciones**

Opcionalmente puede registrar:

- puerta utilizada 
- incidentes 
- aclaraciones 
- observaciones operativas 
-----
**Paso 8 — Confirmación de Retiro**

Se ejecuta:

POST /programas/retiros/registrar

-----
**Paso 9 — Registro Histórico**

El sistema guarda:

- fecha/hora UTC 
- operador 
- retirador 
- método validación 
- observaciones 
-----
**Paso 10 — Actualización en Tiempo Real**

Se actualizan automáticamente:

- métricas del día 
- grilla operativa 
- cantidad restante en predio 
-----
**5. Arquitectura Técnica de Base de Datos**

-----
**5.1 Tabla ef\_autorizaciones**

Define personas autorizadas a retirar menores.

Campos principales:

|**Campo**|**Descripción**|
| :-: | :-: |
|id\_autorizacion|PK|
|id\_evento|Evento asociado|
|id\_invitado\_objetivo|Niño autorizado|
|tipo|R retiro|
|qr\_token|Token QR|
|nombre\_autorizado|Nombre completo|
|telefono\_autorizado|Teléfono|
|relacion|Parentesco|
|activo|Estado|
|fecha\_alta|Alta|
|fecha\_baja|Baja lógica|

-----
**5.2 Tabla ef\_retiros**

Historial definitivo de egresos.

|**Campo**|**Descripción**|
| :-: | :-: |
|id\_retiro|PK|
|id\_evento|Evento|
|id\_invitado\_nino|Niño retirado|
|id\_autorizacion|Autorización utilizada|
|nombre\_retirador|Persona física|
|celular\_retirador|Teléfono|
|metodo\_validacion|A/M/O|
|observaciones|Texto libre|
|fecha\_retiro|Timestamp UTC|
|id\_usuario\_operador|Staff responsable|

-----
**5.3 Tabla ef\_qr\_scans**

Auditoría de escaneos.

|**Campo**|**Descripción**|
| :-: | :-: |
|id\_qr\_scan|PK|
|qr\_token|Token leído|
|resultado|Resultado validación|
|mensaje|Detalle|
|fecha\_scan|Fecha scan|
|id\_usuario\_operador|Operador|

-----
**6. Referencia API**

-----
**6.1 Validar Código QR**

**Endpoint**

POST /programas/retiros/validar-qr

-----
**Request**

{\
`  `"qrToken": "f9d17bdd65c4df5ef48e78fd7291cadafba7f5669a49fffcf6a0f64208a8fbcb",\
`  `"fechaOperativa": "2026-06-24"\
}

-----
**Response Exitosa**

{\
`  `"valido": true,\
`  `"mensaje": "QR válido.",\
`  `"idEvento": 34,\
`  `"nombreAutorizado": "Carla Domenech",\
`  `"telefonoAutorizado": "+34600999111",\
`  `"relacion": "Madre",\
`  `"participantesAutorizados": [\
`    `{\
`      `"idInvitado": 116,\
`      `"idAutorizacion": 7,\
`      `"nombreCompleto": "Bruno Domenech",\
`      `"yaRetiradoHoy": false,\
`      `"fechaRetiro": null\
`    `}\
`  `]\
}

-----
**6.2 Registrar Retiro**

**Endpoint**

POST /programas/retiros/registrar

-----
**Request**

{\
`  `"qrToken": "f9d17bdd65c4df5ef48e78fd7291cadafba7f5669a49fffcf6a0f64208a8fbcb",\
`  `"fechaOperativa": "2026-06-24",\
`  `"idsInvitadosNinos": [116],\
`  `"observaciones": "Retirado en puerta principal."\
}

-----
**Response Exitosa**

{\
`  `"ok": true,\
`  `"mensaje": "Retiro registrado correctamente.",\
`  `"retiros": [\
`    `{\
`      `"idRetiro": 89,\
`      `"idInvitado": 116,\
`      `"participante": "Bruno Domenech",\
`      `"nombreRetirador": "Carla Domenech",\
`      `"fechaRetiro": "2026-06-24T18:42:01Z"\
`    `}\
`  `]\
}

-----
**6.3 Obtener Historial Diario**

**Endpoint**

GET /programas/{idEvento}/retiros/dia?fecha=YYYY-MM-DD

-----
**Response**

{\
`  `"idEvento": 34,\
`  `"fecha": "2026-06-24",\
`  `"totalRetiros": 2,\
`  `"items": [\
`    `{\
`      `"participante": "Sofia Domenech",\
`      `"nombreRetirador": "Carla Domenech",\
`      `"fechaRetiro": "2026-06-24T15:30:00Z"\
`    `}\
`  `]\
}

-----
**7. Métodos de Validación**

|**Código**|**Descripción**|
| :-: | :-: |
|A|QR Autorizado|
|M|Manual|
|O|Otro|

-----
**8. Arquitectura Frontend**

-----
**Modelos y Tipos**

features/programas/types.ts

-----
**Servicios**

features/programas/programas.service.ts

-----
**Proxies Next.js**

**Historial Diario**

GET /api/programas/[idEvento]/retiros/dia/route.ts

**Validación QR**

POST /api/programas/[idEvento]/retiros/validar-qr/route.ts

**Registro Retiro**

POST /api/programas/[idEvento]/retiros/registrar/route.ts

-----
**9. Componentes Frontend**

-----
**Dashboard Principal**

dashboard/events/[id]/inscripciones/retiros/page.tsx

Responsabilidades:

- lector QR 
- filtros fecha 
- métricas 
- grilla operativa 
-----
**ValidarQRPanel**

Administra:

- cámara 
- lectura QR 
- ingreso manual 
-----
**RegistrarRetiroDrawer**

Panel lateral dinámico que:

- muestra autorizados 
- permite seleccionar niños 
- registra observaciones 
-----
**RetirosSummaryCard**

Muestra:

- cantidad retirados 
- cantidad presentes 
- métricas operativas 
-----
**RetirosGrid**

Renderiza:

- historial del día 
- hora 
- retirador 
- método validación 
- observaciones 
-----
**10. Seguridad y Auditoría**

El módulo fue diseñado bajo principios de:

- mínima fricción operativa 
- máxima trazabilidad 
- prevención de errores humanos 
- control de duplicidades 
- validación explícita de identidad 
-----
**11. Beneficios Operativos**

**Seguridad Física**

Evita retiros no autorizados.

-----
**Velocidad Operativa**

Permite egresos rápidos mediante QR.

-----
**Auditoría Completa**

Todo movimiento queda registrado.

-----
**Escalabilidad**

Funciona tanto para:

- colonias 
- casales 
- clubes 
- campus deportivos 
- actividades extracurriculares 
- eventos infantiles masivos 
-----
**12. Estado General del Módulo**

El módulo de retiros queda alineado con la arquitectura general de Eventia:

- Programas 
- Portal Familiar 
- Salud 
- Pagos 
- Inscripciones 
- Operación diaria 
- Staff móvil 

Consolidándose como una capa operativa crítica dentro del ecosistema de gestión integral de programas y eventos.

