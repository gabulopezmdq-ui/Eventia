using API.DataSchema.Interfaz;
using System;
using System.Collections.Generic;

namespace API.DataSchema
{
    public class ef_param_restricciones_alimentarias
    {
        public long id_restriccion_alim { get; set; }

        public string codigo { get; set; } = null!;

        public bool activo { get; set; } = true;

        public int orden { get; set; } = 1;

        public string categoria { get; set; } = "OTRA";

        public string icon_key { get; set; } = "GENERIC";

        public bool requiere_alerta_visual { get; set; } = true;

        public bool requiere_confirmacion_organizador { get; set; } = false;

        public bool es_alergeno { get; set; } = false;
    }
}