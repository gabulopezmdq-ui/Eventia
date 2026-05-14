using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Invitados
{
    public class InvitadosPersonasResponseDTO
    {
        public long IdEvento { get; set; }
        public InvitadosPersonasResumenDTO Resumen { get; set; } = new InvitadosPersonasResumenDTO();
        public List<InvitadoPersonaDTO> Items { get; set; } = new List<InvitadoPersonaDTO>();
    }

    public class InvitadosPersonasResumenDTO
    {
        public int TotalPersonas { get; set; }
        public int Confirmados { get; set; }
        public int Pendientes { get; set; }
        public int Rechazados { get; set; }
        public int Ingresaron { get; set; }
        public int ConRestricciones { get; set; }
    }

    public class InvitadoPersonaDTO
    {
        public long IdInvitado { get; set; }
        public long IdEvento { get; set; }
        public long? IdAcceso { get; set; }
        public string? AccesoNombre { get; set; }

        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string NombreCompleto { get; set; }

        public string? Email { get; set; }
        public string? Celular { get; set; }

        public string RsvpEstado { get; set; }
        public DateTimeOffset? FechaRsvp { get; set; }
        public string? RsvpMensaje { get; set; }

        public long? IdRsvpGrupo { get; set; }
        public bool EsTitularGrupo { get; set; }
        public string? GrupoTitular { get; set; }
        public int CantidadIntegrantesGrupo { get; set; }

        public string? QrToken { get; set; }
        public bool TieneQr { get; set; }

        public bool CheckinRealizado { get; set; }
        public DateTimeOffset? FechaCheckin { get; set; }

        public long? IdMesa { get; set; }
        public string? MesaNombre { get; set; }

        public bool TieneRestricciones { get; set; }
        public List<string> Restricciones { get; set; } = new List<string>();

        public int CantidadSugerenciasMusica { get; set; }
    }
}