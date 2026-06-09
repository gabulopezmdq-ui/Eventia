using System;

namespace API.DataSchema
{
    public class ef_evento_live_respuestas
    {
        public long id_respuesta { get; set; }
        public long id_dinamica { get; set; }
        public long? id_opcion { get; set; }
        public long id_evento { get; set; }
        public long? id_invitado { get; set; }
        public string? token_consulta { get; set; }
        public string? respuesta_texto { get; set; }
        public bool? es_correcta { get; set; }
        public int? orden_acierto { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_respuesta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}