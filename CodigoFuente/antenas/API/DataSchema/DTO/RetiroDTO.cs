using System;

namespace API.DataSchema.DTO
{
    public class RetiroConfirmRequestDTO
    {
        public string NombreRetirador { get; set; } = null!;
        public string? CelularRetirador { get; set; }      // lo normalizás a E.164
        public long? IdAutorizacion { get; set; }          // si elegís uno de la lista
        public string MetodoValidacion { get; set; } = "A"; // A/M/O
        public string? Observaciones { get; set; }
        public string qrToken { get; set; }

    }

    public class RetiroConfirmResponseDTO
    {
        public long IdRetiro { get; set; }
        public long IdEvento { get; set; }
        public long IdInvitadoNino { get; set; }
        public DateTimeOffset FechaRetiro { get; set; }
    }

    public class UltimoRetiroDTO
    {
        public long IdRetiro { get; set; }
        public DateTimeOffset FechaRetiro { get; set; }
        public string NombreRetirador { get; set; } = null!;
        public string? CelularRetirador { get; set; }
        public string MetodoValidacion { get; set; } = null!;
    }

    public class RetiroListItemDTO
    {
        public long IdRetiro { get; set; }
        public DateTimeOffset FechaRetiro { get; set; }
        public long IdInvitadoNino { get; set; }
        public string NinoNombre { get; set; } = null!;
        public string NinoApellido { get; set; } = null!;
        public string NombreRetirador { get; set; } = null!;
        public string? CelularRetirador { get; set; }
        public string MetodoValidacion { get; set; } = null!;
    }

    public class PendienteRetiroDTO
    {
        public long IdInvitadoNino { get; set; }
        public string NinoNombre { get; set; } = null!;
        public string NinoApellido { get; set; } = null!;
        public string? QrToken { get; set; }

        public long? IdRsvpGrupo { get; set; }
        public string? ResponsableNombre { get; set; }
        public string? ResponsableApellido { get; set; }
        public string? ResponsableCelular { get; set; } // <- viene de ef_invitados.celular

        public int CantAutorizadosRetiro { get; set; }
    }
}
