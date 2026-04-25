using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaPeriodoDTO
    {
        [JsonPropertyName("id_programa_periodo")]
        public long? IdProgramaPeriodo { get; set; }

        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("fecha_desde")]
        public DateOnly FechaDesde { get; set; }

        [JsonPropertyName("fecha_hasta")]
        public DateOnly FechaHasta { get; set; }

        [JsonPropertyName("precio_base")]
        public decimal PrecioBase { get; set; }

        [JsonPropertyName("moneda")]
        public string Moneda { get; set; } = "EUR";

        [JsonPropertyName("cupo")]
        public int? Cupo { get; set; }

        [JsonPropertyName("orden")]
        public int Orden { get; set; }

        [JsonPropertyName("activo")]
        public bool Activo { get; set; } = true;
    }
}
