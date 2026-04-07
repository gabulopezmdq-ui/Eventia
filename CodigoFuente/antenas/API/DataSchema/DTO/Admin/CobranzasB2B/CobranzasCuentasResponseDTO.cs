using System.Collections.Generic;
using Newtonsoft.Json;

namespace API.DataSchema.DTO
{
    public class CobranzasCuentasResponseDTO
    {
        [JsonProperty("vencidas")]
        public List<CobranzaCuentaItemDTO> vencidas { get; set; } = new List<CobranzaCuentaItemDTO>();

        [JsonProperty("por_vencer")]
        public List<CobranzaCuentaItemDTO> por_vencer { get; set; } = new List<CobranzaCuentaItemDTO>();

        [JsonProperty("inconsistencias")]
        public List<CobranzaCuentaItemDTO> inconsistencias { get; set; } = new List<CobranzaCuentaItemDTO>();
    }
}
