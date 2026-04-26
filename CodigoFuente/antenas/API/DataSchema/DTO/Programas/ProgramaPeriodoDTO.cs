using System;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaPeriodoDTO
    {
        [JsonPropertyName("id_programa_periodo")]
        [JsonProperty("id_programa_periodo")]
        public long? IdProgramaPeriodo { get; set; }

        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("codigo")]
        [JsonProperty("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("fecha_desde")]
        [JsonProperty("fecha_desde")]
        public DateOnly FechaDesde { get; set; }

        [JsonPropertyName("fecha_hasta")]
        [JsonProperty("fecha_hasta")]
        public DateOnly FechaHasta { get; set; }

        [JsonPropertyName("precio_base")]
        [JsonProperty("precio_base")]
        public decimal PrecioBase { get; set; }

        [JsonPropertyName("moneda")]
        [JsonProperty("moneda")]
        public string Moneda { get; set; } = "EUR";

        [JsonPropertyName("cupo")]
        [JsonProperty("cupo")]
        public int? Cupo { get; set; }

        [JsonPropertyName("orden")]
        [JsonProperty("orden")]
        public int Orden { get; set; }

        [JsonPropertyName("activo")]
        [JsonProperty("activo")]
        public bool Activo { get; set; } = true;
    }
}