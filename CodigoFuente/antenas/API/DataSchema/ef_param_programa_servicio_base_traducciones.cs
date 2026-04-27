using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_programa_servicio_base_traducciones : IRegistroUnico
    {
        public long id_servicio_base_traduccion { get; set; }

        public long id_servicio_base { get; set; }
        public short id_idioma { get; set; }

        public string nombre { get; set; } = null!;
        public string? descripcion { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_servicio_base", "id_idioma" };

        public virtual ef_param_programa_servicios_base? servicio_base { get; set; }
        public virtual ef_idiomas? idioma { get; set; }
    }
}