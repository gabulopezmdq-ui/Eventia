using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Portal
{
    public class PortalPuntualResponseDto
    {
        [JsonProperty("tipoPortal")]
        [JsonPropertyName("tipoPortal")]
        public string TipoPortal { get; set; } = null!;

        [JsonProperty("idEvento")]
        [JsonPropertyName("idEvento")]
        public long IdEvento { get; set; }

        [JsonProperty("evento")]
        [JsonPropertyName("evento")]
        public PortalPuntualEventoDto Evento { get; set; } = null!;

        [JsonProperty("usuario")]
        [JsonPropertyName("usuario")]
        public PortalPuntualUsuarioDto Usuario { get; set; } = null!;

        [JsonProperty("requiere_desbloqueo_sensible")]
        [JsonPropertyName("requiere_desbloqueo_sensible")]
        public bool RequiereDesbloqueoSensible { get; set; }

        [JsonProperty("desbloqueado_sensible")]
        [JsonPropertyName("desbloqueado_sensible")]
        public bool DesbloqueadoSensible { get; set; }

        [JsonProperty("url_mi_eventia")]
        [JsonPropertyName("url_mi_eventia")]
        public string? UrlMiEventia { get; set; }

        [JsonProperty("secciones")]
        [JsonPropertyName("secciones")]
        public List<PortalSeccionDTO> Secciones { get; set; } = null!;

        [JsonProperty("data")]
        [JsonPropertyName("data")]
        public PortalPuntualDataDto Data { get; set; } = null!;
    }

    public class PortalPuntualEventoDto
    {
        [JsonProperty("titulo")]
        [JsonPropertyName("titulo")]
        public string Titulo { get; set; } = string.Empty;

        [JsonProperty("fechaInicio")]
        [JsonPropertyName("fechaInicio")]
        public string FechaInicio { get; set; } = string.Empty;

        [JsonProperty("fechaFin")]
        [JsonPropertyName("fechaFin")]
        public string FechaFin { get; set; } = string.Empty;
    }

    public class PortalPuntualUsuarioDto
    {
        [JsonProperty("nombre")]
        [JsonPropertyName("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [JsonProperty("email")]
        [JsonPropertyName("email")]
        public string? Email { get; set; }
    }

    public class PortalPuntualDataDto
    {
        [JsonProperty("resumen")]
        [JsonPropertyName("resumen")]
        public object Resumen { get; set; } = new { };

        [JsonProperty("pagos")]
        [JsonPropertyName("pagos")]
        public object? Pagos { get; set; }

        [JsonProperty("salud")]
        [JsonPropertyName("salud")]
        public object? Salud { get; set; }

        [JsonProperty("qrsRetiro")]
        [JsonPropertyName("qrsRetiro")]
        public object? QrsRetiro { get; set; }

        [JsonProperty("fotos")]
        [JsonPropertyName("fotos")]
        public object? Fotos { get; set; }

        [JsonProperty("autorizaciones")]
        [JsonPropertyName("autorizaciones")]
        public object? Autorizaciones { get; set; }
    }
}
