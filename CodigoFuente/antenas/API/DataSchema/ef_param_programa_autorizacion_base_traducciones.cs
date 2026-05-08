using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_programa_autorizacion_base_traducciones : IRegistroUnico
    {
        public long id_autorizacion_base_traduccion { get; set; }
        public long id_autorizacion_base { get; set; }
        public short id_idioma { get; set; }

        public string titulo { get; set; } = null!;
        public string? texto { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_autorizacion_base", "id_idioma" };

        public virtual ef_param_programa_autorizaciones_base? autorizacion_base { get; set; }
        public virtual ef_idiomas? idioma { get; set; }
    }
}