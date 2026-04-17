using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_audiencia_persona_eventos : IRegistroUnico
    {
        public long id_audiencia_persona_evento { get; set; }
        public long id_audiencia_persona { get; set; }
        public long id_evento { get; set; }
        public long? id_unidad { get; set; }
        public long? id_invitado { get; set; }
        public long? id_acceso { get; set; }
        public long? id_acceso_link { get; set; }
        public string? origen_registro { get; set; }
        public bool registrado { get; set; }
        public bool asistio { get; set; }
        public bool beneficio_otorgado { get; set; }
        public bool beneficio_canjeado { get; set; }
        public DateTimeOffset fecha_registro { get; set; }
        public DateTimeOffset? fecha_asistencia { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_audiencias_personas? audiencia_persona { get; set; }
        public virtual ef_eventos? evento { get; set; }
        public virtual ef_cuenta_unidades? unidad { get; set; }
        public virtual ef_invitados? invitado { get; set; }
        public virtual ef_evento_accesos? acceso { get; set; }
        public virtual ef_evento_acceso_links? acceso_link { get; set; }
    }
}