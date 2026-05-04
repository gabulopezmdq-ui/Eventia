using System;

namespace API.DataSchema.DTO
{
    public class EventoStaffDTO
    {
        public long IdEventoUsuario { get; set; }
        public long IdEvento { get; set; }
        public long? IdUsuario { get; set; }
        public long? IdStaff { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string Email { get; set; } = null!;
        public short IdRol { get; set; }
        public string? CodigoRol { get; set; }
        public bool Activo { get; set; }
        public DateTimeOffset FechaAlta { get; set; }
        public bool EsInvitacion { get; set; }
        public bool EsPersonalCuenta => IdStaff.HasValue;
        public string? CodigoAcceso { get; set; }
    }

    public class AddEventoStaffRequest
    {
        public string? Email { get; set; }
        public long? IdStaff { get; set; }
        public short IdRol { get; set; }
        public string? Nombre { get; set; } 
        public string? Apellido { get; set; } 
    }

    public class UpdateEventoStaffRequest
    {
        public short IdRol { get; set; }
        public bool Activo { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Email { get; set; }
    }
}
