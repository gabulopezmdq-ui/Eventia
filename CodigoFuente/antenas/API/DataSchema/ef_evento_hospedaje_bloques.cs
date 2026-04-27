using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_evento_hospedaje_bloques : IRegistroUnico
    {
        public long id_bloque { get; set; }
        public long id_hospedaje { get; set; }

        public string? nombre_reserva { get; set; }
        public string? codigo_promocional { get; set; }
        public DateTime? fecha_limite_reserva { get; set; }
        public string? condiciones { get; set; }
        public string? url_bloque { get; set; }

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_evento_hospedajes? hospedaje { get; set; }
    }
}