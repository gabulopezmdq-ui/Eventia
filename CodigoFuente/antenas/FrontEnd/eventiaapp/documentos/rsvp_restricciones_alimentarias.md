# Integración de Restricciones Alimentarias en RSVP

Este documento detalla cómo el equipo de Frontend debe implementar el flujo de carga y envío de **Restricciones Alimentarias** (Dietary Restrictions) durante el proceso de confirmación de asistencia (RSVP) de los invitados.

## Flujo Lógico

La arquitectura establece que las restricciones alimentarias **no se definen al generar la invitación**, sino única y exclusivamente **cuando el invitado ingresa a confirmar su asistencia (RSVP)**.

Para ello, el frontend debe seguir dos pasos:

### 1. Obtener el Catálogo de Restricciones
Antes o durante la carga del formulario de RSVP, se debe consultar el catálogo paramétrico de restricciones para el evento. Esto permite renderizar dinámicamente las opciones (ej: Celíaco, Vegano, etc.) en el idioma configurado para ese evento.

**Endpoint:**
`GET /parametrica/RestriccionesAlimentarias?idEvento={idEvento}`

**Comportamiento esperado:**
El endpoint devolverá una lista de objetos (con un `id` y su descripción). El Frontend debe usar esto para dibujar checkboxes, tags o selectores en la ficha de cada persona (tanto del titular como de los acompañantes).

---

### 2. Enviar las Restricciones en la Confirmación (RSVP)
Una vez que el usuario completó sus datos de asistencia, el formulario final se envía al backend. Las restricciones de cada integrante se envían anidadas dentro de sus respectivos objetos.

**Endpoint:**
`POST /invitacion/{token}/confirmar`
*(Nota: El `{token}` corresponde al identificador único de la invitación del grupo).*

**Estructura del Payload (JSON):**

El backend soporta un objeto principal que incluye el mensaje general del grupo y un array `personas` con los integrantes. Para el manejo de alimentación, cada persona acepta:
1. `alimentacionDetalle`: Texto libre para alergias o aclaraciones no contempladas en las paramétricas.
2. `idsRestricciones` **O** `restricciones`: Se proveen dos formatos para enviar las restricciones seleccionadas.

#### Ejemplo de Payload

```json
{
  "mensajeGrupo": "¡Muchas gracias por la invitación, ahí estaremos!",
  "personas": [
    {
      "idInvitado": 1045,            // ID del invitado (si existía previamente). Si es un acompañante nuevo, omitir o enviar null/0.
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",   // Obligatorio para el titular
      "celular": "1122334455",       // Obligatorio para el titular
      "edad": 35,
      "rolEvento": "A",              // "A" (Adulto) o "N" (Niño). Obligatorio si asiste=true
      "asiste": true,                // true si confirma asistencia, false si rechaza
      "mensaje": "Feliz de acompañarlos",
      
      // ==========================================
      // SECCIÓN ALIMENTACIÓN
      // ==========================================
      
      // 1. Texto libre (Opcional)
      "alimentacionDetalle": "Alergia severa al maní", 
      
      // 2. FORMA SIMPLE: Solo el array de IDs
      // (Usa esta opción si el frontend no pide observaciones por cada checkbox marcado)
      "idsRestricciones": [1, 4], 
      
      // 2. FORMA DETALLADA: Array de objetos
      // (Úsalo solo si la UI permite escribir una aclaración extra al lado de cada restricción)
      /* 
      "restricciones": [
        {
          "idRestriccion": 1,
          "observaciones": "Grado severo, no puede haber contaminación cruzada."
        },
        {
          "idRestriccion": 4,
          "observaciones": null
        }
      ]
      */
    }
  ]
}
```

### Reglas de Negocio a tener en cuenta por Frontend

1. **Campos obligatorios del titular:** El titular de la invitación (quien ingresa con el token) está obligado a completar su `email` y `celular`. Si el backend no los recibe, rechazará la petición.
2. **Rol de Evento:** Cualquier persona que tenga `"asiste": true` debe tener explícitamente enviado su `rolEvento` (`"A"` o `"N"`).
3. **Manejo de Acompañantes Nuevos:** Si en el formulario se agrega un nuevo acompañante (no venía en la carga inicial), simplemente no se envía su `idInvitado` (o se envía null). El backend intentará buscarlo en la base de datos (por su email o por nombre y apellido en el grupo) para no duplicarlo; de lo contrario, lo creará desde cero y le asociará las restricciones que se envíen.
4. **Sobrescritura de datos:** Al confirmar, el backend borrará las restricciones que esa persona pudiera tener registradas previamente y grabará exactamente las que se manden en el payload de esta confirmación (comportamiento de reemplazo total). Si un invitado entra a modificar su RSVP, el frontend debe enviar **todas** sus selecciones actuales.
