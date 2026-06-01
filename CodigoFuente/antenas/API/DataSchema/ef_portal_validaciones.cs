using System;

namespace API.DataSchema
{
    public class ef_portal_validaciones
    {
        public long id_portal_validacion { get; set; }
        public string token_consulta { get; set; } = null!;
        public string codigo { get; set; } = null!;
        public string canal { get; set; } = null!;
        public string destino { get; set; } = null!;
        public bool validado { get; set; }
        public DateTimeOffset fecha_expiracion { get; set; }
        public DateTimeOffset? fecha_validacion { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
    }
}
