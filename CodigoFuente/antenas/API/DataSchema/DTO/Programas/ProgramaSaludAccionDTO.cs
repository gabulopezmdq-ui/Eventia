using Newtonsoft.Json;
using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaSaludAccionDTO
    {
        [JsonPropertyName("id_accion_salud")]
        [JsonProperty("id_accion_salud")]
        public long? IdAccionSalud { get; set; }

        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_participante")]
        [JsonProperty("id_participante")]
        public long IdParticipante { get; set; }

        public long IdInscripcion { get; set; }

        [JsonPropertyName("fecha_hora")]
        [JsonProperty("fecha_hora")]
        public DateTimeOffset? FechaHora { get; set; }

        [JsonPropertyName("tipo_accion")]
        [JsonProperty("tipo_accion")]
        public string TipoAccion { get; set; } = null!;

        [JsonPropertyName("descripcion")]
        [JsonProperty("descripcion")]
        public string Descripcion { get; set; } = null!;

        [JsonPropertyName("requirio_contacto_familia")]
        [JsonProperty("requirio_contacto_familia")]
        public bool RequirioContactoFamilia { get; set; }

        [JsonPropertyName("contacto_realizado")]
        [JsonProperty("contacto_realizado")]
        public bool ContactoRealizado { get; set; }

        [JsonPropertyName("requiere_seguimiento")]
        [JsonProperty("requiere_seguimiento")]
        public bool RequiereSeguimiento { get; set; }

        [JsonPropertyName("usuario_registro")]
        [JsonProperty("usuario_registro")]
        public long? UsuarioRegistro { get; set; }

        [JsonPropertyName("activo")]
        [JsonProperty("activo")]
        public bool Activo { get; set; } = true;
    }
}