using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Eventos
{
    public class EventoEquipoInternoDTO
    {
        [JsonPropertyName("id_evento_usuario")]
        public long id_evento_usuario { get; set; }

        [JsonPropertyName("id_evento")]
        public long id_evento { get; set; }

        [JsonPropertyName("id_usuario")]
        public long id_usuario { get; set; }

        [JsonPropertyName("nombre")]
        public string? nombre { get; set; }

        [JsonPropertyName("apellido")]
        public string? apellido { get; set; }

        [JsonPropertyName("email")]
        public string? email { get; set; }

        [JsonPropertyName("id_rol")]
        public short id_rol { get; set; }

        [JsonPropertyName("codigo_rol")]
        public string codigo_rol { get; set; } = null!;

        [JsonPropertyName("rol_texto")]
        public string rol_texto { get; set; } = null!;

        [JsonPropertyName("activo")]
        public bool activo { get; set; }

        [JsonPropertyName("fecha_alta")]
        public DateTimeOffset fecha_alta { get; set; }
    }

    public class AddEventoEquipoInternoRequest
    {
        [JsonPropertyName("email")]
        public string email { get; set; } = null!;

        [JsonPropertyName("id_rol")]
        public short id_rol { get; set; }
    }

    public class UpdateEventoEquipoInternoRequest
    {
        [JsonPropertyName("activo")]
        public bool activo { get; set; }
    }
}
