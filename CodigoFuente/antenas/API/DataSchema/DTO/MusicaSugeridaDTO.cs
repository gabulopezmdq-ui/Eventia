namespace API.DataSchema.DTO
{
    public class dto_musica_sugerencia
    {
        public string titulo { get; set; } = null!;
        public string? artista { get; set; }
        public string? link { get; set; }
        public string? nota { get; set; }
    }

    public class dto_musica_sugerencia_request
    {
        public dto_musica_sugerencia item { get; set; } = new dto_musica_sugerencia();
    }

    public class dto_musica_voto_request
    {
        public long id_invitado_musica_sugerencia { get; set; }
    }
}