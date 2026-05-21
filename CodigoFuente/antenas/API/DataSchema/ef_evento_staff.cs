using System;

namespace API.DataSchema
{
    public class ef_evento_staff
    {
        public long id_evento_staff { get; set; }
        public long id_evento { get; set; }
        public long id_staff { get; set; }
        public short id_rol { get; set; }

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_staff? staff { get; set; }
        public virtual ef_roles? rol { get; set; }
    }
}