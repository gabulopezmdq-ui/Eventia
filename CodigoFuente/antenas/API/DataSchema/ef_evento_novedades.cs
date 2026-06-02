using System;

namespace API.DataSchema
{
    public class ef_evento_novedades
    {
        public long id_novedad { get; set; }
        public long id_evento { get; set; }
        public long id_tipo_novedad_evento { get; set; }

        public string titulo { get; set; }
        public string descripcion { get; set; }

        public bool importante { get; set; }
        public DateTime? visible_desde { get; set; }
        public DateTime? visible_hasta { get; set; }

        public bool publicado { get; set; }
        public bool activo { get; set; }

        public long? id_usuario_alta { get; set; }
        public DateTime fecha_alta { get; set; }
        public DateTime? fecha_modif { get; set; }
    }
}