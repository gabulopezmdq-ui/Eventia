using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaLandingPublicaDTO
    {
        [JsonPropertyName("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_acceso")]
        public long IdAcceso { get; set; }

        [JsonPropertyName("id_acceso_link")]
        public long IdAccesoLink { get; set; }

        [JsonPropertyName("titulo")]
        public string Titulo { get; set; } = null!;

        [JsonPropertyName("leyenda_publica")]
        public string? LeyendaPublica { get; set; }

        [JsonPropertyName("anfitriones_texto")]
        public string AnfitrionesTexto { get; set; } = null!;

        [JsonPropertyName("saludo")]
        public string? Saludo { get; set; }

        [JsonPropertyName("mensaje_bienvenida")]
        public string? MensajeBienvenida { get; set; }

        [JsonPropertyName("fecha_inicio")]
        public DateOnly? FechaInicio { get; set; }

        [JsonPropertyName("fecha_fin")]
        public DateOnly? FechaFin { get; set; }

        [JsonPropertyName("id_idioma")]
        public short IdIdioma { get; set; }

        [JsonPropertyName("expirado")]
        public bool Expirado { get; set; }
        public short IdIdiomaActual { get; set; }
        public List<ProgramaLandingIdiomaDTO> Idiomas { get; set; } = new();
        public List<ProgramaPeriodoDTO> Periodos { get; set; } = new();
        public List<ProgramaServicioDTO> Servicios { get; set; } = new();
        public ProgramaSaludConfigDTO? SaludConfig { get; set; }
        public List<ProgramaAutorizacionConfigDTO> Autorizaciones { get; set; } = new();
    }
}