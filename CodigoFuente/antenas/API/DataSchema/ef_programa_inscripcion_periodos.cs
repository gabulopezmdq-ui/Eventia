using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_periodos : IRegistroUnico
    {
        public long id_inscripcion_periodo { get; set; }

        public long id_inscripcion { get; set; }
        public long id_rsvp_grupo_integrante { get; set; }
        public long id_programa_periodo { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public DateOnly fecha_desde { get; set; }
        public DateOnly fecha_hasta { get; set; }
        public decimal precio_base { get; set; }
        public string moneda { get; set; } = "EUR";

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_inscripcion", "id_rsvp_grupo_integrante", "id_programa_periodo" };

        public virtual ef_programa_inscripciones? inscripcion { get; set; }
        public virtual ef_rsvp_grupo_integrantes? integrante { get; set; }
        public virtual ef_programa_periodos? programa_periodo { get; set; }
    }
}