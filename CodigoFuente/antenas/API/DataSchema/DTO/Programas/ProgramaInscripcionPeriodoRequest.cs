using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionPeriodoRequest
    {
        [JsonPropertyName("id_programa_periodo")]
        [JsonProperty("id_programa_periodo")]
        public long IdProgramaPeriodo { get; set; }
    }

    public class ProgramaInscripcionServicioRequest
    {
        [JsonPropertyName("id_programa_servicio")]
        [JsonProperty("id_programa_servicio")]
        public long IdProgramaServicio { get; set; }

        [JsonPropertyName("id_programa_periodo")]
        [JsonProperty("id_programa_periodo")]
        public long? IdProgramaPeriodo { get; set; }

        [JsonPropertyName("fechas")]
        [JsonProperty("fechas")]
        public List<DateOnly> Fechas { get; set; } = new();

        [JsonPropertyName("cantidad")]
        [JsonProperty("cantidad")]
        public int? Cantidad { get; set; }

        [JsonPropertyName("campos_extra")]
        [JsonProperty("campos_extra")]
        public Dictionary<string, string>? CamposExtra { get; set; }
    }
}