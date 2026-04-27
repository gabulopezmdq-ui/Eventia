using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_salud_acciones : IRegistroUnico
    {
        public long id_accion_salud { get; set; }

        public long id_evento { get; set; }
        public long id_inscripcion { get; set; }

        public DateTimeOffset fecha_hora { get; set; }

        public string tipo_accion { get; set; } = null!;
        public string descripcion { get; set; } = null!;

        public bool requirio_contacto_familia { get; set; }
        public bool contacto_realizado { get; set; }
        public bool requiere_seguimiento { get; set; }

        public long? usuario_registro { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_usuarios? usuario { get; set; }
    }
}