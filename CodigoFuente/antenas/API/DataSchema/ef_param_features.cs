using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_param_features : IRegistroUnico
    {
        public long id_feature { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }

        public string? categoria { get; set; }
        public string scope_default { get; set; } = "EVENTO";
        public short fase_sugerida { get; set; } = 2;

        public bool monetizable { get; set; } = false;
        public bool activo { get; set; } = true;
        public bool visible_acceso_evento_default { get; set; }
        public bool visible_centro_evento_default { get; set; }
        public bool visible_acceso_programa_default { get; set; }
        public bool visible_centro_programa_default { get; set; }
        public bool aplica_evento { get; set; }
        public bool aplica_programa { get; set; }
        public long? id_feature_padre { get; set; }
        public bool es_feature_padre { get; set; }
        public bool es_configurable_usuario { get; set; }
        public int? orden_categoria { get; set; }
        public int? orden_feature { get; set; }

        public string? config_json { get; set; } // jsonb

        public string[] UniqueProperties => new[] { "codigo" };
    }
}