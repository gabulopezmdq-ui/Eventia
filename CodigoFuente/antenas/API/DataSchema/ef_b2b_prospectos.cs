using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_b2b_prospectos : IRegistroUnico
    {
        public long id_prospecto { get; set; }

        public string nombre_apellido { get; set; } = null!;
        public string empresa_nombre { get; set; } = null!;
        public string ciudad { get; set; } = null!;
        public string pais { get; set; } = "AR";

        public string? email { get; set; }
        public string? whatsapp { get; set; }
        public int? eventos_por_mes { get; set; }

        public string origen { get; set; } = "LANDING_MODAL";

        public string? campania_fuente { get; set; }
        public string? campania_medio { get; set; }
        public string? campania_nombre { get; set; }
        public string? campania_contenido { get; set; }
        public string? campania_termino { get; set; }

        public string? pagina_origen { get; set; }
        public string? referer { get; set; }

        public string estado { get; set; } = "NUEVO";
        public string? nota_interna { get; set; }

        public long? id_usuario_asignado { get; set; }
        public DateTimeOffset? proximo_contacto { get; set; }

        public bool activo { get; set; } = true;
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();
    }
}
