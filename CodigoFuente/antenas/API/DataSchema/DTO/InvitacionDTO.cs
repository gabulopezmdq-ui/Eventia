using System;

namespace API.DataSchema.DTO
{
    public class RsvpConfirmacionDTO
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string? Email { get; set; }
        public string? Celular { get; set; }
        public bool Asiste { get; set; }
        public string? Mensaje { get; set; }
    }
    public class RsvpConfirmacionRequest
    {
        public string Token { get; set; } = null!;
        public RsvpConfirmacionDTO Datos { get; set; } = null!;
    }

    public class GenerarLinkRequest
    {
        public long IdEvento { get; set; }
    }

}
