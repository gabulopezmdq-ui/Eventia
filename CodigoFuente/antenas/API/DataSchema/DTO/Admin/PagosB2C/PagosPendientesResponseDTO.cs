using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class PagosPendientesResponseDTO
    {
        [JsonPropertyName("pendientes")]
        public List<PagoPendienteItemDTO> pendientes { get; set; } = new List<PagoPendienteItemDTO>();

        [JsonPropertyName("inconsistencias")]
        public List<PagoPendienteItemDTO> inconsistencias { get; set; } = new List<PagoPendienteItemDTO>();
    }
}
