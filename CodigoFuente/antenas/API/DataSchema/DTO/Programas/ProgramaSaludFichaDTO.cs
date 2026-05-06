using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaSaludFichaDTO
    {
        [JsonPropertyName("id_invitado")]
        [JsonProperty("id_invitado")]
        public long? IdInvitado { get; set; }

        [JsonPropertyName("id_ficha_salud")]
        [JsonProperty("id_ficha_salud")]
        public long? IdFichaSalud { get; set; }

        [JsonPropertyName("id_evento")]
        [JsonProperty("id_evento")]
        public long IdEvento { get; set; }

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("tiene_problema_medico")]
        [JsonProperty("tiene_problema_medico")]
        public bool TieneProblemaMedico { get; set; }

        [JsonPropertyName("detalle_problema_medico")]
        [JsonProperty("detalle_problema_medico")]
        public string? DetalleProblemaMedico { get; set; }

        [JsonPropertyName("tiene_alergias_no_alimentarias")]
        [JsonProperty("tiene_alergias_no_alimentarias")]
        public bool TieneAlergiasNoAlimentarias { get; set; }

        [JsonPropertyName("detalle_alergias_no_alimentarias")]
        [JsonProperty("detalle_alergias_no_alimentarias")]
        public string? DetalleAlergiasNoAlimentarias { get; set; }

        [JsonPropertyName("tiene_necesidad_especial")]
        [JsonProperty("tiene_necesidad_especial")]
        public bool TieneNecesidadEspecial { get; set; }

        [JsonPropertyName("detalle_necesidad_especial")]
        [JsonProperty("detalle_necesidad_especial")]
        public string? DetalleNecesidadEspecial { get; set; }

        [JsonPropertyName("tiene_cobertura_medica")]
        [JsonProperty("tiene_cobertura_medica")]
        public bool TieneCoberturaMedica { get; set; }

        [JsonPropertyName("cobertura_medica_nombre")]
        [JsonProperty("cobertura_medica_nombre")]
        public string? CoberturaMedicaNombre { get; set; }

        [JsonPropertyName("cobertura_medica_numero")]
        [JsonProperty("cobertura_medica_numero")]
        public string? CoberturaMedicaNumero { get; set; }

        [JsonPropertyName("contacto_emergencia_nombre")]
        [JsonProperty("contacto_emergencia_nombre")]
        public string? ContactoEmergenciaNombre { get; set; }

        [JsonPropertyName("contacto_emergencia_telefono")]
        [JsonProperty("contacto_emergencia_telefono")]
        public string? ContactoEmergenciaTelefono { get; set; }

        [JsonPropertyName("contacto_emergencia_relacion")]
        [JsonProperty("contacto_emergencia_relacion")]
        public string? ContactoEmergenciaRelacion { get; set; }

        [JsonPropertyName("autoriza_emergencia_medica")]
        [JsonProperty("autoriza_emergencia_medica")]
        public bool AutorizaEmergenciaMedica { get; set; }

        [JsonPropertyName("observaciones_familia")]
        [JsonProperty("observaciones_familia")]
        public string? ObservacionesFamilia { get; set; }

        [JsonPropertyName("observaciones_internas")]
        [JsonProperty("observaciones_internas")]
        public string? ObservacionesInternas { get; set; }

        [JsonPropertyName("activo")]
        [JsonProperty("activo")]
        public bool Activo { get; set; } = true;

        [JsonPropertyName("fecha_alta")]
        [JsonProperty("fecha_alta")]
        public DateTimeOffset? FechaAlta { get; set; }

        [JsonPropertyName("id_rsvp_grupo_integrante")]
        [JsonProperty("id_rsvp_grupo_integrante")]
        public long? IdRsvpGrupoIntegrante { get; set; }

        [JsonPropertyName("participante")]
        [JsonProperty("participante")]
        public string? Participante { get; set; }

        [JsonPropertyName("responsable")]
        [JsonProperty("responsable")]
        public string? Responsable { get; set; }

        [JsonPropertyName("telefono_responsable")]
        [JsonProperty("telefono_responsable")]
        public string? TelefonoResponsable { get; set; }

        [JsonPropertyName("contactos_emergencia")]
        [JsonProperty("contactos_emergencia")]
        public List<ProgramaSaludContactoEmergenciaDTO> ContactosEmergencia { get; set; } = new();

        [JsonPropertyName("medicaciones")]
        [JsonProperty("medicaciones")]
        public List<ProgramaSaludMedicacionFichaDTO> Medicaciones { get; set; } = new();
    }

    public class ProgramaSaludContactoEmergenciaDTO
    {
        [JsonPropertyName("nombre")]
        [JsonProperty("nombre")]
        public string Nombre { get; set; } = "";

        [JsonPropertyName("telefono")]
        [JsonProperty("telefono")]
        public string Telefono { get; set; } = "";

        [JsonPropertyName("relacion")]
        [JsonProperty("relacion")]
        public string? Relacion { get; set; }

        [JsonPropertyName("orden")]
        [JsonProperty("orden")]
        public int Orden { get; set; }
    }

    public class ProgramaSaludMedicacionFichaDTO
    {
        [JsonPropertyName("id_medicacion")]
        [JsonProperty("id_medicacion")]
        public long IdMedicacion { get; set; }

        [JsonPropertyName("nombre_medicacion")]
        [JsonProperty("nombre_medicacion")]
        public string NombreMedicacion { get; set; } = "";

        [JsonPropertyName("dosis")]
        [JsonProperty("dosis")]
        public string? Dosis { get; set; }

        [JsonPropertyName("frecuencia")]
        [JsonProperty("frecuencia")]
        public string? Frecuencia { get; set; }

        [JsonPropertyName("horario")]
        [JsonProperty("horario")]
        public string? Horario { get; set; }

        [JsonPropertyName("indicaciones")]
        [JsonProperty("indicaciones")]
        public string? Indicaciones { get; set; }

        [JsonPropertyName("requiere_autorizacion")]
        [JsonProperty("requiere_autorizacion")]
        public bool RequiereAutorizacion { get; set; }
    }
}