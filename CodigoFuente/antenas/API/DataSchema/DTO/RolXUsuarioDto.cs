using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class RolXUsuarioDto
    {
        public List<int> IdRoles { get; set; } = new List<int>();
        public int IdUsuario { get; set; }
    }
}
