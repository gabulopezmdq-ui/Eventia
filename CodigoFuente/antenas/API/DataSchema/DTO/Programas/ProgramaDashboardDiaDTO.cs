using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaDashboardDiaDTO
    {
        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("programa")]
        [JsonProperty("programa")]
        public string Programa { get; set; } = "";

        [JsonPropertyName("fecha")]
        [JsonProperty("fecha")]
        public DateOnly Fecha { get; set; }

        [JsonPropertyName("cards")]
        [JsonProperty("cards")]
        public ProgramaDashboardDiaCardsDTO Cards { get; set; } = new();

        [JsonPropertyName("alertas_operativas")]
        [JsonProperty("alertas_operativas")]
        public List<ProgramaDashboardAlertaDTO> AlertasOperativas { get; set; } = new();

        [JsonPropertyName("cocina")]
        [JsonProperty("cocina")]
        public ProgramaDashboardCocinaDTO Cocina { get; set; } = new();

        [JsonPropertyName("transporte")]
        [JsonProperty("transporte")]
        public ProgramaDashboardTransporteDTO Transporte { get; set; } = new();

        [JsonPropertyName("salud")]
        [JsonProperty("salud")]
        public ProgramaDashboardSaludDTO Salud { get; set; } = new();

        [JsonPropertyName("retiros")]
        [JsonProperty("retiros")]
        public ProgramaDashboardRetirosDTO Retiros { get; set; } = new();
    }

    public class ProgramaDashboardDiaCardsDTO
    {
        [JsonPropertyName("participantes_esperados")]
        [JsonProperty("participantes_esperados")]
        public int ParticipantesEsperados { get; set; }

        [JsonPropertyName("comedor")]
        [JsonProperty("comedor")]
        public int Comedor { get; set; }

        [JsonPropertyName("transporte")]
        [JsonProperty("transporte")]
        public int Transporte { get; set; }

        [JsonPropertyName("alertas")]
        [JsonProperty("alertas")]
        public int Alertas { get; set; }

        [JsonPropertyName("seguimientos")]
        [JsonProperty("seguimientos")]
        public int Seguimientos { get; set; }

        [JsonPropertyName("retiros_registrados")]
        [JsonProperty("retiros_registrados")]
        public int RetirosRegistrados { get; set; }
    }

    public class ProgramaDashboardAlertaDTO
    {
        [JsonPropertyName("nivel")]
        [JsonProperty("nivel")]
        public string Nivel { get; set; } = "";

        [JsonPropertyName("tipo")]
        [JsonProperty("tipo")]
        public string Tipo { get; set; } = "";

        [JsonPropertyName("mensaje")]
        [JsonProperty("mensaje")]
        public string Mensaje { get; set; } = "";

        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public string? Participante { get; set; }

        [JsonPropertyName("id_invitado")]
        [JsonProperty("id_invitado")]
        public long? IdInvitado { get; set; }
    }

    public class ProgramaDashboardCocinaDTO
    {
        [JsonPropertyName("total_comedor")]
        [JsonProperty("total_comedor")]
        public int TotalComedor { get; set; }

        [JsonPropertyName("sin_restricciones")]
        [JsonProperty("sin_restricciones")]
        public int SinRestricciones { get; set; }

        [JsonPropertyName("con_restricciones")]
        [JsonProperty("con_restricciones")]
        public int ConRestricciones { get; set; }

        [JsonPropertyName("alertas_altas")]
        [JsonProperty("alertas_altas")]
        public int AlertasAltas { get; set; }

        [JsonPropertyName("totales_por_restriccion")]
        [JsonProperty("totales_por_restriccion")]
        public List<ProgramaDashboardTotalRestriccionDTO> TotalesPorRestriccion { get; set; } = new();
    }

    public class ProgramaDashboardTotalRestriccionDTO
    {
        [JsonPropertyName("codigo")]
        [JsonProperty("codigo")]
        public string Codigo { get; set; } = "";

        [JsonPropertyName("texto")]
        [JsonProperty("texto")]
        public string Texto { get; set; } = "";

        [JsonPropertyName("cantidad")]
        [JsonProperty("cantidad")]
        public int Cantidad { get; set; }

        [JsonPropertyName("alerta_visual")]
        [JsonProperty("alerta_visual")]
        public bool AlertaVisual { get; set; }
    }

    public class ProgramaDashboardTransporteDTO
    {
        [JsonPropertyName("total_transporte")]
        [JsonProperty("total_transporte")]
        public int TotalTransporte { get; set; }

        [JsonPropertyName("por_servicio")]
        [JsonProperty("por_servicio")]
        public List<ProgramaDashboardServicioCountDTO> PorServicio { get; set; } = new();
    }

    public class ProgramaDashboardServicioCountDTO
    {
        [JsonPropertyName("codigo")]
        [JsonProperty("codigo")]
        public string Codigo { get; set; } = "";

        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = "";

        [JsonPropertyName("cantidad")]
        [JsonProperty("cantidad")]
        public int Cantidad { get; set; }
    }

    public class ProgramaDashboardSaludDTO
    {
        [JsonPropertyName("participantes_con_alerta")]
        [JsonProperty("participantes_con_alerta")]
        public int ParticipantesConAlerta { get; set; }

        [JsonPropertyName("acciones_hoy")]
        [JsonProperty("acciones_hoy")]
        public int AccionesHoy { get; set; }

        [JsonPropertyName("seguimientos_pendientes")]
        [JsonProperty("seguimientos_pendientes")]
        public int SeguimientosPendientes { get; set; }

        [JsonPropertyName("medicaciones")]
        [JsonProperty("medicaciones")]
        public int Medicaciones { get; set; }
    }

    public class ProgramaDashboardRetirosDTO
    {
        [JsonPropertyName("retiros_registrados")]
        [JsonProperty("retiros_registrados")]
        public int RetirosRegistrados { get; set; }

        [JsonPropertyName("ultimos_retiros")]
        [JsonProperty("ultimos_retiros")]
        public List<ProgramaDashboardRetiroItemDTO> UltimosRetiros { get; set; } = new();
    }

    public class ProgramaDashboardRetiroItemDTO
    {
        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public string Participante { get; set; } = "";

        [JsonPropertyName("retirado_por")]
        [JsonProperty("retirado_por")]
        public string RetiradoPor { get; set; } = "";

        [JsonPropertyName("fecha_retiro")]
        [JsonProperty("fecha_retiro")]
        public DateTimeOffset FechaRetiro { get; set; }
    }
}