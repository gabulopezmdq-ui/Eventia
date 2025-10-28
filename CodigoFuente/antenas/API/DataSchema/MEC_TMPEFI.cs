using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

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
        public string? Cargo { get; set; }
        public string? Caracter { get; set; }
        public string? Funcion { get; set; }
        public string? UE { get; set; }
        public int? Barra { get; set; }
        public string? Estado { get; set; }

        // Propiedad de navegación
        [ForeignKey(nameof(IdCabecera))]
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }

    }
}
