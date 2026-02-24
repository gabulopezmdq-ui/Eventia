using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_evento_musica_playlist : IRegistroUnico
    {
        public long id_evento_musica_playlist { get; set; }

        public long id_evento { get; set; }
        public long? id_evento_musica_momento { get; set; }

        public string titulo { get; set; } = null!;
        public string? artista { get; set; }
        public string? link { get; set; }

        public int orden { get; set; } = 1;

        public bool activo { get; set; } = true;

        public string[] UniqueProperties => new[] { "id_evento", "id_evento_musica_momento", "titulo", "artista" };
    }
}
