using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_salud_medicaciones : IRegistroUnico
    {
        public long id_medicacion { get; set; }

        public long id_salud_ficha { get; set; }

        public string nombre_medicacion { get; set; } = null!;
        public string? dosis { get; set; }
        public string? frecuencia { get; set; }
        public string? horario { get; set; }
        public string? indicaciones { get; set; }

        public bool requiere_autorizacion { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_programa_inscripcion_salud_fichas? salud_ficha { get; set; }
    }
}
