using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using API.DataSchema;

public class InasistenciasDTO
{
    public int DNI { get; set; }
    public int NroLegajo { get; set; }
    public int NroCargo { get; set; }
    public string CodDepend { get; set; }
    public int CodGrupo { get; set; }
    public int CodNivel { get; set; }
    public int Modulo { get; set; }
    public int Cargo { get; set; }
    public DateTime FecNoved { get; set; }
    public int CodLicen { get; set; }
    public int Cantidad { get; set; }
    public int Horas { get; set; }
}

public class DevolverEst
{
    public int IdCabecera { get; set; }
    public int Usuario { get; set; }
    public string MotivoRechazo { get; set; }
}
public class InasistenciaCabeceraDTO
{
    public int IdInasistenciaCabecera { get; set; }
    public int IdEstablecimiento { get; set; }
    public int IdCabecera { get; set; }
    public int Confecciono { get; set; }
    public int? Mes { get; set; }
    public int? Anio { get; set; }
    public DateTime? FechaApertura { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public string SinNovedades { get; set; }
    public string Observaciones { get; set; }
    public string Estado { get; set; }

    public List<InasistenciaDetalleDto> Detalle { get; set; }
    public List<InasistenciaRechazoDto> Rechazos { get; set; }
}

public class InasistenciaDetalleDto
{
    public int IdDetalle { get; set; }
    public int IdInasistenciaCabecera { get; set; }
    // Agrega aquí los campos relevantes del detalle
    public string Campo1 { get; set; }
    public string Campo2 { get; set; }
    // ...
}

public class InasistenciaRechazoDto
{
    public int IdRechazo { get; set; }
    public int IdInasistenciaCabecera { get; set; }
    public string MotivoRechazo { get; set; }
    public DateTime FechaRechazo { get; set; }
    public int UsuarioRechazo { get; set; }
    // Otros campos que necesites
}
public class DetalleRechazos
{
    public List<MEC_InasistenciasDetalle> Detalles { get; set; }
    public List<MEC_InasistenciasRechazo> Rechazos { get; set; }
}