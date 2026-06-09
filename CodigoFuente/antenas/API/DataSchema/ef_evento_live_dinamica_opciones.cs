using System;

namespace API.DataSchema
{
    public class ef_evento_live_dinamica_opciones
    {
        public long id_opcion { get; set; }
        public long id_dinamica { get; set; }
        public string texto { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public string? imagen_url { get; set; }
        public int orden { get; set; }
        public bool es_correcta { get; set; }
        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }
    }
}