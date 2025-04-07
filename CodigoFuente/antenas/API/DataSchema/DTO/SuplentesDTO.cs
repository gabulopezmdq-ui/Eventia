using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class SuplentesDTO
    {
        public int? IdPofDetalle { get; set; }
        public int IdMecanizada { get; set; }
        public int IdPOF { get; set; }
        public int? IdSuplenciaPOF { get; set; }
        public DateTime? SupleDesde { get; set; }
        public DateTime? SupleHasta { get; set; }
        public string? NombreSuplencia { get; set; }
        public string? ApellidoSuplencia { get; set; }
    }
}