using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_evento_beneficios_registro : IRegistroUnico
    {
        public long id_beneficio_registro { get; set; }

        public long id_evento { get; set; }
        public long id_invitado { get; set; }
        public long id_acceso_link { get; set; }
        public long id_tipo_beneficio_registro { get; set; }

        public string titulo_snapshot { get; set; } = null!;
        public string? descripcion_snapshot { get; set; }

        public string estado { get; set; } = null!; // G/C/V/A
        public string? codigo_canje { get; set; }

        public DateTimeOffset fecha_otorgado { get; set; }
        public DateTimeOffset? fecha_canje { get; set; }
        public DateTimeOffset? fecha_vencimiento { get; set; }

        public long? id_usuario_valida { get; set; }
        public string? observaciones { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_invitados? invitado { get; set; }
        public virtual ef_evento_acceso_links? acceso_link { get; set; }
        public virtual ef_param_tipos_beneficio_registro? tipo_beneficio_registro { get; set; }
        public virtual ef_usuarios? usuario_valida { get; set; }
    }
}