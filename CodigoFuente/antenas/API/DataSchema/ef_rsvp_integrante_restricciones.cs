using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_rsvp_integrante_restricciones
    {
        public long id_rsvp_grupo_integrante { get; set; }
        public long id_restriccion_alim { get; set; }
        public DateTime fecha_alta { get; set; }
        public string? observaciones { get; set; }
        public string? severidad { get; set; }
        public ef_rsvp_grupo_integrantes ef_rsvp_grupo_integrantes { get; set; } = null!;
        public ef_param_restricciones_alimentarias ef_param_restricciones_alimentarias { get; set; } = null!;
    }
}
