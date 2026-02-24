using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_evento_features : IRegistroUnico
    {
        public long id_evento_feature { get; set; }

        public long id_evento { get; set; }
        public long id_feature { get; set; }

        public bool activo { get; set; } = true;

        public string? config_json { get; set; } // jsonb

        public string[] UniqueProperties => new[] { "id_evento", "id_feature" };
    }
}
