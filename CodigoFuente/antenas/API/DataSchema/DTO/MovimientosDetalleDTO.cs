using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

public class MovimientosDetalleDTO
{
    // Datos de la cabecera
    public int IdMovimientoCabecera { get; set; }
    public string? Observaciones { get; set; }
    public string? Estado { get; set; }

    // Campos del detalle 
    public int? IdMovimientoDetalle { get; set; }
    public int? IdTipoFuncion { get; set; }
    public int? IdPOF { get; set; }
    public int? IdTipoCategoria { get; set; }
    public int? IdMotivoBaja { get; set; }
    public string TipoDoc { get; set; }
    public string TipoMovimiento { get; set; }
    public string NumDoc { get; set; }
    public string Apellido { get; set; }
    public string Nombre { get; set; }
    public string SitRevista { get; set; }
    public string Turno { get; set; }
    public string? ObservacionDetalle { get; set; }
    public int? AntigAnios { get; set; }
    public int? AntigMeses { get; set; }
    public int? Horas { get; set; }
    public DateTime? FechaInicioBaja { get; set; }
    public DateTime? FechaFinBaja { get; set; }
    public string? Decrece { get; set; }
    public int? HorasDecrece { get; set; }

    //dato Usuario
    public string? Usuario { get; set; }
}
public class DetalleReporteDTO
{
    // Datos comunes
    public string Usuario { get; set; }
    public string NombrePersona { get; set; }
    public string ApellidoPersona { get; set; }

    // Lista de detalles
    public List<MovimientosDetalleDTO> Detalles { get; set; } = new();
}
