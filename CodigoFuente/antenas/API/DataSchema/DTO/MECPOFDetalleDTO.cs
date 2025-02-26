using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class MECPOFDetalleDTO
    {
        public int IdPOF { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdPersona { get; set; }
        public string Secuencia { get; set; }
        public string Barra { get; set; }
        public string TipoCargo { get; set; }
        public string Vigente { get; set; }

        // Datos de Persona
        public string PersonaDNI { get; set; }
        public string PersonaApellido { get; set; }
        public string PersonaNombre { get; set; }

        // Datos de MEC_Mecanizadas
        public string MecanizadaAnioAfeccion { get; set; }
        public string MecanizadaMesAfeccion { get; set; }
        public string MecanizadaCodigoLiquidacion { get; set; }
        public string MecanizadaOrigen { get; set; }
    }
}
