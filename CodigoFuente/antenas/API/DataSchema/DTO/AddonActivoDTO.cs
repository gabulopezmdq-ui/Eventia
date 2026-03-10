using System;

namespace API.DataSchema.DTO
{
    public class AddonActivoDTO
    {
        public long id_scope_addon { get; set; }
        public long id_addon { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string estado { get; set; } = null!;

        public bool activo { get; set; }
        public DateTimeOffset fecha_desde { get; set; }
        public DateTimeOffset? fecha_hasta { get; set; }

        public string? config_override { get; set; }
    }
}

