using System.Collections.Generic;

namespace API.DataSchema.DTO.Invitados
{
    public class InvitadosGruposResponseDTO
    {
        public long IdEvento { get; set; }
        public List<InvitadoGrupoDTO> Items { get; set; } = new();
    }

    public class InvitadoGrupoDTO
    {
        public long IdRsvpGrupo { get; set; }
        public string? NombreGrupo { get; set; }

        public string Titular { get; set; }
        public string? EmailTitular { get; set; }
        public string? CelularTitular { get; set; }

        public string? RsvpMensaje { get; set; }

        public int CantidadIntegrantes { get; set; }

        public int Confirmados { get; set; }
        public int Pendientes { get; set; }
        public int Rechazados { get; set; }

        public string RsvpEstadoGrupo { get; set; }

        public List<InvitadoGrupoIntegranteDTO> Integrantes { get; set; } = new();
    }

    public class InvitadoGrupoIntegranteDTO
    {
        public long IdInvitado { get; set; }

        public string NombreCompleto { get; set; }

        public bool EsTitularGrupo { get; set; }

        public string RsvpEstado { get; set; }

        public bool CheckinRealizado { get; set; }
    }
}