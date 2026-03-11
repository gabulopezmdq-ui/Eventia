using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_b2b_prospectos_hist : IRegistroUnico
    {
        public long id_hist { get; set; }
        public long id_prospecto { get; set; }

        public DateTimeOffset fecha { get; set; }
        public long? id_usuario { get; set; }

        public string tipo { get; set; } = null!;
        public string detalle { get; set; } = null!;

        public string? estado_nuevo { get; set; }
        public DateTimeOffset? proximo_contacto { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();
    }
}