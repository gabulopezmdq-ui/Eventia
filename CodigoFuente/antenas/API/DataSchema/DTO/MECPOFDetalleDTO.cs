using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

namespace API.DataSchema.DTO
{
    public class MECPOFDetalleDTO
    {
        public int IdPOF { get; set; }
        public int IdEstablecimiento { get; set; }
        public int IdPersona { get; set; }
        public int IdCategoria { get; set; }
        public int IdCarRevista { get; set; }
        public int IdTipoFuncion { get; set; }
        public string Secuencia { get; set; }
        public string Barra { get; set; }
        public string TipoCargo { get; set; }
        public string Vigente { get; set; }
        public string CarRevista { get; set; }
        public string Cargo { get; set; }

        public string Funcion { get; set; }
        public string Categoria { get; set; }

        // Datos MEC_POF_Detalle

        public string? MesLiquidacion { get; set; }
        public string? AnioLiquidacion { get; set; }
        public string? SinHaberes { get; set; }
        public string? NoSubvencionado { get; set; }
        public decimal? CantHorasCS { get; set; }
        public decimal? CantHorasSS { get; set; }

        // Datos de Persona
        public string PersonaDNI { get; set; }
        public string PersonaApellido { get; set; }
        public string PersonaNombre { get; set; }

        // Datos de MEC_Mecanizadas
        public string MecanizadaAnioAfeccion { get; set; }
        public string MecanizadaMesAfeccion { get; set; }
        public string MecanizadaCodigoLiquidacion { get; set; }
        public string MecanizadaOrigen { get; set; }

        public bool TieneAntiguedad { get; set; }

        public int? MesReferencia { get; set; }
        public int? AnioReferencia { get; set; }
        public int? MesAntiguedad { get; set; }
        public int? AnioAntiguedad { get; set; }
    }

    public class POFDetalleReporteDTO
    {
        public int IdPOF { get; set; }
        public int? CantHorasCS { get; set; }
        public int? CantHorasSS { get; set; }
        public int? AntiguedadAnios { get; set; }
        public int? AntiguedadMeses { get; set; }
        public string? SinHaberes { get; set; }
        public string? NoSubvencionado { get; set; }
        public int? SupleA { get; set; }
        public DateTime? SupleDesde { get; set; }
        public DateTime? SupleHasta { get; set; }
    }

}
