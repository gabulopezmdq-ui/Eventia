using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class QrScanResponseDTO
    {
        public long IdEvento { get; set; }
        public long IdInvitado { get; set; }

        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string RolEvento { get; set; } = null!;     // N/R/A
        public string RsvpEstado { get; set; } = null!;    // P/Y/N

        public long? IdRsvpGrupo { get; set; }
        public string? GrupoResumen { get; set; }          // opcional: "Tomy + Responsable"

        public List<AutorizacionDTO> AutorizadosRetiro { get; set; } = new();
    }
    public class QrScanRequestDTO
    {
        public string? DeviceId { get; set; }
    }

    public class QrScanResponseRetiroDTO
    {
        public long IdEvento { get; set; }
        public long IdInvitado { get; set; }

        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string RolEvento { get; set; } = null!;   // N/R/A
        public string RsvpEstado { get; set; } = null!;  // P/Y/N

        public long? IdRsvpGrupo { get; set; }
        public string? GrupoResumen { get; set; }

        public bool YaRetirado { get; set; }
        public UltimoRetiroDTO? UltimoRetiro { get; set; }

        public List<AutorizacionDTO> AutorizadosRetiro { get; set; } = new();
    }

    public class ScanListItemDTO
    {
        public long IdQrScan { get; set; }
        public DateTimeOffset FechaScan { get; set; }
        public string QrToken { get; set; } = null!;
        public string Resultado { get; set; } = null!;
        public string? Mensaje { get; set; }

        public long? IdInvitado { get; set; }
        public string? InvitadoNombre { get; set; }
        public string? InvitadoApellido { get; set; }

        public string? DeviceId { get; set; }
        public string? Ip { get; set; }
    }

    public class QrScanResultDTO
    {
        public long idInvitado { get; set; }

        public string nombre { get; set; } = null!;
        public string apellido { get; set; } = null!;

        public string rolEvento { get; set; } = null!; // R = Responsable, N = Niño, A = Adulto

        public bool yaRetirado { get; set; }

        public string? responsableNombre { get; set; }
        public string? responsableApellido { get; set; }
        public string? responsableCelular { get; set; }

        public string resultado { get; set; } = null!;
        public string mensaje { get; set; } = null!;
    }
}
