using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoUpdateGeneralRequest
    {
        [JsonPropertyName("anfitriones_texto")]
        public string? AnfitrionesTexto { get; set; }

        [JsonPropertyName("id_dress_code")]
        public short? IdDressCode { get; set; }

        [JsonPropertyName("dress_code_descripcion")]
        public string? DressCodeDescripcion { get; set; }

        [JsonPropertyName("saludo")]
        public string? Saludo { get; set; }

        [JsonPropertyName("mensaje_bienvenida")]
        public string? MensajeBienvenida { get; set; }

        [JsonPropertyName("notas")]
        public string? Notas { get; set; }
    }
}
