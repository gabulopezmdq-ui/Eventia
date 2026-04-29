using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionSaludRequest
    {
        [JsonPropertyName("tiene_problema_medico")]
        [JsonProperty("tiene_problema_medico")]
        public bool? TieneProblemaMedico { get; set; }

        [JsonPropertyName("problema_medico_detalle")]
        [JsonProperty("problema_medico_detalle")]
        public string? ProblemaMedicoDetalle { get; set; }

        [JsonPropertyName("tiene_alergias_no_alimentarias")]
        [JsonProperty("tiene_alergias_no_alimentarias")]
        public bool? TieneAlergiasNoAlimentarias { get; set; }

        [JsonPropertyName("alergias_no_alimentarias_detalle")]
        [JsonProperty("alergias_no_alimentarias_detalle")]
        public string? AlergiasNoAlimentariasDetalle { get; set; }

        [JsonPropertyName("necesidad_especial")]
        [JsonProperty("necesidad_especial")]
        public string? NecesidadEspecial { get; set; }

        [JsonPropertyName("cobertura_medica")]
        [JsonProperty("cobertura_medica")]
        public string? CoberturaMedica { get; set; }

        [JsonPropertyName("observaciones_familia")]
        [JsonProperty("observaciones_familia")]
        public string? ObservacionesFamilia { get; set; }

        [JsonPropertyName("autoriza_emergencia_medica")]
        [JsonProperty("autoriza_emergencia_medica")]
        public bool? AutorizaEmergenciaMedica { get; set; }

        [JsonPropertyName("contactos_emergencia")]
        [JsonProperty("contactos_emergencia")]
        public List<ProgramaInscripcionContactoEmergenciaRequest> ContactosEmergencia { get; set; } = new();

        [JsonPropertyName("medicaciones")]
        [JsonProperty("medicaciones")]
        public List<ProgramaInscripcionMedicacionRequest> Medicaciones { get; set; } = new();
    }

    public class ProgramaInscripcionContactoEmergenciaRequest
    {
        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("telefono")]
        [JsonProperty("telefono")]
        public string Telefono { get; set; } = null!;

        [JsonPropertyName("relacion")]
        [JsonProperty("relacion")]
        public string? Relacion { get; set; }

        [JsonPropertyName("orden")]
        [JsonProperty("orden")]
        public int Orden { get; set; } = 1;
    }

    public class ProgramaInscripcionMedicacionRequest
    {
        [JsonPropertyName("nombre_medicacion")]
        [JsonProperty("nombre_medicacion")]
        public string NombreMedicacion { get; set; } = null!;

        [JsonPropertyName("dosis")]
        [JsonProperty("dosis")]
        public string? Dosis { get; set; }

        [JsonPropertyName("frecuencia")]
        [JsonProperty("frecuencia")]
        public string? Frecuencia { get; set; }

        [JsonPropertyName("horario")]
        [JsonProperty("horario")]
        public string? Horario { get; set; }

        [JsonPropertyName("indicaciones")]
        [JsonProperty("indicaciones")]
        public string? Indicaciones { get; set; }

        [JsonPropertyName("requiere_autorizacion")]
        [JsonProperty("requiere_autorizacion")]
        public bool RequiereAutorizacion { get; set; } = true;
    }
}