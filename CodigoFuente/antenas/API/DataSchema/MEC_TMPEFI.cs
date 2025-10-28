using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_TMPEFI
    {
        public int IdTMPEFI { get; set; }
        public int IdCabecera { get; set; }
        public string? Documento { get; set; }       
        public string? Apellido { get; set; }       
        public string? Nombre { get; set; }         
        public string? Legajo { get; set; }         
        public string? Secuencia { get; set; }      
        public string? TipoCargo { get; set; }     
    }
}
