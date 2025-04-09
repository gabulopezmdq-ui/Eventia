using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class SuplentesDTO
    {
        public int IdMecanizada { get; set; }
        public int IdPOF { get; set; }
        public int? IdPOFDetalle { get; set; }
        public int? IdSuplenciaPOF { get; set; }
        public DateTime? SupleDesde { get; set; }
        public DateTime? SupleHasta { get; set; }

        public string NombreSuplente { get; set; }
        public string ApellidoSuplente { get; set; }
        public string NombreSuplantado { get; set; }
        public string ApellidoSuplantado { get; set; }
    }

}