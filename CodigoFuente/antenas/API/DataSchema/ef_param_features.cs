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

        public string? config_json { get; set; } // jsonb

        public string[] UniqueProperties => new[] { "codigo" };
    }
}