using System;

namespace API.DataSchema
{
    public class ef_evento_historial
    {
        public long id_historial { get; set; }

        public long id_evento { get; set; }

        public string modulo { get; set; }
        public string accion { get; set; }

        public string? entidad { get; set; }
        public long? id_entidad { get; set; }

        public string descripcion { get; set; }

        public long? id_usuario { get; set; }
        public string? usuario_snapshot { get; set; }

        public DateTime fecha { get; set; }
    }
}