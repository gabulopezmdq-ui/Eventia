using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_invitado_musica_sugerencias : IRegistroUnico
    {
        public long id_invitado_musica_sugerencia { get; set; }

        public long id_evento { get; set; }
        public long id_invitado { get; set; }

        public string titulo { get; set; } = null!;
        public string? artista { get; set; }
        public string? link { get; set; }
        public string? nota { get; set; }

        public string hash_normalizado { get; set; } = null!;

        public bool activo { get; set; } = true;

        public string[] UniqueProperties => new[] { "id_invitado", "hash_normalizado" };
    }
}