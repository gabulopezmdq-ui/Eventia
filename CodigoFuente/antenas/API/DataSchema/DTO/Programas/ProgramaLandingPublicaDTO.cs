using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaLandingPublicaDTO
    {
        [JsonProperty("id_evento")]
        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonProperty("id_acceso")]
        [JsonPropertyName("id_acceso")]
        public long IdAcceso { get; set; }

        [JsonProperty("id_acceso_link")]
        [JsonPropertyName("id_acceso_link")]
        public long IdAccesoLink { get; set; }

        [JsonProperty("titulo")]
        [JsonPropertyName("titulo")]
        public string Titulo { get; set; } = null!;

        [JsonProperty("leyenda_publica")]
        [JsonPropertyName("leyenda_publica")]
        public string? LeyendaPublica { get; set; }

        [JsonProperty("anfitriones_texto")]
        [JsonPropertyName("anfitriones_texto")]
        public string AnfitrionesTexto { get; set; } = null!;

        [JsonProperty("saludo")]
        [JsonPropertyName("saludo")]
        public string? Saludo { get; set; }

        [JsonProperty("mensaje_bienvenida")]
        [JsonPropertyName("mensaje_bienvenida")]
        public string? MensajeBienvenida { get; set; }

        [JsonProperty("info_publica")]
        [JsonPropertyName("info_publica")]
        public string? InfoPublica { get; set; }

        [JsonProperty("fecha_inicio")]
        [JsonPropertyName("fecha_inicio")]
        public DateOnly? FechaInicio { get; set; }

        [JsonProperty("fecha_fin")]
        [JsonPropertyName("fecha_fin")]
        public DateOnly? FechaFin { get; set; }

        [JsonProperty("id_idioma")]
        [JsonPropertyName("id_idioma")]
        public short IdIdioma { get; set; }

        [JsonProperty("expirado")]
        [JsonPropertyName("expirado")]
        public bool Expirado { get; set; }

        [JsonProperty("id_idioma_actual")]
        [JsonPropertyName("id_idioma_actual")]
        public short IdIdiomaActual { get; set; }

        [JsonProperty("idiomas")]
        [JsonPropertyName("idiomas")]
        public List<ProgramaLandingIdiomaDTO> Idiomas { get; set; } = new();

        [JsonProperty("periodos")]
        [JsonPropertyName("periodos")]
        public List<ProgramaPeriodoDTO> Periodos { get; set; } = new();

        [JsonProperty("servicios")]
        [JsonPropertyName("servicios")]
        public List<ProgramaServicioDTO> Servicios { get; set; } = new();

        [JsonProperty("salud_config")]
        [JsonPropertyName("salud_config")]
        public ProgramaSaludConfigDTO? SaludConfig { get; set; }

        [JsonProperty("autorizaciones")]
        [JsonPropertyName("autorizaciones")]
        public List<ProgramaAutorizacionConfigDTO> Autorizaciones { get; set; } = new();
    }
}