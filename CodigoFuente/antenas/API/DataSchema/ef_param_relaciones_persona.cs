using System;

namespace API.DataSchema
{
    public class ef_param_relaciones_persona
    {
        public long id_relacion_persona { get; set; }
        public string codigo { get; set; }
        public bool activo { get; set; }
        public short orden { get; set; }

        public bool permite_responsable_inscripcion { get; set; }
        public bool permite_autorizado_retiro { get; set; }
        public bool permite_rsvp_grupo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}