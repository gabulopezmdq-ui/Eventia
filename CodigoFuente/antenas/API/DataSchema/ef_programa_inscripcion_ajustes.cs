using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_ajustes : IRegistroUnico
    {
        public long id_inscripcion_ajuste { get; set; }

        public long id_inscripcion { get; set; }

        public string tipo { get; set; } = null!;

        public short id_tipo_ajuste { get; set; }

        public string? descripcion { get; set; }

        public decimal importe { get; set; }

        public string moneda { get; set; } = null!;

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_programa_inscripciones? inscripcion { get; set; }

        public virtual ef_param_programa_tipos_ajuste? tipo_ajuste { get; set; }
    }
}