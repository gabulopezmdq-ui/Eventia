using System;

namespace API.DataSchema
{
    public class ef_evento_portal_config
    {
        public long id_evento_portal_config { get; set; }
        public long id_evento { get; set; }
        public short id_portal_seccion { get; set; }
        public bool visible { get; set; } = true;
        public short orden { get; set; } = 1;
        public string? titulo_override { get; set; }
        public string? config_json { get; set; }
        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_param_portal_secciones? portal_seccion { get; set; }
    }
}
