using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaSaludPanelItemDTO
    {
        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("id_invitado")]
        [JsonProperty("id_invitado")]
        public long IdInvitado { get; set; }

        [JsonPropertyName("id_rsvp_grupo_integrante")]
        [JsonProperty("id_rsvp_grupo_integrante")]
        public long IdRsvpGrupoIntegrante { get; set; }

        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public string Participante { get; set; } = "";

        [JsonPropertyName("responsable")]
        [JsonProperty("responsable")]
        public string Responsable { get; set; } = "";

        [JsonPropertyName("telefono_responsable")]
        [JsonProperty("telefono_responsable")]
        public string? TelefonoResponsable { get; set; }

        [JsonPropertyName("email_responsable")]
        [JsonProperty("email_responsable")]
        public string? EmailResponsable { get; set; }

        [JsonPropertyName("tiene_problema_medico")]
        [JsonProperty("tiene_problema_medico")]
        public bool TieneProblemaMedico { get; set; }

        [JsonPropertyName("problema_medico_detalle")]
        [JsonProperty("problema_medico_detalle")]
        public string? ProblemaMedicoDetalle { get; set; }

        [JsonPropertyName("tiene_alergias_no_alimentarias")]
        [JsonProperty("tiene_alergias_no_alimentarias")]
        public bool TieneAlergiasNoAlimentarias { get; set; }

        [JsonPropertyName("alergias_no_alimentarias_detalle")]
        [JsonProperty("alergias_no_alimentarias_detalle")]
        public string? AlergiasNoAlimentariasDetalle { get; set; }

        [JsonPropertyName("tiene_necesidad_especial")]
        [JsonProperty("tiene_necesidad_especial")]
        public bool TieneNecesidadEspecial { get; set; }

        [JsonPropertyName("necesidad_especial_detalle")]
        [JsonProperty("necesidad_especial_detalle")]
        public string? NecesidadEspecialDetalle { get; set; }

        [JsonPropertyName("tiene_restricciones_alimentarias")]
        [JsonProperty("tiene_restricciones_alimentarias")]
        public bool TieneRestriccionesAlimentarias { get; set; }

        [JsonPropertyName("restricciones_alimentarias")]
        [JsonProperty("restricciones_alimentarias")]
        public List<string> RestriccionesAlimentarias { get; set; } = new();

        [JsonPropertyName("tiene_medicacion")]
        [JsonProperty("tiene_medicacion")]
        public bool TieneMedicacion { get; set; }

        [JsonPropertyName("medicaciones")]
        [JsonProperty("medicaciones")]
        public List<string> Medicaciones { get; set; } = new();

        [JsonPropertyName("contacto_emergencia")]
        [JsonProperty("contacto_emergencia")]
        public string? ContactoEmergencia { get; set; }

        [JsonPropertyName("telefono_emergencia")]
        [JsonProperty("telefono_emergencia")]
        public string? TelefonoEmergencia { get; set; }

        [JsonPropertyName("autoriza_emergencia_medica")]
        [JsonProperty("autoriza_emergencia_medica")]
        public bool AutorizaEmergenciaMedica { get; set; }

        [JsonPropertyName("observaciones_familia")]
        [JsonProperty("observaciones_familia")]
        public string? ObservacionesFamilia { get; set; }

        [JsonPropertyName("acciones_salud_count")]
        [JsonProperty("acciones_salud_count")]
        public int AccionesSaludCount { get; set; }

        [JsonPropertyName("requiere_seguimiento")]
        [JsonProperty("requiere_seguimiento")]
        public bool RequiereSeguimiento { get; set; }

        [JsonPropertyName("alerta_visual")]
        [JsonProperty("alerta_visual")]
        public bool AlertaVisual { get; set; }

        [JsonPropertyName("nivel_alerta")]
        [JsonProperty("nivel_alerta")]
        public string NivelAlerta { get; set; } = "NINGUNA";
    }

    public class ProgramaSaludDetalleParticipanteDTO
    {
        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("id_invitado")]
        [JsonProperty("id_invitado")]
        public long IdInvitado { get; set; }

        [JsonPropertyName("id_rsvp_grupo_integrante")]
        [JsonProperty("id_rsvp_grupo_integrante")]
        public long IdRsvpGrupoIntegrante { get; set; }

        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public string Participante { get; set; } = "";

        [JsonPropertyName("responsable")]
        [JsonProperty("responsable")]
        public string Responsable { get; set; } = "";

        [JsonPropertyName("telefono_responsable")]
        [JsonProperty("telefono_responsable")]
        public string? TelefonoResponsable { get; set; }

        [JsonPropertyName("email_responsable")]
        [JsonProperty("email_responsable")]
        public string? EmailResponsable { get; set; }

        [JsonPropertyName("ficha")]
        [JsonProperty("ficha")]
        public ProgramaSaludFichaDTO? Ficha { get; set; }

        [JsonPropertyName("medicaciones")]
        [JsonProperty("medicaciones")]
        public List<ProgramaSaludMedicacionDTO> Medicaciones { get; set; } = new();

        [JsonPropertyName("acciones")]
        [JsonProperty("acciones")]
        public List<ProgramaSaludAccionDTO> Acciones { get; set; } = new();

        [JsonPropertyName("restricciones_alimentarias")]
        [JsonProperty("restricciones_alimentarias")]
        public List<string> RestriccionesAlimentarias { get; set; } = new();
    }

    public class ProgramaSaludRegistrarAccionRequest
    {
        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("id_participante")]
        [JsonProperty("id_participante")]
        public long IdParticipante { get; set; }

        [JsonPropertyName("fecha_hora")]
        [JsonProperty("fecha_hora")]
        public DateTimeOffset? FechaHora { get; set; }

        [JsonPropertyName("tipo_accion")]
        [JsonProperty("tipo_accion")]
        public string TipoAccion { get; set; } = "";

        [JsonPropertyName("descripcion")]
        [JsonProperty("descripcion")]
        public string Descripcion { get; set; } = "";

        [JsonPropertyName("requirio_contacto_familia")]
        [JsonProperty("requirio_contacto_familia")]
        public bool RequirioContactoFamilia { get; set; }

        [JsonPropertyName("contacto_realizado")]
        [JsonProperty("contacto_realizado")]
        public bool ContactoRealizado { get; set; }

        [JsonPropertyName("requiere_seguimiento")]
        [JsonProperty("requiere_seguimiento")]
        public bool RequiereSeguimiento { get; set; }
    }
}
