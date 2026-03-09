using System;

namespace API.DataSchema
{
    public class ef_scope_addons
    {
        public long id_scope_addon { get; set; }

        public string scope { get; set; } = null!; // EVENTO / CUENTA
        public long? id_evento { get; set; }
        public long? id_cuenta { get; set; }

        public long id_addon { get; set; }

        public string estado { get; set; } = null!; // ACTIVO/SUSPENDIDO/EXPIRADO
        public DateTimeOffset fecha_desde { get; set; }
        public DateTimeOffset? fecha_hasta { get; set; }

        public bool activo { get; set; }
        public string? config_json_override { get; set; } // jsonb

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}

