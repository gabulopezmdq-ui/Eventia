using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_salud_fichas : IRegistroUnico
    {
        public long id_salud_ficha { get; set; }

        public long id_inscripcion { get; set; }
        public long id_rsvp_grupo_integrante { get; set; }

        public bool? tiene_problema_medico { get; set; }
        public string? problema_medico_detalle { get; set; }

        public bool? tiene_alergias_no_alimentarias { get; set; }
        public string? alergias_no_alimentarias_detalle { get; set; }

        public string? necesidad_especial { get; set; }
        public string? cobertura_medica { get; set; }

        public string? observaciones_familia { get; set; }

        public bool? autoriza_emergencia_medica { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_inscripcion", "id_rsvp_grupo_integrante" };

        public virtual ef_programa_inscripciones? inscripcion { get; set; }
        public virtual ef_rsvp_grupo_integrantes? integrante { get; set; }
    }
}