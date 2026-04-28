using System;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaStaffDTO
    {
        public long IdEventoUsuario { get; set; }
        public long IdEvento { get; set; }
        public long IdUsuario { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string Email { get; set; } = null!;
        public short IdRol { get; set; }
        public string CodigoRol { get; set; } = null!;
        public bool Activo { get; set; }
        public DateTimeOffset FechaAlta { get; set; }
    }

    public class AddProgramaStaffRequest
    {
        public string Email { get; set; } = null!;
        public short IdRol { get; set; }
    }
    
    public class UpdateProgramaStaffRequest
    {
        public short IdRol { get; set; }
        public bool Activo { get; set; }
    }
}
