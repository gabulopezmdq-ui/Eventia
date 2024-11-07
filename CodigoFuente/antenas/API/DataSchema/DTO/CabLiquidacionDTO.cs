using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class CabLiquidacionDTO
    {
        public int IdCabecera { get; set; }
        public int IdTipoLiquidacion { get; set; }
        public string MesLiquidacion { get; set; }
        public string AnioLiquidacion { get; set; }
        public int IdUsuario { get; set; }
        public string Observaciones { get; set; }
        public DateTime InicioLiquidacion { get; set; }
        public DateTime FinLiquidacion { get; set; }
        public string Estado { get; set; }
        public string Vigente { get; set; }
    }
}
