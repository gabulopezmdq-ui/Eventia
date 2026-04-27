using Newtonsoft.Json;
using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaSaludMedicacionDTO
    {
        [JsonPropertyName("id_medicacion")]
        [JsonProperty("id_medicacion")]
        public long? IdMedicacion { get; set; }

        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("nombre_medicamento")]
        [JsonProperty("nombre_medicamento")]
        public string NombreMedicamento { get; set; } = null!;

        [JsonPropertyName("dosis")]
        [JsonProperty("dosis")]
        public string? Dosis { get; set; }

        [JsonPropertyName("frecuencia")]
        [JsonProperty("frecuencia")]
        public string? Frecuencia { get; set; }

        [JsonPropertyName("horario")]
        [JsonProperty("horario")]
        public string? Horario { get; set; }

        [JsonPropertyName("instrucciones")]
        [JsonProperty("instrucciones")]
        public string? Instrucciones { get; set; }

        [JsonPropertyName("administracion_autorizada")]
        [JsonProperty("administracion_autorizada")]
        public bool AdministracionAutorizada { get; set; }

        [JsonPropertyName("debe_llevar_participante")]
        [JsonProperty("debe_llevar_participante")]
        public bool DebeLlevarParticipante { get; set; }

        [JsonPropertyName("requiere_refrigeracion")]
        [JsonProperty("requiere_refrigeracion")]
        public bool RequiereRefrigeracion { get; set; }

        [JsonPropertyName("activo")]
        [JsonProperty("activo")]
        public bool Activo { get; set; } = true;

        [JsonPropertyName("fecha_alta")]
        [JsonProperty("fecha_alta")]
        public DateTimeOffset? FechaAlta { get; set; }
    }
}