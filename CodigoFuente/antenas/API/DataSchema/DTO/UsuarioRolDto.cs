using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class UsuarioConRolesDetalleDto
    {
        public int IdUsuario { get; set; }
        public string NombreUsuario { get; set; }
        public string Email { get; set; }
        public bool Activo { get; set; }
        public List<RolDetalleDto> Roles { get; set; }
    }

    public class RolDetalleDto
    {
        public int IdRol { get; set; }
        public string NombreRol { get; set; }
        public string Vigente { get; set; }
    }

    public class UsuarioRolDto
    {
        public List<UsuarioConRolesDetalleDto> UsuariosConRolesDetalle { get; set; }
    }

    public class RolXUsuarioDto
    {
        public int IdUsuario { get; set; }
        public int IdRol { get; set; }
    }

    public class UPRolXUsuarioDto
    {
        public int IdUsuario { get; set; }
        public List<int> IdRoles { get; set; } = new List<int>();
    }
}
