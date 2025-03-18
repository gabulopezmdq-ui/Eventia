using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class POFDetalleRequestDTO
    {
        public int IdPOF { get; set; }
        public int SupleA { get; set; }
        public DateTime SupleDesde { get; set; }
        public DateTime SupleHasta { get; set; }
        public int IdCabecera { get; set; }
    }
}

