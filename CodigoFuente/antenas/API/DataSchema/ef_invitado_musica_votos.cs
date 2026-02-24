using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_invitado_musica_votos : IRegistroUnico
    {
        public long id_invitado_musica_voto { get; set; }

        public long id_evento { get; set; }
        public long id_invitado { get; set; }

        public long id_invitado_musica_sugerencia { get; set; }

        public short valor { get; set; } = 1;

        public string[] UniqueProperties => new[] { "id_evento", "id_invitado" };
    }
}
