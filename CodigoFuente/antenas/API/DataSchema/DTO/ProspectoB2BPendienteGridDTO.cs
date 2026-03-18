using System;

namespace API.DataSchema.DTO
{
    public class ProspectoB2BPendienteGridDTO
    {
        public long id_prospecto { get; set; }
        public DateTimeOffset fecha_alta { get; set; }

        public string estado { get; set; } = null!;
        public string empresa_nombre { get; set; } = null!;
        public string nombre_apellido { get; set; } = null!;
        public string ciudad { get; set; } = null!;
        public string pais { get; set; } = null!;

        public string? whatsapp { get; set; }
        public string? email { get; set; }
        public int? eventos_por_mes { get; set; }

        public DateTimeOffset? proximo_contacto { get; set; }

        public long? id_usuario_asignado { get; set; }
        public string? asignado_nombre { get; set; }
        public string? asignado_email { get; set; }
    }
}
