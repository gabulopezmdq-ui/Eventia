using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_servicios : IRegistroUnico
    {
        public long id_inscripcion_servicio { get; set; }

        public long id_inscripcion { get; set; }
        public long id_rsvp_grupo_integrante { get; set; }
        public long id_programa_servicio { get; set; }
        public long? id_programa_periodo { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string tipo_calculo { get; set; } = null!;
        public decimal precio { get; set; }
        public string moneda { get; set; } = "EUR";

        public int? cantidad { get; set; }
        public string? campos_extra_json { get; set; }

        public decimal subtotal { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_programa_inscripciones? inscripcion { get; set; }
        public virtual ef_rsvp_grupo_integrantes? integrante { get; set; }
        public virtual ef_programa_servicios? programa_servicio { get; set; }
        public virtual ef_programa_periodos? programa_periodo { get; set; }
    }
}