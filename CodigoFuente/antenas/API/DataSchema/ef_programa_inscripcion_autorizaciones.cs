using System;

public class ef_programa_inscripcion_autorizaciones
{
    public long id_inscripcion_autorizacion { get; set; }

    public long id_inscripcion { get; set; }
    public long? id_rsvp_grupo_integrante { get; set; }

    public long id_programa_autorizacion_config { get; set; }

    public string codigo { get; set; } = null!;
    public string texto_aceptado { get; set; } = null!;

    public bool aceptada { get; set; }

    public DateTimeOffset fecha_aceptacion { get; set; }

    public string? nombre_firmante { get; set; }
    public string? ip_aceptacion { get; set; }

    public bool activo { get; set; }

    public DateTimeOffset fecha_alta { get; set; }
    public DateTimeOffset? fecha_modif { get; set; }
}