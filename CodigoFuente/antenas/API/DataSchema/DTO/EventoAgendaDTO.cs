using System;

namespace API.DataSchema.DTO
{
    public class EventoAgendaDTO
    {
        public long id_agenda { get; set; }
        public long id_evento { get; set; }
        public long? id_tramo { get; set; }
        public long id_tipo_agenda_evento { get; set; }

        public string tipo_codigo { get; set; }
        public string tipo_texto { get; set; }

        public string titulo { get; set; }
        public string? descripcion { get; set; }

        public short? dia_semana { get; set; }
        public DateTime? fecha { get; set; }

        public TimeSpan? hora_inicio { get; set; }
        public TimeSpan? hora_fin { get; set; }

        public short orden { get; set; }
        public bool visible_publico { get; set; }
        public bool activo { get; set; }

        public DateTime fecha_alta { get; set; }
    }
}
