namespace API.DataSchema.DTO
{
    public class eventoLinkCreate
    {
        public long id_evento { get; set; }
        public string tipo { get; set; } = null!;          // DJ_MUSICA
        public string[] scopes { get; set; } = new string[0]; // ["MUSICA_READ","EXPORT"]
        public string? descripcion { get; set; }
        public int? vence_en_dias { get; set; }            // ej 30
    }

    public class eventoLinkRevoke
    {
        public long id_evento_link { get; set; }
    }
}
