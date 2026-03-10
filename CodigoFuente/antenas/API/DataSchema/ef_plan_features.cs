using System;

namespace API.DataSchema
{
    public class ef_plan_features
    {
        public long id_plan_feature { get; set; }
        public long id_plan { get; set; }
        public long id_feature { get; set; }

        public bool activo { get; set; }
        public string? config_json_override { get; set; } // jsonb

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}