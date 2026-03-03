namespace API.DataSchema.DTO
{
    public class MusicaSugerenciaModerarDTO
    {
        public long id_invitado_musica_sugerencia { get; set; }
        public string accion { get; set; } = null!; // INCLUIR | RECHAZAR | PENDIENTE
        public string? nota_interna { get; set; }

        // Para incluir en playlist (opcional)
        public long? id_evento_musica_momento { get; set; } // si la querés poner en un momento
        public int? orden { get; set; }
    }
}
