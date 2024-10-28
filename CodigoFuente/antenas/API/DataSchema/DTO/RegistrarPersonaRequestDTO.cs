using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class RegistrarPersonaRequestDTO
    {
        public string DNI { get; set; }
        public string Legajo { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }

    }
}
