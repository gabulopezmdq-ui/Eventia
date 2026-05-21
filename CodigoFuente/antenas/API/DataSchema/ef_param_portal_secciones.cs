using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_param_portal_secciones
    {
        public short id_portal_seccion { get; set; }
        public string codigo { get; set; } = null!;
        public string? descripcion { get; set; }
        public bool aplica_evento { get; set; } = true;
        public bool aplica_programa { get; set; } = true;
        public string? requiere_feature_codigo { get; set; }
        public short orden_default { get; set; } = 1;
        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public virtual ICollection<ef_evento_portal_config> evento_portal_configs { get; set; } = new List<ef_evento_portal_config>();
    }
}
