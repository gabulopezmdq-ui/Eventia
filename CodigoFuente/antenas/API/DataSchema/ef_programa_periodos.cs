using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_periodos : IRegistroUnico
    {
        public long id_programa_periodo { get; set; }

        public long id_evento { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;

        public DateOnly fecha_desde { get; set; }
        public DateOnly fecha_hasta { get; set; }

        public decimal precio_base { get; set; }
        public string moneda { get; set; } = "EUR";

        public int? cupo { get; set; }

        public int orden { get; set; }
        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_evento", "codigo" };

        public virtual ef_eventos? evento { get; set; }
    }
}