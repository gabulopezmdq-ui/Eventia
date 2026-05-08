using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_salud_medicaciones : IRegistroUnico
    {
        public long id_medicacion { get; set; }

        public long id_evento { get; set; }
        public long id_inscripcion { get; set; }

        public string nombre_medicamento { get; set; } = null!;
        public string? dosis { get; set; }
        public string? frecuencia { get; set; }
        public string? horario { get; set; }
        public string? instrucciones { get; set; }

        public bool administracion_autorizada { get; set; }
        public bool debe_llevar_participante { get; set; }
        public bool requiere_refrigeracion { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_eventos? evento { get; set; }
    }
}