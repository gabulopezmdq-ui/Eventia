using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_estados_hist 
    {
        public long id_evento_estado_hist { get; set; }
        public long id_evento { get; set; }
        public long id_usuario { get; set; }
        public DateTimeOffset fecha { get; set; }
        public string estado { get; set; } = null!; // char(1): B/A/C
        public string? observaciones { get; set; }

        // Navegaciones 
        public ef_eventos? evento { get; set; }
        public ef_usuarios? usuario { get; set; }
    }
}
