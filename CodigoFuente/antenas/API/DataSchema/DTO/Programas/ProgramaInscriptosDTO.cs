using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscriptosListItemDTO
    {
        public long IdInscripcion { get; set; }
        public long? IdRsvpGrupo { get; set; }

        public string Responsable { get; set; } = "";
        public string? Email { get; set; }
        public string? Telefono { get; set; }

        public List<string> Participantes { get; set; } = new();

        public int CantidadParticipantes { get; set; }
        public int CantidadPeriodos { get; set; }
        public int CantidadServicios { get; set; }

        public bool TieneRestriccionesAlimentarias { get; set; }
        public bool TieneAlertasSalud { get; set; }

        public decimal TotalOriginal { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal Saldo { get; set; }
        public string Moneda { get; set; } = "";
        public string EstadoPago { get; set; } = "";

        public string EstadoInscripcion { get; set; } = "";
    }

    public class ProgramaInscripcionDetalleOperativoDTO
    {
        public long IdInscripcion { get; set; }
        public long? IdRsvpGrupo { get; set; }

        public string Responsable { get; set; } = "";
        public string? Email { get; set; }
        public string? Telefono { get; set; }

        public string EstadoInscripcion { get; set; } = "";
        public string EstadoPago { get; set; } = "";
        public decimal TotalOriginal { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal Saldo { get; set; }
        public string Moneda { get; set; } = "";

        public List<ProgramaInscriptoParticipanteDetalleDTO> Participantes { get; set; } = new();
    }

    public class ProgramaInscriptoParticipanteDetalleDTO
    {
        public long IdInvitado { get; set; }
        public long IdRsvpGrupoIntegrante { get; set; }

        public string NombreCompleto { get; set; } = "";
        public DateOnly? FechaNacimiento { get; set; }
        public string? Observaciones { get; set; }

        public List<ProgramaInscriptoPeriodoDTO> Periodos { get; set; } = new();
        public List<ProgramaInscriptoServicioDTO> Servicios { get; set; } = new();
        public List<ProgramaInscriptoRestriccionDTO> RestriccionesAlimentarias { get; set; } = new();
        public ProgramaInscriptoSaludDTO? Salud { get; set; }
        public List<ProgramaInscriptoAutorizadoRetiroDTO> AutorizadosRetiro { get; set; } = new();
    }

    public class ProgramaInscriptoPeriodoDTO
    {
        public long IdProgramaPeriodo { get; set; }
        public string Nombre { get; set; } = "";
        public DateOnly FechaDesde { get; set; }
        public DateOnly FechaHasta { get; set; }
        public decimal PrecioBase { get; set; }
        public string Moneda { get; set; } = "";
    }

    public class ProgramaInscriptoServicioDTO
    {
        public long IdProgramaServicio { get; set; }
        public string Codigo { get; set; } = "";
        public string Nombre { get; set; } = "";
        public string TipoCalculo { get; set; } = "";
        public decimal Precio { get; set; }
        public decimal Subtotal { get; set; }
        public string Moneda { get; set; } = "";
        public int CantidadCalculada { get; set; }
    }

    public class ProgramaInscriptoRestriccionDTO
    {
        public long IdRestriccionAlim { get; set; }
        public string Codigo { get; set; } = "";
        public string Texto { get; set; } = "";
        public string? Categoria { get; set; }
        public bool RequiereAlertaVisual { get; set; }
        public bool EsAlergeno { get; set; }
        public string? Observaciones { get; set; }
        public string? Severidad { get; set; }
    }

    public class ProgramaInscriptoSaludDTO
    {
        public bool? TieneProblemaMedico { get; set; }
        public string? ProblemaMedicoDetalle { get; set; }
        public bool? TieneAlergiasNoAlimentarias { get; set; }
        public string? AlergiasNoAlimentariasDetalle { get; set; }
        public string? NecesidadEspecial { get; set; }
        public string? CoberturaMedica { get; set; }
        public string? ObservacionesFamilia { get; set; }
        public bool? AutorizaEmergenciaMedica { get; set; }
    }

    public class ProgramaInscriptoAutorizadoRetiroDTO
    {
        public long IdAutorizacion { get; set; }
        public string NombreAutorizado { get; set; } = "";
        public string? TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }
        public string? Observaciones { get; set; }
        public string? QrToken { get; set; }
    }

    public class ProgramaInscriptosResumenDTO
    {
        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("programa")]
        [JsonProperty("programa")]
        public string Programa { get; set; } = "";

        [JsonPropertyName("modulo")]
        [JsonProperty("modulo")]
        public string Modulo { get; set; } = "Inscriptos";

        [JsonPropertyName("total_familias")]
        [JsonProperty("total_familias")]
        public int TotalFamilias { get; set; }

        [JsonPropertyName("total_participantes")]
        [JsonProperty("total_participantes")]
        public int TotalParticipantes { get; set; }

        [JsonPropertyName("total_deuda")]
        [JsonProperty("total_deuda")]
        public decimal TotalDeuda { get; set; }

        [JsonPropertyName("moneda")]
        [JsonProperty("moneda")]
        public string Moneda { get; set; } = "";

        [JsonPropertyName("pendientes")]
        [JsonProperty("pendientes")]
        public int Pendientes { get; set; }

        [JsonPropertyName("parciales")]
        [JsonProperty("parciales")]
        public int Parciales { get; set; }

        [JsonPropertyName("pagados")]
        [JsonProperty("pagados")]
        public int Pagados { get; set; }

        [JsonPropertyName("sin_cargo")]
        [JsonProperty("sin_cargo")]
        public int SinCargo { get; set; }

        [JsonPropertyName("con_alertas")]
        [JsonProperty("con_alertas")]
        public int ConAlertas { get; set; }
    }
}