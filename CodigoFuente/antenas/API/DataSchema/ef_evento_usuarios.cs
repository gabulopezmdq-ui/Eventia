using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_evento_usuarios 
    {
        public long id_evento_usuario { get; set; }

        public long id_evento { get; set; }
        public long id_usuario { get; set; }
        public short id_rol { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public bool activo { get; set; }

        // Navegación 
        public ef_eventos? evento { get; set; }
        public ef_usuarios? usuario { get; set; }
        public ef_roles? rol { get; set; }
    }   
}
