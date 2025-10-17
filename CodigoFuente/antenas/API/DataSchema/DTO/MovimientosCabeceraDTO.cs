using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

public class MovimientosCabeceraDTO
{
    public int IdMovimientoDetalle { get; set; }
    public int IdMovimientoCabecera { get; set; }
    public int IdTipoFuncion { get; set; }
    public int IdPOF { get; set; }
    public int IdTipoCategoria { get; set; }
    public int IdMotivoBaja { get; set; }
    public string TipoDoc { get; set; }
    public string TipoMovimiento { get; set; }
    public string NumDoc { get; set; }
    public string Apellido { get; set; }
    public string Nombre { get; set; }
    public string SitRevista { get; set; }
    public string Turno { get; set; }
    public string? Observaciones { get; set; }
    public int AntigAnios { get; set; }
    public int AntigMeses { get; set; }
    public int Horas { get; set; }
    public DateTime FechaInicioBaja { get; set; }
    public DateTime FechaFinBaja { get; set; }
}

public class DevolverMov
{
    public int IdCabecera { get; set; }
    public string? Observaciones { get; set; }
}