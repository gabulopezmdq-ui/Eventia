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

    public class POFBarraDTO
    {
        public int IdPOF { get; set; }
        public List<int> Barra { get; set; }
    }

    public class POFBarraResultado
    {
        public List<int> BarrasAgregadas { get; set; } = new();
        public List<int> BarrasDuplicadas { get; set; } = new();
    }
}
