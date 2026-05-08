using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_salud_fichas : IRegistroUnico
    {
        public long id_ficha_salud { get; set; }

        public long id_evento { get; set; }
        public long id_inscripcion { get; set; }

        public bool tiene_problema_medico { get; set; }
        public string? detalle_problema_medico { get; set; }

        public bool tiene_alergias_no_alimentarias { get; set; }
        public string? detalle_alergias_no_alimentarias { get; set; }

        public bool tiene_necesidad_especial { get; set; }
        public string? detalle_necesidad_especial { get; set; }

        public bool tiene_cobertura_medica { get; set; }
        public string? cobertura_medica_nombre { get; set; }
        public string? cobertura_medica_numero { get; set; }

        public string? contacto_emergencia_nombre { get; set; }
        public string? contacto_emergencia_telefono { get; set; }
        public string? contacto_emergencia_relacion { get; set; }

        public bool autoriza_emergencia_medica { get; set; }

        public string? observaciones_familia { get; set; }
        public string? observaciones_internas { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_evento", "id_inscripcion" };

        public virtual ef_eventos? evento { get; set; }
    }
}