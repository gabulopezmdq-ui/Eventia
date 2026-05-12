using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO
{
    public class AudienciaPendienteManualBeneficioDTO
    {
        [JsonPropertyName("id_invitado")]
        public long id_invitado { get; set; }

        [JsonPropertyName("id_beneficio_registro")]
        public long id_beneficio_registro { get; set; }

        [JsonPropertyName("nombre")]
        public string nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        public string apellido { get; set; } = null!;

        [JsonPropertyName("celular")]
        public string? celular { get; set; }

        [JsonPropertyName("campania")]
        public string? campania { get; set; }

        [JsonPropertyName("acceso_nombre")]
        public string? acceso_nombre { get; set; }

        [JsonPropertyName("beneficio_titulo")]
        public string beneficio_titulo { get; set; } = null!;

        [JsonPropertyName("fecha_ingreso")]
        public DateTimeOffset? fecha_ingreso { get; set; }

        [JsonPropertyName("observaciones_ingreso")]
        public string? observaciones_ingreso { get; set; }
    }
}