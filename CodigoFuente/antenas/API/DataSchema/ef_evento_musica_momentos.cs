using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class ef_evento_musica_momentos : IRegistroUnico
    {
        public long id_evento_musica_momento { get; set; }
        public long id_evento { get; set; }

        public string nombre { get; set; } = null!;
        public int orden { get; set; } = 1;

        public bool activo { get; set; } = true;

        public string[] UniqueProperties => new[] { "id_evento", "nombre" };
    }
}