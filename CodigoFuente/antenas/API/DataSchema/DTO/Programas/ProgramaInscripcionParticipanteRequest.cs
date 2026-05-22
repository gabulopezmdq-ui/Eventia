using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionParticipanteRequest
    {
        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("apellido")]
        [JsonProperty("apellido")]
        public string Apellido { get; set; } = null!;

        [JsonPropertyName("fecha_nacimiento")]
        [JsonProperty("fecha_nacimiento")]
        public DateOnly? FechaNacimiento { get; set; }

        [JsonPropertyName("documento")]
        [JsonProperty("documento")]
        public string? Documento { get; set; }

        [JsonPropertyName("observaciones")]
        [JsonProperty("observaciones")]
        public string? Observaciones { get; set; }

        [JsonPropertyName("periodos")]
        [JsonProperty("periodos")]
        public List<ProgramaInscripcionPeriodoRequest> Periodos { get; set; } = new();

        [JsonPropertyName("servicios")]
        [JsonProperty("servicios")]
        public List<ProgramaInscripcionServicioRequest> Servicios { get; set; } = new();

        [JsonPropertyName("restricciones_alimentarias")]
        [JsonProperty("restricciones_alimentarias")]
        public List<ProgramaInscripcionRestriccionRequest> RestriccionesAlimentarias { get; set; } = new();

        [JsonPropertyName("modalidad_retiro")]
        [JsonProperty("modalidad_retiro")]
        public string? ModalidadRetiro { get; set; }

        [JsonPropertyName("autorizados_retiro")]
        [JsonProperty("autorizados_retiro")]
        public List<ProgramaInscripcionAutorizadoRetiroRequest> AutorizadosRetiro { get; set; } = new();

        [JsonPropertyName("autorizaciones")]
        [JsonProperty("autorizaciones")]
        public List<ProgramaInscripcionAutorizacionRequest> Autorizaciones { get; set; } = new();

        [JsonPropertyName("salud")]
        [JsonProperty("salud")]
        public ProgramaInscripcionSaludRequest? Salud { get; set; }


    }
}