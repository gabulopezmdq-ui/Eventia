using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DataSchema
{
    public class Usuario
    {
        public virtual int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
        public bool? Activo { get; set; }
    }
}
