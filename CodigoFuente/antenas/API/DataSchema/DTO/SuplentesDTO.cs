using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class SuplentesDTO
    {
        public string DNI { get; set; }
        public string Apellido { get; set; }
        public string Nombre { get; set; }
        public int? IdCabecera { get; set; }

        // Datos del POF
        public string Secuencia { get; set; }
        public string Funcion { get; set; }
        public string CarRevista { get; set; }
        public string Cargo { get; set; } // Asumo que esto viene de TipoCargo

        // Datos de suplencia
        public DateTime? SupleDesde { get; set; }
        public DateTime? SupleHasta { get; set; }
        public int? SupleA { get; set; } // Información de la persona suplantada
        public string SupleASecuencia { get; set; }
        public string SupleAApellido { get; set; }
        public string SupleANombre { get; set; }

        // Datos de la mecanizada (opcionales según necesites)
        public decimal? Importe { get; set; }
        public string CodigoLiquidacion { get; set; }


    }

}