using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

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
}