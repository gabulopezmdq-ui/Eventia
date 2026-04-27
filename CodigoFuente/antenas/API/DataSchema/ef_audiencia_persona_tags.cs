using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_audiencia_persona_tags : IRegistroUnico
    {
        public long id_audiencia_persona_tag { get; set; }
        public long id_audiencia_persona { get; set; }
        public string tag_tipo { get; set; } = null!;
        public string tag_valor { get; set; } = null!;
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_audiencias_personas? audiencia_persona { get; set; }
    }
}