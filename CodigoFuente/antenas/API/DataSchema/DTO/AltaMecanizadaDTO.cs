public class AltaMecanizadaDTO
{
    // Datos para MEC_POFDetalle
    public int IdCabecera { get; set; }
    public int IdPOF { get; set; }
    public int? CantHorasCS { get; set; }
    public int? CantHorasSS { get; set; }
    public int? AntiguedadAnios { get; set; }
    public int? AntiguedadMeses { get; set; }
    public string SinHaberes { get; set; }
    public string NoSubvencionado { get; set; }

    // Datos para MEC_POF_Antiguedades
    public int MesReferencia { get; set; }
    public int AnioReferencia { get; set; }
    public int AnioAntiguedad { get; set; }
    public int MesAntiguedad { get; set; }

    // Datos para MEC_Mecanizadas
    public int IdEstablecimiento { get; set; }
    public int AnioAfectacion { get; set; }
    public int MesAfectacion { get; set; }
}
