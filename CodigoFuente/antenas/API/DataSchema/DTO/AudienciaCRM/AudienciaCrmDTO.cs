using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.AudienciaCRM
{
    public class AudienciaCrmListItemDTO
    {
        [JsonPropertyName("id_audiencia_persona")]
        [JsonProperty("id_audiencia_persona")]
        public long IdAudienciaPersona { get; set; }

        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = "";

        [JsonPropertyName("apellido")]
        [JsonProperty("apellido")]
        public string Apellido { get; set; } = "";

        [JsonPropertyName("email")]
        [JsonProperty("email")]
        public string? Email { get; set; }

        [JsonPropertyName("celular")]
        [JsonProperty("celular")]
        public string? Celular { get; set; }

        [JsonPropertyName("tipo_persona")]
        [JsonProperty("tipo_persona")]
        public string TipoPersona { get; set; } = "SIN_CLASIFICAR";

        [JsonPropertyName("tipo_label")]
        [JsonProperty("tipo_label")]
        public string TipoLabel { get; set; } = "Sin clasificar";

        [JsonPropertyName("contexto")]
        [JsonProperty("contexto")]
        public string? Contexto { get; set; }

        [JsonPropertyName("id_evento_contexto")]
        [JsonProperty("id_evento_contexto")]
        public long? IdEventoContexto { get; set; }

        [JsonPropertyName("ultima_participacion")]
        [JsonProperty("ultima_participacion")]
        public DateTimeOffset? UltimaParticipacion { get; set; }

        [JsonPropertyName("eventos_registrados")]
        [JsonProperty("eventos_registrados")]
        public int EventosRegistrados { get; set; }

        [JsonPropertyName("eventos_asistidos")]
        [JsonProperty("eventos_asistidos")]
        public int EventosAsistidos { get; set; }

        [JsonPropertyName("alertas")]
        [JsonProperty("alertas")]
        public List<string> Alertas { get; set; } = new();

        [JsonPropertyName("tags")]
        [JsonProperty("tags")]
        public List<string> Tags { get; set; } = new();
    }

    public class AudienciaCrmDetalleDTO
    {
        [JsonPropertyName("id_audiencia_persona")]
        [JsonProperty("id_audiencia_persona")]
        public long IdAudienciaPersona { get; set; }

        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = "";

        [JsonPropertyName("apellido")]
        [JsonProperty("apellido")]
        public string Apellido { get; set; } = "";

        [JsonPropertyName("email")]
        [JsonProperty("email")]
        public string? Email { get; set; }

        [JsonPropertyName("celular")]
        [JsonProperty("celular")]
        public string? Celular { get; set; }

        [JsonPropertyName("fecha_nacimiento")]
        [JsonProperty("fecha_nacimiento")]
        public DateTime? FechaNacimiento { get; set; }

        [JsonPropertyName("edad")]
        [JsonProperty("edad")]
        public int? Edad { get; set; }

        [JsonPropertyName("tipo_persona")]
        [JsonProperty("tipo_persona")]
        public string TipoPersona { get; set; } = "SIN_CLASIFICAR";

        [JsonPropertyName("tipo_label")]
        [JsonProperty("tipo_label")]
        public string TipoLabel { get; set; } = "Sin clasificar";

        [JsonPropertyName("alertas")]
        [JsonProperty("alertas")]
        public List<string> Alertas { get; set; } = new();

        [JsonPropertyName("tags")]
        [JsonProperty("tags")]
        public List<string> Tags { get; set; } = new();

        [JsonPropertyName("historial")]
        [JsonProperty("historial")]
        public List<AudienciaCrmHistorialDTO> Historial { get; set; } = new();

        [JsonPropertyName("programa")]
        [JsonProperty("programa")]
        public AudienciaCrmProgramaDetalleDTO? Programa { get; set; }
    }

    public class AudienciaCrmHistorialDTO
    {
        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("evento")]
        [JsonProperty("evento")]
        public string Evento { get; set; } = "";

        [JsonPropertyName("tipo_operacion")]
        [JsonProperty("tipo_operacion")]
        public string TipoOperacion { get; set; } = "";

        [JsonPropertyName("origen_registro")]
        [JsonProperty("origen_registro")]
        public string? OrigenRegistro { get; set; }

        [JsonPropertyName("fecha_registro")]
        [JsonProperty("fecha_registro")]
        public DateTimeOffset FechaRegistro { get; set; }

        [JsonPropertyName("asistio")]
        [JsonProperty("asistio")]
        public bool Asistio { get; set; }

        [JsonPropertyName("beneficio_otorgado")]
        [JsonProperty("beneficio_otorgado")]
        public bool BeneficioOtorgado { get; set; }

        [JsonPropertyName("beneficio_canjeado")]
        [JsonProperty("beneficio_canjeado")]
        public bool BeneficioCanjeado { get; set; }
    }

    public class AudienciaCrmProgramaDetalleDTO
    {
        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("evento")]
        [JsonProperty("evento")]
        public string Evento { get; set; } = "";

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long? IdInscripcion { get; set; }

        [JsonPropertyName("id_rsvp_grupo")]
        [JsonProperty("id_rsvp_grupo")]
        public long? IdRsvpGrupo { get; set; }

        [JsonPropertyName("nombre_grupo")]
        [JsonProperty("nombre_grupo")]
        public string? NombreGrupo { get; set; }

        [JsonPropertyName("responsable")]
        [JsonProperty("responsable")]
        public AudienciaCrmResponsableDTO? Responsable { get; set; }

        [JsonPropertyName("participantes_grupo")]
        [JsonProperty("participantes_grupo")]
        public List<AudienciaCrmParticipanteGrupoDTO> ParticipantesGrupo { get; set; } = new();

        [JsonPropertyName("periodos")]
        [JsonProperty("periodos")]
        public List<AudienciaCrmPeriodoDTO> Periodos { get; set; } = new();

        [JsonPropertyName("servicios")]
        [JsonProperty("servicios")]
        public List<AudienciaCrmServicioDTO> Servicios { get; set; } = new();

        [JsonPropertyName("restricciones")]
        [JsonProperty("restricciones")]
        public List<AudienciaCrmRestriccionDTO> Restricciones { get; set; } = new();

        [JsonPropertyName("salud")]
        [JsonProperty("salud")]
        public AudienciaCrmSaludDTO? Salud { get; set; }

        [JsonPropertyName("autorizados_retiro")]
        [JsonProperty("autorizados_retiro")]
        public List<AudienciaCrmAutorizadoRetiroDTO> AutorizadosRetiro { get; set; } = new();
    }

    public class AudienciaCrmResponsableDTO
    {
        public long? IdAudienciaPersona { get; set; }
        public string NombreCompleto { get; set; } = "";
        public string? Email { get; set; }
        public string? Telefono { get; set; }
        public string? Relacion { get; set; }
    }

    public class AudienciaCrmParticipanteGrupoDTO
    {
        public long IdAudienciaPersona { get; set; }
        public long IdInvitado { get; set; }
        public long IdRsvpGrupoIntegrante { get; set; }
        public string NombreCompleto { get; set; } = "";
        public int? Edad { get; set; }
    }

    public class AudienciaCrmPeriodoDTO
    {
        public string Nombre { get; set; } = "";
        public DateOnly FechaDesde { get; set; }
        public DateOnly FechaHasta { get; set; }
        public decimal PrecioBase { get; set; }
        public string Moneda { get; set; } = "EUR";
    }

    public class AudienciaCrmServicioDTO
    {
        public string Nombre { get; set; } = "";
        public string Codigo { get; set; } = "";
        public string TipoCalculo { get; set; } = "";
        public decimal Precio { get; set; }
        public decimal Subtotal { get; set; }
        public string Moneda { get; set; } = "EUR";
        public List<DateOnly> Fechas { get; set; } = new();
    }

    public class AudienciaCrmRestriccionDTO
    {
        public long IdRestriccionAlim { get; set; }
        public string Codigo { get; set; } = "";
        public string Categoria { get; set; } = "";
        public string? IconKey { get; set; }
        public bool RequiereAlertaVisual { get; set; }
        public bool RequiereConfirmacionOrganizador { get; set; }
        public bool EsAlergeno { get; set; }
        public string? Observaciones { get; set; }
        public string? Severidad { get; set; }
    }

    public class AudienciaCrmSaludDTO
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

    public class AudienciaCrmAutorizadoRetiroDTO
    {
        public string NombreAutorizado { get; set; } = "";
        public string? TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }
        public string? Observaciones { get; set; }
    }
}
