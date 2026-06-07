namespace API.DataSchema.DTO.Eventos.Features
{
    public class EventoFeatureVisibilidadDTO
    {
        public long id_evento { get; set; }
        public long id_feature { get; set; }
        public string codigo { get; set; }
        public string nombre { get; set; }

        public bool activo_evento { get; set; }

        public bool visible_acceso { get; set; }
        public bool visible_centro { get; set; }

        public bool permite_acceso { get; set; }
        public bool permite_centro { get; set; }
    }
}