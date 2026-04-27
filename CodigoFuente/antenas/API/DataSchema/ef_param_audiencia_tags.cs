using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_audiencia_tags : IRegistroUnico
    {
        public long id_param_audiencia_tag { get; set; }
        public string tag_tipo { get; set; } = null!;
        public string tag_valor { get; set; } = null!;
        public string nombre_mostrar { get; set; } = null!;
        public string? descripcion { get; set; }
        public string origen { get; set; } = "MANUAL";
        public bool permite_asignacion_manual { get; set; } = true;
        public int orden { get; set; } = 1;
        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();
    }
}