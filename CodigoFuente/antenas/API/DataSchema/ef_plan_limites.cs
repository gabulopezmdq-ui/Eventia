using System;

namespace API.DataSchema
{
    public class ef_plan_limites
    {
        public long id_plan_limite { get; set; }
        public long id_plan { get; set; }

        public string codigo_limite { get; set; } = null!;
        public int? valor_int { get; set; }
        public decimal? valor_numeric { get; set; }
        public string? valor_json { get; set; } // jsonb

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}
