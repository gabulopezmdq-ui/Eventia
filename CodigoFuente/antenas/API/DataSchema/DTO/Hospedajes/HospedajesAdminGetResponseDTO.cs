using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class HospedajesAdminGetResponseDTO
    {
        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("config")]
        public HospedajesConfigDTO config { get; set; } = new HospedajesConfigDTO();

        [JsonPropertyName("items")]
        public List<HospedajeDTO> items { get; set; } = new List<HospedajeDTO>();
    }
}