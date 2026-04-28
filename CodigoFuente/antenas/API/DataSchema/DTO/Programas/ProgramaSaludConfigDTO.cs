using Newtonsoft.Json;
using System;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaSaludConfigDTO
    {
        [JsonPropertyName("id_salud_config")]
        [JsonProperty("id_salud_config")]
        public long? IdSaludConfig { get; set; }

        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("pedir_problema_medico")]
        [JsonProperty("pedir_problema_medico")]
        public bool PedirProblemaMedico { get; set; } = true;

        [JsonPropertyName("problema_medico_obligatorio")]
        [JsonProperty("problema_medico_obligatorio")]
        public bool ProblemaMedicoObligatorio { get; set; }

        [JsonPropertyName("pedir_alergias_no_alimentarias")]
        [JsonProperty("pedir_alergias_no_alimentarias")]
        public bool PedirAlergiasNoAlimentarias { get; set; } = true;

        [JsonPropertyName("alergias_no_alimentarias_obligatorio")]
        [JsonProperty("alergias_no_alimentarias_obligatorio")]
        public bool AlergiasNoAlimentariasObligatorio { get; set; }

        [JsonPropertyName("pedir_necesidad_especial")]
        [JsonProperty("pedir_necesidad_especial")]
        public bool PedirNecesidadEspecial { get; set; } = true;

        [JsonPropertyName("necesidad_especial_obligatorio")]
        [JsonProperty("necesidad_especial_obligatorio")]
        public bool NecesidadEspecialObligatorio { get; set; }

        [JsonPropertyName("pedir_cobertura_medica")]
        [JsonProperty("pedir_cobertura_medica")]
        public bool PedirCoberturaMedica { get; set; }

        [JsonPropertyName("cobertura_medica_obligatorio")]
        [JsonProperty("cobertura_medica_obligatorio")]
        public bool CoberturaMedicaObligatorio { get; set; }

        [JsonPropertyName("pedir_contacto_emergencia")]
        [JsonProperty("pedir_contacto_emergencia")]
        public bool PedirContactoEmergencia { get; set; } = true;

        [JsonPropertyName("contacto_emergencia_obligatorio")]
        [JsonProperty("contacto_emergencia_obligatorio")]
        public bool ContactoEmergenciaObligatorio { get; set; } = true;

        [JsonPropertyName("pedir_autoriza_emergencia_medica")]
        [JsonProperty("pedir_autoriza_emergencia_medica")]
        public bool PedirAutorizaEmergenciaMedica { get; set; } = true;

        [JsonPropertyName("autoriza_emergencia_medica_obligatorio")]
        [JsonProperty("autoriza_emergencia_medica_obligatorio")]
        public bool AutorizaEmergenciaMedicaObligatorio { get; set; } = true;

        [JsonPropertyName("pedir_observaciones_familia")]
        [JsonProperty("pedir_observaciones_familia")]
        public bool PedirObservacionesFamilia { get; set; } = true;

        [JsonPropertyName("observaciones_familia_obligatorio")]
        [JsonProperty("observaciones_familia_obligatorio")]
        public bool ObservacionesFamiliaObligatorio { get; set; }

        [JsonPropertyName("pedir_medicaciones")]
        [JsonProperty("pedir_medicaciones")]
        public bool PedirMedicaciones { get; set; } = true;

        [JsonPropertyName("medicaciones_obligatorio")]
        [JsonProperty("medicaciones_obligatorio")]
        public bool MedicacionesObligatorio { get; set; }

        [JsonPropertyName("activo")]
        [JsonProperty("activo")]
        public bool Activo { get; set; } = true;
    }
}