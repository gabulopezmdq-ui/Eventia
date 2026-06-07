using System.Collections.Generic;

namespace API.DataSchema.DTO.Eventos.Features
{
    public class EventoFeatureVisibilidadBulkRequestDTO
    {
        public List<EventoFeatureVisibilidadItemDTO> items { get; set; } = new List<EventoFeatureVisibilidadItemDTO>();
    }

    public class EventoFeatureVisibilidadItemDTO
    {
        public long id_feature { get; set; }
        public bool visible_acceso { get; set; }
        public bool visible_centro { get; set; }
    }
}