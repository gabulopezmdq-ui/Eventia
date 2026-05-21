using System;

namespace API.DataSchema
{
    public class ef_evento_portal_fotos
    {
        public long id_portal_foto { get; set; }
        public long id_evento { get; set; }
        public string? titulo { get; set; }
        public string? descripcion { get; set; }
        public string url_foto { get; set; } = null!;
        public DateOnly? fecha_foto { get; set; }
        public bool visible_portal { get; set; } = true;
        public bool activo { get; set; } = true;
        public long? id_usuario_carga { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_usuarios? usuario_carga { get; set; }
    }
}
