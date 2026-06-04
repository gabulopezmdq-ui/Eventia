using System;

namespace API.DataSchema.DTO.Eventos.Novedades
{
    public class EventoNovedadRequestDTO
    {
        public long id_tipo_novedad_evento { get; set; }
        public string titulo { get; set; }
        public string descripcion { get; set; }
        public bool importante { get; set; }
        public DateTime? visible_desde { get; set; }
        public DateTime? visible_hasta { get; set; }
        public bool publicado { get; set; } = true;
        public bool activo { get; set; } = true;
        public string? url_adjunto { get; set; }
        public string? tipo_adjunto { get; set; }
        public bool destacada { get; set; }
        public short orden { get; set; } = 1;
    }
}