using System;

namespace API.DataSchema.DTO
{
    public class PlanPublicoPrecioDTO
    {
        public string mercado { get; set; } = null!;
        public string moneda { get; set; } = null!;
        public decimal importe { get; set; }
        public bool impuestos_incluidos { get; set; }
        public DateTimeOffset vigente_desde { get; set; }
    }
}