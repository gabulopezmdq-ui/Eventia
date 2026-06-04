using System;

namespace API.DataSchema.DTO.Eventos.Checklist
{
    public class EventoChecklistRequestDTO
    {
        public long id_checklist_prioridad { get; set; }

        public string titulo { get; set; }
        public string? descripcion { get; set; }
        public string? categoria { get; set; }

        public DateTime? fecha_limite { get; set; }

        public bool completado { get; set; } = false;

        public short orden { get; set; } = 1;
        public bool activo { get; set; } = true;
    }
}