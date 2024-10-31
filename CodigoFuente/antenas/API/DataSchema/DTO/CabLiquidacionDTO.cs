using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class POFRequestDTO
    {
        public PersonaRequest Persona { get; set; }
        public int IdEstablecimiento { get; set; }
    }

    public class PersonaRequest
    {
        public string DNI { get; set; }
        public string Legajo { get; set; }
    }
}
