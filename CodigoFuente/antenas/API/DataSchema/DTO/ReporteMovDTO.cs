using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class ReporteMovDTO
    {
        //Establecimiento
        public int IdEstablecimiento { get; set; }
        public string NroDiegep { get; set; }
        public int IdTipoEstablecimiento { get; set; }
        public string NroEstablecimiento { get; set; }
        public string NombreMgp { get; set; }
        public string NombrePcia { get; set; }
        public string Ruralidad { get; set; }
        public string Subvencion { get; set; }

        //Docente
        public string NumDoc { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }
        public string SitRevista { get; set; }
        public string Turno { get; set; }
        public string? Observaciones { get; set; }
        public int? AntigAnios { get; set; }
        public int? AntigMeses { get; set; }
        public int Horas { get; set; }


    }
}
