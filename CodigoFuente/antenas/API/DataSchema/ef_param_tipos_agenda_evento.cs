using System;

namespace API.DataSchema
{
    public class ef_param_tipos_agenda_evento
    {
        public long id_tipo_agenda_evento { get; set; }
        public string codigo { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; }
        public DateTime fecha_alta { get; set; }
        public DateTime? fecha_modif { get; set; }
    }
}