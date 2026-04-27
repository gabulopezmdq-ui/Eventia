using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_servicios : IRegistroUnico
    {
        public long id_programa_servicio { get; set; }
        public long id_evento { get; set; }

        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }

        public string tipo_calculo { get; set; } = null!;
        public decimal precio { get; set; }
        public string moneda { get; set; } = "EUR";

        public bool obligatorio { get; set; }
        public bool permite_cantidad { get; set; }

        public int? cupo { get; set; }

        public int orden { get; set; }
        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
        public bool requiere_seleccion_dias { get; set; }
        public string? config_json { get; set; }
        public long? id_servicio_base { get; set; }
        public virtual ef_param_programa_servicios_base? servicio_base { get; set; }

        public string[] UniqueProperties => new[] { "id_evento", "codigo" };

        public virtual ef_eventos? evento { get; set; }
    }
}