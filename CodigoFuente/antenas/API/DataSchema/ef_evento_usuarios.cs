using System;

namespace API.DataSchema
{
    public class ef_evento_usuarios 
    {
        public long id_evento_usuario { get; set; }

        public long id_evento { get; set; }
        
        public long? id_usuario { get; set; }

        public long? id_staff { get; set; }

        public short id_rol { get; set; }

        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }
        public bool activo { get; set; } = true;

        // Navegacion 
        public virtual ef_eventos? evento { get; set; }
        public virtual ef_usuarios? usuario { get; set; }
        public virtual ef_staff? staff { get; set; }
        public virtual ef_roles? rol { get; set; }
    }   
}
