using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class ProspectoB2BCreateRequestDTO
    {
        [JsonPropertyName("nombre_apellido")]
        public string nombre_apellido { get; set; } = null!;

        [JsonPropertyName("empresa_nombre")]
        public string empresa_nombre { get; set; } = null!;

        [JsonPropertyName("ciudad")]
        public string ciudad { get; set; } = null!;

        [JsonPropertyName("pais")]
        public string pais { get; set; } = "AR";

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("whatsapp")]
        public string? whatsapp { get; set; }

        [JsonPropertyName("eventos_por_mes")]
        public int? eventos_por_mes { get; set; }

        [JsonPropertyName("origen")]
        public string? origen { get; set; }

        // tracking (opcionales)
        [JsonPropertyName("campania_fuente")]
        public string? campania_fuente { get; set; }
        [JsonPropertyName("campania_medio")]
        public string? campania_medio { get; set; }
        [JsonPropertyName("campania_nombre")]
        public string? campania_nombre { get; set; }
        [JsonPropertyName("campania_contenido")]
        public string? campania_contenido { get; set; }
        [JsonPropertyName("campania_termino")]
        public string? campania_termino { get; set; }

        [JsonPropertyName("pagina_origen")]
        public string? pagina_origen { get; set; }

        [JsonPropertyName("referer")]
        public string? referer { get; set; }
    }
}
