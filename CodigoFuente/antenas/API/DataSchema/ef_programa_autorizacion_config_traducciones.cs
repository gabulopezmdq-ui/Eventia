using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_autorizacion_config_traducciones : IRegistroUnico
    {
        public long id_programa_autorizacion_config_traduccion { get; set; }

        public long id_programa_autorizacion_config { get; set; }
        public short id_idioma { get; set; }

        public string titulo { get; set; } = null!;
        public string? texto { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_programa_autorizacion_config", "id_idioma" };

        public virtual ef_programa_autorizaciones_config? autorizacion_config { get; set; }
        public virtual ef_idiomas? idioma { get; set; }
    }
}