using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_servicio_dias : IRegistroUnico
    {
        public long id_inscripcion_servicio_dia { get; set; }

        public long id_inscripcion_servicio { get; set; }
        public DateOnly fecha { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_inscripcion_servicio", "fecha" };

        public virtual ef_programa_inscripcion_servicios? inscripcion_servicio { get; set; }
    }
}