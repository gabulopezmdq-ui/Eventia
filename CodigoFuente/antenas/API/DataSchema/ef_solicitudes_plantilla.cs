using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_solicitudes_plantilla
    {
        public long id_solicitud { get; set; }

        public long id_evento { get; set; }
        public int id_tipo_evento { get; set; }

        public short? id_plantilla_referida { get; set; }

        public string? motivo { get; set; }
        public string? detalle { get; set; }

        // jsonb en Postgres; en C# lo manejamos como string (JSON crudo)
        public string payload { get; set; } = null!;

        public string estado { get; set; } = "P"; // P pendiente, A aprobada, R rechazada

        public long? id_usuario_solicita { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_revision { get; set; }
        public long? id_usuario_revisa { get; set; }
        public string? observaciones_admin { get; set; }

        // navegación 
        public ef_eventos? evento { get; set; }
    }
}
