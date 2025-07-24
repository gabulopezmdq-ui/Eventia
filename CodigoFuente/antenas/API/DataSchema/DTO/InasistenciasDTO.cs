using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
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