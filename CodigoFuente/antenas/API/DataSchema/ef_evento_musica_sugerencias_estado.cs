using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_evento_musica_sugerencias_estado : IRegistroUnico
    {
        public long id_evento_musica_sugerencia_estado { get; set; }

        public long id_evento { get; set; }
        public long id_invitado_musica_sugerencia { get; set; }

        public string estado { get; set; } = "PENDIENTE";
        public string? nota_interna { get; set; }

        public long? id_evento_musica_playlist { get; set; }

        public string[] UniqueProperties => new[] { "id_invitado_musica_sugerencia" };
    }
}
