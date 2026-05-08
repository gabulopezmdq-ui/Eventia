using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_programa_inscripciones : IRegistroUnico
    {
        public long id_inscripcion { get; set; }

        public long id_evento { get; set; }
        public long? id_acceso { get; set; }
        public long? id_acceso_link { get; set; }

        public long? id_rsvp_grupo { get; set; }

        public long? id_invitado_responsable { get; set; }
        public long? id_audiencia_persona_responsable { get; set; }

        public string responsable_nombre { get; set; } = null!;
        public string responsable_apellido { get; set; } = null!;
        public string? responsable_email { get; set; }
        public string? responsable_telefono { get; set; }
        public string? responsable_documento { get; set; }
        public string? responsable_relacion { get; set; }

        public string? firma_nombre { get; set; }
        public DateOnly? firma_fecha { get; set; }

        public string estado { get; set; } = "BORRADOR";

        public short? id_idioma { get; set; }

        public string moneda { get; set; } = "EUR";
        public decimal total_base { get; set; }
        public decimal total_servicios { get; set; }
        public decimal total_general { get; set; }

        public string? token_consulta { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_confirmacion { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "id_rsvp_grupo" };

        public virtual ef_eventos? evento { get; set; }
        public virtual ef_evento_accesos? acceso { get; set; }
        public virtual ef_evento_acceso_links? acceso_link { get; set; }
        public virtual ef_rsvp_grupos? rsvp_grupo { get; set; }
        public virtual ef_invitados? invitado_responsable { get; set; }
        public virtual ef_audiencias_personas? audiencia_persona_responsable { get; set; }
        public virtual ef_idiomas? idioma { get; set; }
    }
}