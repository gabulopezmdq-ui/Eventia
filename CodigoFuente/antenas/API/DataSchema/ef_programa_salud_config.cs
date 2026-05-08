using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_salud_config : IRegistroUnico
    {
        public long id_salud_config { get; set; }
        public long id_evento { get; set; }

        public bool pedir_problema_medico { get; set; }
        public bool problema_medico_obligatorio { get; set; }

        public bool pedir_alergias_no_alimentarias { get; set; }
        public bool alergias_no_alimentarias_obligatorio { get; set; }

        public bool pedir_necesidad_especial { get; set; }
        public bool necesidad_especial_obligatorio { get; set; }

        public bool pedir_cobertura_medica { get; set; }
        public bool cobertura_medica_obligatorio { get; set; }

        public bool pedir_contacto_emergencia { get; set; }
        public bool contacto_emergencia_obligatorio { get; set; }

        public bool pedir_autoriza_emergencia_medica { get; set; }
        public bool autoriza_emergencia_medica_obligatorio { get; set; }

        public bool pedir_observaciones_familia { get; set; }
        public bool observaciones_familia_obligatorio { get; set; }

        public bool pedir_medicaciones { get; set; }
        public bool medicaciones_obligatorio { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_evento" };

        public virtual ef_eventos? evento { get; set; }
    }
}