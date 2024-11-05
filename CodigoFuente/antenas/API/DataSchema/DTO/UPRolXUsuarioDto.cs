using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class UPRolXUsuarioDto
    {
        public int IdUsuario { get; set; }
        public List<int> IdRoles { get; set; } = new List<int>();
    }
}
