using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaRetiroValidarQrRequest
    {
        public string QrToken { get; set; } = null!;
        public DateOnly? FechaOperativa { get; set; }
    }

    public class ProgramaRetiroRegistrarRequest
    {
        public string QrToken { get; set; } = null!;
        public DateOnly? FechaOperativa { get; set; }
        public List<long> IdsInvitadosNinos { get; set; } = new();
        public string? Observaciones { get; set; }
    }

    public class ProgramaRetiroValidarQrResponse
    {
        public bool Valido { get; set; }
        public string Mensaje { get; set; } = "";
        public long IdEvento { get; set; }

        public string NombreAutorizado { get; set; } = "";
        public string? TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }

        public string QrToken { get; set; } = "";

        public List<ProgramaRetiroParticipanteDTO> ParticipantesAutorizados { get; set; } = new();
    }

    public class ProgramaRetiroParticipanteDTO
    {
        public long IdInvitado { get; set; }
        public long IdAutorizacion { get; set; }
        public string NombreCompleto { get; set; } = "";
        public bool YaRetiradoHoy { get; set; }
        public DateTimeOffset? FechaRetiro { get; set; }
    }

    public class ProgramaRetiroRegistrarResponse
    {
        public bool Ok { get; set; }
        public string Mensaje { get; set; } = "";
        public DateOnly FechaOperativa { get; set; }
        public List<ProgramaRetiroRegistradoDTO> Retiros { get; set; } = new();
    }

    public class ProgramaRetiroRegistradoDTO
    {
        public long IdRetiro { get; set; }
        public long IdInvitado { get; set; }
        public string Participante { get; set; } = "";
        public string NombreRetirador { get; set; } = "";
        public DateTimeOffset FechaRetiro { get; set; }
    }

    public class ProgramaRetirosDiaDTO
    {
        public long IdEvento { get; set; }
        public DateOnly Fecha { get; set; }
        public int TotalRetiros { get; set; }
        public List<ProgramaRetiroDiaItemDTO> Items { get; set; } = new();
    }

    public class ProgramaRetiroDiaItemDTO
    {
        public long IdRetiro { get; set; }
        public long IdInvitado { get; set; }
        public string Participante { get; set; } = "";
        public string NombreRetirador { get; set; } = "";
        public string? TelefonoRetirador { get; set; }
        public string MetodoValidacion { get; set; } = "";
        public string? Observaciones { get; set; }
        public DateTimeOffset FechaRetiro { get; set; }
    }
}