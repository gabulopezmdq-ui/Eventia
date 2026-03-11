using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class ProspectoB2BUpdateAdminDTO
    {
        [JsonPropertyName("estado")]
        public string? estado { get; set; }

        [JsonPropertyName("nota_interna")]
        public string? nota_interna { get; set; }

        [JsonPropertyName("id_usuario_asignado")]
        public long? id_usuario_asignado { get; set; }

        [JsonPropertyName("proximo_contacto")]
        public DateTimeOffset? proximo_contacto { get; set; }

        [JsonPropertyName("activo")]
        public bool? activo { get; set; }
    }
}
