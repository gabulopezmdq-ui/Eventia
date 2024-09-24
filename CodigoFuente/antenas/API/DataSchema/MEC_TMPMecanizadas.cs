using System;

namespace API.DataSchema
{
    public class MEC_TMPMecanizadas
    {

        public int idTMPMecanizada { get; set; }
        public int idCabecera { get; set; }
        public DateTime? FechaImportacion { get; set; }
        public string MesLiquidacion { get; set; }
        public string OrdenPago { get; set; }
        public string AnioMesAfectacion { get; set; }
        public string Documento { get; set; }
        public string Secuencia { get; set; }
        public string Funcion { get; set; }
        public string CodigoLiquidacion { get; set; }
        public decimal Importe { get; set; }
        public string Signo { get; set; }
        public string MarcaTransferido { get; set; }
        public string Moneda { get; set; }
        public string RegimenEstatutario { get; set; }
        public string CaracterRevista { get; set; }
        public string Dependencia { get; set; }
        public string Distrito { get; set; }
        public string TipoOrganizacion { get; set; }
        public string NroEstab { get; set; }
        public string Categoria { get; set; }
        public string TipoCargo { get; set; }
        public decimal? HorasDesignadas { get; set; }
        public string Subvencion { get; set; }
        public string RegistroValido { get; set; }
        public virtual MEC_CabeceraLiquidacion? Cabecera { get; set; }


    }
}
