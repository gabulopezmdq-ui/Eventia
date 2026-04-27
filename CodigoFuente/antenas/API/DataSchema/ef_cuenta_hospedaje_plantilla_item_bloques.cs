using System;

namespace API.DataSchema
{
    public class ef_cuenta_hospedaje_plantilla_item_bloques
    {
        public long id_bloque { get; set; }
        public long id_hospedaje_plantilla_item { get; set; }

        public string? nombre_reserva { get; set; }
        public string? codigo_promocional { get; set; }
        public DateTime? fecha_limite_reserva { get; set; }
        public string? condiciones { get; set; }
        public string? url_bloque { get; set; }

        public bool activo { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public ef_cuenta_hospedaje_plantilla_items? item { get; set; }
    }
}