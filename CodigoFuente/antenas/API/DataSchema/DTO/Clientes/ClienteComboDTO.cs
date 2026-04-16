using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class ClienteComboDTO
    {
        [JsonPropertyName("id_cliente")]
        public long id_cliente { get; set; }

        [JsonPropertyName("nombre_cliente")]
        public string nombre_cliente { get; set; } = null!;

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("telefono")]
        public string? telefono { get; set; }

        [JsonPropertyName("unidad_principal")]
        public string? unidad_principal { get; set; }

        [JsonPropertyName("id_unidad_principal")]
        public long? id_unidad_principal { get; set; }

        [JsonPropertyName("unidades")]
        public List<string> unidades { get; set; } = new List<string>();

        [JsonPropertyName("activo")]
        public bool activo { get; set; }
    }
}