using System.Collections.Generic;
using System.Security.Principal;
using API.DataSchema.Interfaz;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace API.DataSchema
{
    public class MEC_InasistenciasCodigos 
    {
        public int IdInasistenciasCodigo { get; set; }
        public string? CodLicencia { get; set; }
        public string? Descripcion { get; set; }
        public int? CodPeriodo { get; set; }
        public int? CodForma { get; set; }
        public string? MesCierre { get; set; }
        public string? CodUnidad { get; set; }
        public int? CodGrupo { get; set; }
        public string? Habicorr { get; set; }
        public int? Certificado { get; set; }
        public int? AltaEven { get; set; }
        public int? CodAmbito { get; set; }
        public int? CodTipo { get; set; }
        public int? Solicitud { get; set; }
        public int? DescNoved { get; set; }
        public int? DescSaldo { get; set; }
        public string? Vigente { get; set; }

    }   
}
