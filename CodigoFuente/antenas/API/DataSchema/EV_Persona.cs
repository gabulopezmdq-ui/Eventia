using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rsAPIElevador.DataSchema
{
    public class EV_Persona
    {
        public virtual int IdPersona { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public int NroLegajo { get; set; }
        public string Email { get; set; }
        public bool? Activo { get; set; }
    }
}
