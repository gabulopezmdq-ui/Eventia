using System;

namespace API.DataSchema.DTO
{
    public class EventoAgendaRequestDTO
    {
        public long? id_tramo { get; set; }
        public long id_tipo_agenda_evento { get; set; }

        public string titulo { get; set; }
        public string? descripcion { get; set; }

        public short? dia_semana { get; set; }
        public DateTime? fecha { get; set; }

        public TimeSpan? hora_inicio { get; set; }
        public TimeSpan? hora_fin { get; set; }

        public short orden { get; set; } = 1;
        public bool visible_publico { get; set; } = true;
        public bool activo { get; set; } = true;
    }
}