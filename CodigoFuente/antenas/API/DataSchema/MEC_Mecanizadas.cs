using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class MEC_Mecanizadas
    {
        public int IdMecanizada { get; set; }
        public DateTime? FechaConsolidacion { get; set; }
        public int? IdUsuario { get; set; }
        public int IdCabecera { get; set; }
        public string MesLiquidacion { get; set; }
        public string? OrdenPago { get; set; }
        public string? AnioMesAfectacion { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdPOF { get; set; }
        public decimal? Importe { get; set; }
        public string? CodigoLiquidacion { get; set; }
        public string? Signo { get; set; }
        public string? MarcaTransferido { get; set; }
        public string? Moneda { get; set; }
        public string? RegimenEstatutario { get; set; }
        public string? Dependencia { get; set; }
        public string? Distrito { get; set; }
        public string? Subvencion { get; set; }
        public string? Origen { get; set; }
        public string? Consolidado { get; set; }

        public bool? Excluir { get; set; }

        // Propiedades de navegación
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }
        public virtual MEC_Establecimientos? Establecimiento { get; set; }
        public virtual MEC_POF? POF { get; set; }
        public virtual MEC_Usuarios? Usuario { get; set; }

    }
}
