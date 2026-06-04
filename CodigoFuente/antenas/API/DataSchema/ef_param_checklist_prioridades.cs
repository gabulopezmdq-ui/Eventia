using System;

namespace API.DataSchema
{
    public class ef_param_checklist_prioridades
    {
        public long id_checklist_prioridad { get; set; }
        public string codigo { get; set; }
        public short orden { get; set; }
        public bool activo { get; set; }
        public DateTime fecha_alta { get; set; }
        public DateTime? fecha_modif { get; set; }
    }
}