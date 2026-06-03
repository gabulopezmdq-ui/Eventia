namespace API.DataSchema.DTO
{
    public class EventoAgendaImportarTramosResponseDTO
    {
        public bool ok { get; set; }
        public long id_evento { get; set; }
        public int tramos_encontrados { get; set; }
        public int creados { get; set; }
        public int omitidos { get; set; }
    }
}