using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_evento_links : IRegistroUnico
    {
        public long id_evento_link { get; set; }
        public long id_evento { get; set; }

        public string tipo { get; set; } = null!;
        public string token { get; set; } = null!;

        public string? scopes { get; set; }      // jsonb
        public string? descripcion { get; set; }

        public System.DateTimeOffset? fecha_vencimiento { get; set; }
        public bool activo { get; set; } = true;

        public string[] UniqueProperties => new[] { "token" };
    }
}
