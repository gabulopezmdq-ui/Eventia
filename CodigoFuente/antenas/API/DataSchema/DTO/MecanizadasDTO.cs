using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
public class MecanizadasDTO
{
    public int IdMecanizada { get; set; }
    public DateTime? FechaConsolidacion { get; set; }
    public int? IdUsuario { get; set; }
    public int? IdCabecera { get; set; }
    public string MesLiquidacion { get; set; }
    public string OrdenPago { get; set; }
    public string AnioMesAfectacion { get; set; }
    public int IdEstablecimiento { get; set; }
    public int? IdPOF { get; set; }
    public decimal? Importe { get; set; }
    public string Signo { get; set; }
    public string MarcaTransferido { get; set; }
    public string Moneda { get; set; }
    public string RegimenEstatutario { get; set; }
    public string Dependencia { get; set; }
    public string Distrito { get; set; }
    public string Subvencion { get; set; }
    public string Origen { get; set; }
    public string Consolidado { get; set; }
    public string CodigoLiquidacion { get; set; }
    public string DNI { get; set; }
    public string Secuencia { get; set; }
    public string TipoCargo { get; set; }
    public string Nombre { get; set; }
    public string Apellido { get; set; }
}
