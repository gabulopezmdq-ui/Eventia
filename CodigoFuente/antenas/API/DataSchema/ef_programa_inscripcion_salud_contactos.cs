using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripcion_salud_contactos : IRegistroUnico
    {
        public long id_contacto_emergencia { get; set; }

        public long id_salud_ficha { get; set; }

        public string nombre { get; set; } = null!;
        public string telefono { get; set; } = null!;
        public string? relacion { get; set; }

        public int orden { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_programa_inscripcion_salud_fichas? salud_ficha { get; set; }
    }
}