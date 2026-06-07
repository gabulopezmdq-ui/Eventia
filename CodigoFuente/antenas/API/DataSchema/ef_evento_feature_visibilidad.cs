using System;

namespace API.DataSchema
{
    public class ef_evento_feature_visibilidad
    {
        public long id_evento_feature_visibilidad { get; set; }
        public long id_evento { get; set; }
        public long id_feature { get; set; }

        public bool? visible_acceso_evento { get; set; }
        public bool? visible_centro_evento { get; set; }
        public bool? visible_acceso_programa { get; set; }
        public bool? visible_centro_programa { get; set; }

        public DateTime fecha_alta { get; set; }
        public DateTime? fecha_modif { get; set; }
    }
}