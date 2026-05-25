using System;

namespace API.DataSchema.DTO.Transporte
{
    public class TransporteEventoDTO
    {
        public long id_evento { get; set; }
        public string? info_publica { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}