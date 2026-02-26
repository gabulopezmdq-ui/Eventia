using System;

namespace API.DataSchema.DTO
{
    public class AutorizacionCreateDTO
    {
        public long IdInvitadoObjetivo { get; set; }     // el niño (o persona objetivo)
        public string Tipo { get; set; } = "R";          // R/C/O
        public string NombreAutorizado { get; set; } = null!;
        public string? TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }
        public string? Observaciones { get; set; }
    }
}
