using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_autorizaciones_config : IRegistroUnico
    {
        public long id_programa_autorizacion_config { get; set; }

        public long id_evento { get; set; }
        public long? id_autorizacion_base { get; set; }

        public string codigo { get; set; } = null!;
        public string? titulo_override { get; set; }
        public string? texto_override { get; set; }

        public bool obligatoria { get; set; }
        public bool requiere_aceptacion { get; set; }
        public bool requiere_datos_responsable { get; set; }

        public int orden { get; set; }
        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_evento", "id_autorizacion_base" };

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_param_programa_autorizaciones_base? autorizacion_base { get; set; }
    }
}