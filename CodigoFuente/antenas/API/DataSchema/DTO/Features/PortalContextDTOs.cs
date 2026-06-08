using System.Collections.Generic;

namespace API.DataSchema.DTO.Features
{
    public class PortalContextDTO
    {
        public string TokenConsulta { get; set; } = string.Empty;
        public string TipoPortal { get; set; } = string.Empty; // EVENTO / PROGRAMA

        public long IdEvento { get; set; }

        public long? IdInvitado { get; set; }
        public long? IdAcceso { get; set; }
        public long? IdRsvpGrupo { get; set; }

        public long? IdInscripcion { get; set; }

        public string? UsuarioNombre { get; set; }
        public string? UsuarioEmail { get; set; }

        public bool EsPrograma => TipoPortal == "PROGRAMA";
        public bool EsEvento => TipoPortal == "EVENTO";
    }

    public class EventoPortalFullDTO
    {
        public string token_consulta { get; set; } = string.Empty;
        public string tipo_portal { get; set; } = string.Empty;
        public long id_evento { get; set; }

        public long? id_invitado { get; set; }
        public long? id_acceso { get; set; }
        public long? id_rsvp_grupo { get; set; }
        public long? id_inscripcion { get; set; }

        public List<EventoPortalConfigSeccionDTO> secciones { get; set; } = new List<EventoPortalConfigSeccionDTO>();

        public Dictionary<string, object?> data { get; set; } = new Dictionary<string, object?>();
    }

    public class EventoPortalConfigSeccionDTO
    {
        public short id_portal_seccion { get; set; }
        public string codigo { get; set; } = string.Empty;
        public string titulo { get; set; } = string.Empty;
        public short orden { get; set; }
        public bool visible { get; set; }
        public string? requiere_feature_codigo { get; set; }
        public string? config_json { get; set; }
    }
}