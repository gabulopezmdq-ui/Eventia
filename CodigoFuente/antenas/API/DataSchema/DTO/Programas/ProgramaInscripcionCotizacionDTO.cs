using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionCotizarRequest
    {
        [JsonPropertyName("id_idioma")]
        [JsonProperty("id_idioma")]
        public short? IdIdioma { get; set; }

        [JsonPropertyName("periodos")]
        [JsonProperty("periodos")]
        public List<ProgramaInscripcionCotizarPeriodoRequest> Periodos { get; set; } = new();

        [JsonPropertyName("servicios")]
        [JsonProperty("servicios")]
        public List<ProgramaInscripcionCotizarServicioRequest> Servicios { get; set; } = new();
    }

    public class ProgramaInscripcionCotizarPeriodoRequest
    {
        [JsonPropertyName("id_programa_periodo")]
        [JsonProperty("id_programa_periodo")]
        public long IdProgramaPeriodo { get; set; }
    }

    public class ProgramaInscripcionCotizarServicioRequest
    {
        [JsonPropertyName("id_programa_servicio")]
        [JsonProperty("id_programa_servicio")]
        public long IdProgramaServicio { get; set; }

        [JsonPropertyName("id_programa_periodo")]
        [JsonProperty("id_programa_periodo")]
        public long? IdProgramaPeriodo { get; set; }

        [JsonPropertyName("fechas")]
        [JsonProperty("fechas")]
        public List<DateOnly> Fechas { get; set; } = new();

        [JsonPropertyName("cantidad")]
        [JsonProperty("cantidad")]
        public int? Cantidad { get; set; }

        [JsonPropertyName("campos_extra")]
        [JsonProperty("campos_extra")]
        public Dictionary<string, string>? CamposExtra { get; set; }
    }

    public class ProgramaInscripcionCotizarResponse
    {
        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("moneda")]
        [JsonProperty("moneda")]
        public string Moneda { get; set; } = "EUR";

        [JsonPropertyName("base")]
        [JsonProperty("base")]
        public decimal Base { get; set; }

        [JsonPropertyName("servicios_total")]
        [JsonProperty("servicios_total")]
        public decimal ServiciosTotal { get; set; }

        [JsonPropertyName("total")]
        [JsonProperty("total")]
        public decimal Total { get; set; }

        [JsonPropertyName("periodos")]
        [JsonProperty("periodos")]
        public List<ProgramaInscripcionCotizarPeriodoResponse> Periodos { get; set; } = new();

        [JsonPropertyName("servicios")]
        [JsonProperty("servicios")]
        public List<ProgramaInscripcionCotizarServicioResponse> Servicios { get; set; } = new();
    }

    public class ProgramaInscripcionCotizarPeriodoResponse
    {
        [JsonPropertyName("id_programa_periodo")]
        [JsonProperty("id_programa_periodo")]
        public long IdProgramaPeriodo { get; set; }

        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("precio_base")]
        [JsonProperty("precio_base")]
        public decimal PrecioBase { get; set; }
    }

    public class ProgramaInscripcionCotizarServicioResponse
    {
        [JsonPropertyName("id_programa_servicio")]
        [JsonProperty("id_programa_servicio")]
        public long IdProgramaServicio { get; set; }

        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = null!;

        [JsonPropertyName("tipo_calculo")]
        [JsonProperty("tipo_calculo")]
        public string TipoCalculo { get; set; } = null!;

        [JsonPropertyName("precio_unitario")]
        [JsonProperty("precio_unitario")]
        public decimal PrecioUnitario { get; set; }

        [JsonPropertyName("cantidad_calculada")]
        [JsonProperty("cantidad_calculada")]
        public int CantidadCalculada { get; set; }

        [JsonPropertyName("subtotal")]
        [JsonProperty("subtotal")]
        public decimal Subtotal { get; set; }
    }
}