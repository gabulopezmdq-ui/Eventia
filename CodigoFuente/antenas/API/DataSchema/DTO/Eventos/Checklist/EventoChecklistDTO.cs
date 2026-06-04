using System;

namespace API.DataSchema.DTO.Eventos.Checklist
{
    public class EventoChecklistDTO
    {
        public long id_checklist { get; set; }
        public long id_evento { get; set; }
        public long id_checklist_prioridad { get; set; }

        public string prioridad_codigo { get; set; }
        public string prioridad_texto { get; set; }

        public string titulo { get; set; }
        public string? descripcion { get; set; }
        public string? categoria { get; set; }

        public DateTime? fecha_limite { get; set; }

        public bool completado { get; set; }
        public DateTime? fecha_completado { get; set; }

        public short orden { get; set; }
        public bool activo { get; set; }

        public long? id_usuario_alta { get; set; }
        public long? id_usuario_completa { get; set; }

        public DateTime fecha_alta { get; set; }
    }
}