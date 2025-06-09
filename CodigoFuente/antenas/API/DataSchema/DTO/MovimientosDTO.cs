using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
   public class SuplenteResultadoDTO
    {
        public string? Apellido { get; set; }
        public string? Nombre { get; set; }
        public bool SoloLectura { get; set; }
    }
}
