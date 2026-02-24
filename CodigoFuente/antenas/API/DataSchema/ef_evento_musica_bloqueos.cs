using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_evento_musica_bloqueos : IRegistroUnico
    {
        public long id_evento_musica_bloqueo { get; set; }
        public long id_evento { get; set; }

        public string? titulo { get; set; }
        public string? artista { get; set; }
        public string? link { get; set; }
        public string? nota { get; set; }

        public string hash_normalizado { get; set; } = null!;

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }

        public string[] UniqueProperties => new[] { "id_evento", "hash_normalizado" };
    }
}
