using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.DataSchema
{
    public enum AccesoTipo { PROGRAMA, EVENTO }
    public class PortalAcceso
    {
        [Key] public long IdPortalAcceso { get; set; }
        [ForeignKey(nameof(PortalPersona))]
        public long IdPortalPersona { get; set; }
        public PortalPersona PortalPersona { get; set; }
        [Required, MaxLength(100)] public string TokenConsulta { get; set; }   // token del portal puntual (string de 32 chars)
        [Required] public AccesoTipo Tipo { get; set; }
        public long IdEvento { get; set; }          // FK a ef_eventos
        public long IdInscripcion { get; set; }     // FK a ef_programa_inscripciones
        public long? IdInvitado { get; set; }       // nullable
        public long? GrupoId { get; set; }          // opcional, para agrupar visualmente
        [MaxLength(150)] public string TituloOverride { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime FechaAlta { get; set; } = DateTime.UtcNow;
        public DateTime? FechaModif { get; set; }
    }
}
