using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_planes : IRegistroUnico
    {
        public long id_plan { get; set; }
        public string codigo { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }
        public string tipo { get; set; } = null!;     // B2C / B2B
        public string periodo { get; set; } = null!;  // UNICO / MENSUAL / ANUAL
        public bool activo { get; set; }
        public string? config_json { get; set; }      // jsonb

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "codigo" };
    }
}
