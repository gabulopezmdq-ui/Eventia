using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class EventoCreateRequest
    {
        [JsonPropertyName("id_tipo_evento")]
        public int IdTipoEvento { get; set; }

        [JsonPropertyName("id_idioma")]
        public short? IdIdioma { get; set; } // opcional

        [JsonPropertyName("anfitriones_texto")]
        public string AnfitrionesTexto { get; set; } = null!;

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

    public class EventoResponse
    {
        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_tipo_evento")]
        public int IdTipoEvento { get; set; }

        // NUEVO: código opcional (útil para íconos en front)
        [JsonPropertyName("tipo_evento_codigo")]
        public string? TipoEventoCodigo { get; set; }

        // NUEVO: descripción traducida
        [JsonPropertyName("tipo_evento_descripcion")]
        public string? TipoEventoDescripcion { get; set; }

        [JsonPropertyName("id_idioma")]
        public short IdIdioma { get; set; }

        [JsonPropertyName("anfitriones_texto")]
        public string AnfitrionesTexto { get; set; } = null!;

        [JsonPropertyName("estado")]
        public string Estado { get; set; } = null!;

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset FechaAlta { get; set; }
    }
}