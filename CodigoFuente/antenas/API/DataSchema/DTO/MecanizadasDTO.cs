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
    public string SinSubvencion { get; set; }
    public string SinHaberes { get; set; }
}


public class MecReporte
{
    public MecanizadasDTO DTO { get; set; }

    public string OrdenPago { get; set; }
    public string NroDiegep { get; set; }
    public string NombrePcia { get; set; }
    public string Subvencion { get; set; }
    public string CantTurnos { get; set; }
    public string CantSecciones { get; set; }
    public string Ruralidad { get; set; }
    public string TipoEst { get; set; }
    public string TipoEstDesc { get; set; }
    public string CarRevista { get; set; }
    public string TipoFuncion { get; set; }
    public string Categoria { get; set; }
    public int? CantHsCs { get; set; }
    public int? MesAntiguedad { get; set; }
    public int? AnioAntiguedad { get; set; }
    public string AnioMesAfectacion { get; set; }
    public string CodigoLiquidacionNumero { get; set; }
    public string CodigoLiquidacionDescripcion { get; set; }
     public decimal? Importe { get; set; }
    public string Signo { get; set; }
    public string SinSubvencion { get; set; }
    public string SinHaberes { get; set; }

}

public class MecReportePersona
{
    public string OrdenPago { get; set; }
    public string DNI { get; set; }
    public string Nombre { get; set; }
    public string Apellido { get; set; }
    public string Secuencia { get; set; }
    public string Categoria { get; set; }
    public int? CantHsCs { get; set; }
    public int? MesAntiguedad { get; set; }
    public int? AnioAntiguedad { get; set; }
    public string AnioMesAfectacion { get; set; }
    public string TipoFuncion { get; set; }
    public string CarRevista { get; set; }

    public string NroDiegep { get; set; }
    public string NombrePcia { get; set; }
    public string Subvencion { get; set; }
    public string CantTurnos { get; set; }
    public string CantSecciones { get; set; }
    public string Ruralidad { get; set; }
    public string TipoEst { get; set; }
    public string TipoEstDesc { get; set; }
    public decimal Neto { get; set; }
    public string SinSubvencion { get; set; }
    public string SinHaberes { get; set; }
    public List<CodigoLiquidacionDTO> CodigosLiquidacionDetallados { get; set; } = new();
    public List<CodigoLiquidacionDTO> TotalesPorConcepto { get; set; } = new();
}

public class CodigoLiquidacionDTO
{
    public string Codigo { get; set; }
    public string Descripcion { get; set; }
    public decimal Importe { get; set; }
    public string Signo { get; set; }
    public string Patronal { get; set; }
    public string ConAporte { get; set; }
    public int? Docentes { get; set; }
    public decimal? CAportes { get; set; }
    public decimal? SAportes { get; set; }
    public decimal? Salario { get; set; }
    public decimal? totalIps { get; set; }
    public string AnioMesAfectacion { get; set; }
}


public class CodigoLiqResumenDTO
{
    public string Codigos { get; set; }
    public string Descripciones { get; set; }
    public decimal Importes { get; set; }
    public string Signos { get; set; }
    public string Patronales { get; set; }
    public string ConAportes { get; set; }
}
public class MecReporteRespuestaDTO
{
    public List<MecReportePersona> Personas { get; set; }
    public List<CodigoLiquidacionDTO> TotalesPorConcepto { get; set; }
    public int TotalPersonas { get; set; }
    public decimal TotalConAporte { get; set; }
    public decimal TotalSinAporte { get; set; }
    public decimal TotalSalario { get; set; }
    public decimal TotalIps { get; set; }
    public decimal OSPatronal { get; set; }
    public decimal OSPersonal { get; set; }
    public decimal ImporteNeto { get; set; }
    public decimal TotalSinAportesEnPesos { get; set; }
    public decimal TotalDescuentos { get; set; }
    public decimal TotalIpsPatronal { get; set; }
    public decimal TotalIpsSac { get; set; }
}

public class ConsolidarRequest
{
    public int IdCabecera { get; set; }
    public int IdEstablecimiento { get; set; }
    public int Usuario { get; set; }

    public List<RetencionDTO> Retenciones { get; set; }
}

public class RetencionDTO
{
    public int IdRetencion { get; set; }
    public string Descripcion { get; set; }
    public decimal Importe { get; set; }
}

