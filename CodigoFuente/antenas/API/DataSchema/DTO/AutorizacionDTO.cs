using System;

namespace API.DataSchema.DTO
{
    public class AutorizacionDTO
    {
        public long IdAutorizacion { get; set; }
        public long IdEvento { get; set; }
        public long IdInvitadoObjetivo { get; set; }
        public string Tipo { get; set; } = null!;
        public string NombreAutorizado { get; set; } = null!;
        public string? TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }
        public string? Observaciones { get; set; }
        public bool Activo { get; set; }
    }

    public class AutorizacionUpdateDTO
    {
        public string? NombreAutorizado { get; set; }
        public string? TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }
        public string? Observaciones { get; set; }
        public bool? Activo { get; set; }
    }

    public class AutorizacionFromPersonalLinkDTO
    {
        public string NombreAutorizado { get; set; } 
        public string TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }
    }

}
